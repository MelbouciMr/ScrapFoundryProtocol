'use strict';

/**
 * On-chain event listeners for GitlawbBounty.
 *
 * Watches for BountyClaimed, BountySubmitted, BountyCompleted,
 * BountyCancelled, and BountyDisputed events and drives the
 * coordinator state machine.
 */

const contracts  = require('../contracts/bounty');
const store      = require('../store');
const validator  = require('../services/validator');
const gitlawb    = require('../services/gitlawb');
const logger     = require('../logger');

function start() {
  const bounty = contracts.bountyContract();

  // ── BountyClaimed ──────────────────────────────────────────────────────────
  bounty.on('BountyClaimed', (bountyId, agent, agentDid) => {
    logger.info('BountyClaimed', { bountyId: bountyId.toString(), agent, agentDid });

    const entry = store.getByBountyId(bountyId);
    if (!entry) {
      logger.warn('BountyClaimed for unknown bountyId', { bountyId: bountyId.toString() });
      return;
    }
    store.upsert(entry.challengeId, { status: 'claimed', agentDid });
  });

  // ── BountySubmitted ────────────────────────────────────────────────────────
  bounty.on('BountySubmitted', async (bountyId, agent, prId) => {
    logger.info('BountySubmitted', { bountyId: bountyId.toString(), agent, prId });

    const entry = store.getByBountyId(bountyId);
    if (!entry) {
      logger.warn('BountySubmitted for unknown bountyId', { bountyId: bountyId.toString() });
      return;
    }

    store.upsert(entry.challengeId, { status: 'submitted', prId });

    try {
      const claim = await contracts.getBountyClaim(bountyId);

      const prContent = await gitlawb.fetchPR(
        claim.repoOwner,
        claim.repoName,
        prId
      );

      const { valid, reason } = await validator.validateSubmission({
        challengeId: entry.challengeId,
        bountyId,
        agentDid: claim.agentDid,
        prId,
        prContent,
      });

      if (valid) {
        logger.info('Submission valid — approving bounty', {
          bountyId: bountyId.toString(),
          reason,
        });
        await contracts.approveBounty(bountyId);
        store.upsert(entry.challengeId, { status: 'completed' });
      } else {
        logger.warn('Submission rejected', {
          bountyId: bountyId.toString(),
          reason,
        });
        // Do not approve. Bounty deadline will expire and anyone can
        // call disputeBounty() to re-open it, or the coordinator can:
        // await contracts.disputeBounty(bountyId);
      }
    } catch (err) {
      logger.error('Error handling BountySubmitted', {
        bountyId: bountyId.toString(),
        error: err.message,
        stack: err.stack,
      });
    }
  });

  // ── BountyCompleted ────────────────────────────────────────────────────────
  bounty.on('BountyCompleted', (bountyId, agent, amount) => {
    logger.info('BountyCompleted', {
      bountyId: bountyId.toString(),
      agent,
      amount: amount.toString(),
    });

    const entry = store.getByBountyId(bountyId);
    if (entry) store.upsert(entry.challengeId, { status: 'completed' });
  });

  // ── BountyCancelled ────────────────────────────────────────────────────────
  bounty.on('BountyCancelled', (bountyId) => {
    logger.info('BountyCancelled', { bountyId: bountyId.toString() });

    const entry = store.getByBountyId(bountyId);
    if (entry) store.upsert(entry.challengeId, { status: 'cancelled' });
  });

  // ── BountyDisputed (re-opened) ─────────────────────────────────────────────
  bounty.on('BountyDisputed', (bountyId) => {
    logger.info('BountyDisputed — bounty re-opened', { bountyId: bountyId.toString() });

    const entry = store.getByBountyId(bountyId);
    if (entry) store.upsert(entry.challengeId, { status: 'open', agentDid: null, prId: null });
  });

  logger.info('Event listeners attached to GitlawbBounty');
}

module.exports = { start };
