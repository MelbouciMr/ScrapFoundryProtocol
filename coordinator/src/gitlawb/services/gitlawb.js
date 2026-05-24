'use strict';

/**
 * Thin client for the Gitlawb node HTTP API (port 7545).
 *
 * The node speaks git smart-HTTP, so PR/issue data may need to come via
 * git notes, commit messages, or a side-channel you define in your repo
 * convention (e.g., a JSON file committed to a known path).
 *
 * Update `fetchPR` once you know the exact Gitlawb API shape.
 */

const config = require('../config');
const logger = require('../logger');

const BASE = config.GITLAWB_NODE_URL;

async function get(path) {
  const { default: fetch } = await import('node-fetch');
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Gitlawb HTTP ${res.status} for ${url}`);
  return res.json();
}

/**
 * Health-check the local Gitlawb node.
 */
async function health() {
  return get('/health');
}

/**
 * Fetch PR / submission content from Gitlawb.
 *
 * TODO: replace with the actual Gitlawb REST or GraphQL endpoint once
 * the node API is fully documented. For now we return a stub so the
 * validator can be tested independently.
 *
 * @param {string} repoOwner
 * @param {string} repoName
 * @param {string} prId
 */
async function fetchPR(repoOwner, repoName, prId) {
  logger.debug('Fetching PR from Gitlawb', { repoOwner, repoName, prId });

  try {
    // Attempt a REST-style call — adjust path once API is documented
    return await get(`/repos/${repoOwner}/${repoName}/pulls/${prId}`);
  } catch (err) {
    logger.warn('fetchPR fell back to stub', { error: err.message });
    // Return a stub so downstream validation can still run
    return { repoOwner, repoName, prId, stub: true };
  }
}

module.exports = { health, fetchPR };
