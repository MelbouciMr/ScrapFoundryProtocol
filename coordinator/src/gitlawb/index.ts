/**
 * Gitlawb Integration Module
 * 
 * Integrates SCRAP Protocol with Gitlawb bounty marketplace
 * - Publishes challenges as bounties
 * - Validates submissions via GitHub API
 * - Approves bounties on-chain
 */

import { Router } from 'express';

// Import Gitlawb modules (CommonJS)
const gitlawbConfig = require('./config');
const gitlawbLogger = require('./logger');
const gitlawbContracts = require('./contracts/bounty');
const gitlawbEvents = require('./listeners/events');
const gitlawbStore = require('./store');

// Import routes
const challengesRouter = require('./routes/challenges');
const healthRouter = require('./routes/health');

export interface GitlawbConfig {
  enabled: boolean;
  rpcUrl: string;
  bountyContract: string;
  scrapToken: string;
  coordinatorPrivateKey: string;
  githubToken: string;
  githubOrg: string;
  githubRepo: string;
}

export class GitlawbIntegration {
  private config: GitlawbConfig;
  private initialized = false;

  constructor(config: GitlawbConfig) {
    this.config = config;
  }

  /**
   * Initialize Gitlawb integration
   * - Connects to Base network
   * - Starts event listeners
   * - Verifies contract access
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('🔕 Gitlawb integration disabled');
      return;
    }

    try {
      // Initialize contract connections
      gitlawbContracts.init();

      // Verify chain connectivity
      const block = await gitlawbContracts.provider().getBlockNumber();
      console.log(`✅ Connected to Base network - Block: ${block}`);

      // Start on-chain event listeners
      gitlawbEvents.start();
      console.log('👂 Gitlawb event listeners started');

      // Verify GitHub access
      const gitlawb = require('./services/gitlawb');
      await gitlawb.health();
      console.log('✅ GitHub API connection verified');

      this.initialized = true;
      console.log('🎯 Gitlawb integration initialized successfully');
    } catch (error: any) {
      console.error('❌ Gitlawb initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Get Express router for Gitlawb routes
   */
  getRouter(): Router {
    const router = Router();

    // Mount Gitlawb routes
    router.use('/bounties', challengesRouter);
    router.use('/bounties/health', healthRouter);

    return router;
  }

  /**
   * Publish a SCRAP challenge as a Gitlawb bounty
   */
  async publishChallenge(params: {
    challengeId: string;
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    description: string;
  }) {
    if (!this.initialized) {
      throw new Error('Gitlawb integration not initialized');
    }

    const rewardMap = {
      easy: '1000',
      medium: '5000',
      hard: '25000'
    };

    const reward = rewardMap[params.difficulty];
    const repoName = `challenge-${params.challengeId}`;

    try {
      const bountyId = await gitlawbContracts.createBounty({
        repoName,
        issueId: params.challengeId,
        title: params.title,
        rewardWhole: reward
      });

      gitlawbStore.upsert(params.challengeId, {
        bountyId,
        repoName,
        title: params.title,
        reward,
        status: 'open',
        difficulty: params.difficulty,
        createdAt: new Date().toISOString()
      });

      console.log(`✅ Published challenge ${params.challengeId} as bounty ${bountyId}`);

      return {
        challengeId: params.challengeId,
        bountyId: bountyId.toString(),
        reward: `${reward} $SCRAP`,
        status: 'open'
      };
    } catch (error: any) {
      console.error(`❌ Failed to publish challenge ${params.challengeId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get bounty status for a challenge
   */
  getBountyStatus(challengeId: string) {
    return gitlawbStore.get(challengeId);
  }

  /**
   * List all bounties
   */
  listBounties(filter?: { status?: string }) {
    return gitlawbStore.list().filter((b: any) => 
      !filter?.status || b.status === filter.status
    );
  }

  /**
   * Check if integration is healthy
   */
  async healthCheck() {
    if (!this.initialized) {
      return { status: 'disabled' };
    }

    try {
      const gitlawb = require('./services/gitlawb');
      const [github, rateLimit] = await Promise.all([
        gitlawb.health(),
        gitlawb.rateLimit()
      ]);

      const block = await gitlawbContracts.provider().getBlockNumber();

      return {
        status: 'healthy',
        github: {
          connected: github.ok,
          repo: github.repo,
          rateLimit: {
            remaining: rateLimit.remaining,
            limit: rateLimit.limit,
            resetAt: rateLimit.resetAt
          }
        },
        blockchain: {
          network: 'Base',
          latestBlock: block,
          bountyContract: this.config.bountyContract,
          scrapToken: this.config.scrapToken
        },
        bounties: {
          total: gitlawbStore.list().length,
          open: gitlawbStore.list().filter((b: any) => b.status === 'open').length,
          completed: gitlawbStore.list().filter((b: any) => b.status === 'completed').length
        }
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

export default GitlawbIntegration;
