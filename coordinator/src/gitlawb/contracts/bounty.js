'use strict';

const { ethers } = require('ethers');
const config     = require('../config');
const logger     = require('../logger');
const bountyAbi  = require('./abis/GitlawbBounty.json');
const erc20Abi   = require('./abis/ERC20.json');

let _provider;
let _wallet;
let _bounty;
let _scrap;

function init() {
  _provider = new ethers.JsonRpcProvider(config.BASE_RPC_URL);
  _wallet   = new ethers.Wallet(config.COORDINATOR_PRIVATE_KEY, _provider);
  _bounty   = new ethers.Contract(config.BOUNTY_CONTRACT, bountyAbi, _wallet);
  _scrap    = new ethers.Contract(config.SCRAP_TOKEN,     erc20Abi,  _wallet);

  logger.info('Contracts initialised', {
    bounty: config.BOUNTY_CONTRACT,
    scrap:  config.SCRAP_TOKEN,
    wallet: _wallet.address,
  });
}

function provider() { return _provider; }
function bountyContract() { return _bounty; }

// ── Token helpers ────────────────────────────────────────────────────────────

async function scrapDecimals() {
  return _scrap.decimals();
}

async function ensureAllowance(amountWei) {
  const current = await _scrap.allowance(_wallet.address, config.BOUNTY_CONTRACT);
  if (current >= amountWei) return;

  logger.info('Approving $SCRAP spend', { amount: amountWei.toString() });
  const tx = await _scrap.approve(config.BOUNTY_CONTRACT, amountWei);
  await tx.wait();
  logger.info('Approval confirmed', { txHash: tx.hash });
}

// ── Bounty lifecycle ─────────────────────────────────────────────────────────

/**
 * Publish a SCRAP challenge as an on-chain bounty.
 * Returns the on-chain bountyId (bigint).
 */
async function createBounty({ repoName, issueId, title, rewardWhole }) {
  const decimals  = await scrapDecimals();
  const amountWei = ethers.parseUnits(String(rewardWhole), decimals);

  await ensureAllowance(amountWei);

  logger.info('Creating bounty', { repoName, issueId, title, rewardWhole });

  const tx = await _bounty.createBounty(
    amountWei,
    config.GITLAWB_REPO_OWNER,
    repoName,
    issueId,
    title
  );

  const receipt = await tx.wait();

  // Parse BountyCreated event to extract the bountyId
  const iface    = _bounty.interface;
  const eventLog = receipt.logs
    .map(log => { try { return iface.parseLog(log); } catch { return null; } })
    .find(e => e && e.name === 'BountyCreated');

  if (!eventLog) throw new Error('BountyCreated event not found in receipt');

  const bountyId = eventLog.args.bountyId;
  logger.info('Bounty created', { bountyId: bountyId.toString(), txHash: tx.hash });
  return bountyId;
}

/**
 * Approve a submission and release $SCRAP to the agent.
 */
async function approveBounty(bountyId) {
  logger.info('Approving bounty', { bountyId: bountyId.toString() });
  const tx = await _bounty.approveBounty(bountyId);
  await tx.wait();
  logger.info('Bounty approved', { bountyId: bountyId.toString(), txHash: tx.hash });
  return tx.hash;
}

/**
 * Cancel an unclaimed bounty and refund $SCRAP.
 */
async function cancelBounty(bountyId) {
  logger.info('Cancelling bounty', { bountyId: bountyId.toString() });
  const tx = await _bounty.cancelBounty(bountyId);
  await tx.wait();
  logger.info('Bounty cancelled', { bountyId: bountyId.toString(), txHash: tx.hash });
  return tx.hash;
}

/**
 * Re-open a bounty whose submission deadline was missed.
 * Anyone can call this — no privileged access required.
 */
async function disputeBounty(bountyId) {
  logger.info('Disputing bounty', { bountyId: bountyId.toString() });
  const tx = await _bounty.disputeBounty(bountyId);
  await tx.wait();
  logger.info('Bounty disputed / re-opened', { bountyId: bountyId.toString(), txHash: tx.hash });
  return tx.hash;
}

// ── Read helpers ─────────────────────────────────────────────────────────────

async function getBountyCore(bountyId) {
  const [creator, amount, title, status, createdAt, deadline] =
    await _bounty.getBountyCore(bountyId);
  return { creator, amount, title, status: Number(status), createdAt, deadline };
}

async function getBountyClaim(bountyId) {
  const [agentDid, agent, prId, repoOwner, repoName, issueId] =
    await _bounty.getBountyClaim(bountyId);
  return { agentDid, agent, prId, repoOwner, repoName, issueId };
}

async function getProtocolStats() {
  const [total, totalPaid, totalFees] = await _bounty.getProtocolStats();
  return { total, totalPaid, totalFees };
}

module.exports = {
  init,
  provider,
  bountyContract,
  createBounty,
  approveBounty,
  cancelBounty,
  disputeBounty,
  getBountyCore,
  getBountyClaim,
  getProtocolStats,
};
