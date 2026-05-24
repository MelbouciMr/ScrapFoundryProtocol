'use strict';

/**
 * Challenge routes
 *
 * POST   /challenges           — SCRAP protocol publishes a new challenge
 * GET    /challenges           — list all challenges
 * GET    /challenges/:id       — get single challenge status
 * DELETE /challenges/:id       — cancel an unclaimed bounty
 */

const { Router } = require('express');
const contracts  = require('../contracts/bounty');
const store      = require('../store');
const config     = require('../config');
const logger     = require('../logger');

const router = Router();

// ── Simple HMAC-style shared-secret auth ─────────────────────────────────────
function authenticated(req, res, next) {
  if (!config.SCRAP_WEBHOOK_SECRET) return next(); // auth disabled
  const secret = req.headers['x-scrap-secret'];
  if (secret !== config.SCRAP_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

// ── POST /challenges ──────────────────────────────────────────────────────────
//
// Body (JSON):
// {
//   "challengeId": "scrap-abc123",   // unique SCRAP challenge ID
//   "title":       "Solve the maze",
//   "repoName":    "maze-challenge",  // Gitlawb repo under GITLAWB_REPO_OWNER
//   "reward":      "200"              // whole $SCRAP tokens (optional — defaults to env)
// }
//
router.post('/', authenticated, async (req, res) => {
  const { challengeId, title, repoName, reward } = req.body;

  if (!challengeId || !title || !repoName) {
    return res.status(400).json({ error: 'challengeId, title, and repoName are required' });
  }

  if (store.get(challengeId)) {
    return res.status(409).json({ error: 'challenge already exists', challengeId });
  }

  const rewardWhole = reward || config.DEFAULT_REWARD;

  // Optimistically write to store before the tx lands
  store.upsert(challengeId, { repoName, title, reward: rewardWhole, status: 'pending' });

  try {
    const bountyId = await contracts.createBounty({
      repoName,
      issueId: challengeId,
      title,
      rewardWhole,
    });

    store.upsert(challengeId, { bountyId, status: 'open' });

    return res.status(201).json({
      challengeId,
      bountyId: bountyId.toString(),
      status: 'open',
      reward: rewardWhole,
    });
  } catch (err) {
    logger.error('createBounty failed', { challengeId, error: err.message });
    store.upsert(challengeId, { status: 'error' });
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /challenges ───────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { status } = req.query;
  let results = store.list();
  if (status) results = results.filter(c => c.status === status);
  return res.json(results.map(serialize));
});

// ── GET /challenges/:id ───────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const entry = store.get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'not found' });
  return res.json(serialize(entry));
});

// ── DELETE /challenges/:id ────────────────────────────────────────────────────
router.delete('/:id', authenticated, async (req, res) => {
  const entry = store.get(req.params.id);
  if (!entry) return res.status(404).json({ error: 'not found' });

  if (!['open', 'error'].includes(entry.status)) {
    return res.status(409).json({
      error: `cannot cancel a bounty in status: ${entry.status}`,
    });
  }

  if (!entry.bountyId) {
    // Never made it on-chain — just remove from store
    store.upsert(req.params.id, { status: 'cancelled' });
    return res.json({ cancelled: true });
  }

  try {
    const txHash = await contracts.cancelBounty(entry.bountyId);
    store.upsert(req.params.id, { status: 'cancelled' });
    return res.json({ cancelled: true, txHash });
  } catch (err) {
    logger.error('cancelBounty failed', { challengeId: req.params.id, error: err.message });
    return res.status(500).json({ error: err.message });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function serialize(entry) {
  return {
    ...entry,
    bountyId: entry.bountyId != null ? entry.bountyId.toString() : null,
  };
}

module.exports = router;
