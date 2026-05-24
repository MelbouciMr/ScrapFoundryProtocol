'use strict';

const { Router }  = require('express');
const contracts   = require('../contracts/bounty');
const gitlawb     = require('../services/gitlawb');
const store       = require('../store');
const logger      = require('../logger');

const router = Router();

router.get('/', async (_req, res) => {
  const checks = {};

  // Chain connectivity
  try {
    await contracts.provider().getBlockNumber();
    checks.chain = 'ok';
  } catch (e) {
    checks.chain = `error: ${e.message}`;
  }

  // Contract reachability
  try {
    const stats = await contracts.getProtocolStats();
    checks.contract = { ok: true, totalBounties: stats.total.toString() };
  } catch (e) {
    checks.contract = `error: ${e.message}`;
  }

  // Gitlawb node
  try {
    await gitlawb.health();
    checks.gitlawb = 'ok';
  } catch (e) {
    checks.gitlawb = `unreachable: ${e.message}`;
  }

  checks.coordinatorChallenges = store.list().length;

  const allOk = checks.chain === 'ok' && checks.contract?.ok === true;
  res.status(allOk ? 200 : 503).json({ status: allOk ? 'ok' : 'degraded', checks });
});

module.exports = router;
