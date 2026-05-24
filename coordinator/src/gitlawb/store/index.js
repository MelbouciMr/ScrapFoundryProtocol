'use strict';

/**
 * In-memory store mapping SCRAP challenge IDs to bounty state.
 * Replace with a database (Postgres, SQLite, Redis) for production.
 *
 * Shape of each entry:
 * {
 *   challengeId:  string,       // SCRAP challenge ID
 *   bountyId:     bigint|null,  // on-chain bounty ID (set after createBounty tx)
 *   repoName:     string,
 *   title:        string,
 *   reward:       string,       // whole token amount, e.g. "100"
 *   status:       'pending'|'open'|'claimed'|'submitted'|'completed'|'cancelled',
 *   agentDid:     string|null,
 *   prId:         string|null,
 *   createdAt:    Date,
 *   updatedAt:    Date,
 * }
 */

const challenges = new Map();

function upsert(challengeId, patch) {
  const existing = challenges.get(challengeId) || {
    challengeId,
    bountyId: null,
    repoName: null,
    title: null,
    reward: null,
    status: 'pending',
    agentDid: null,
    prId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const updated = { ...existing, ...patch, updatedAt: new Date() };
  challenges.set(challengeId, updated);
  return updated;
}

function get(challengeId) {
  return challenges.get(challengeId) || null;
}

function getByBountyId(bountyId) {
  const id = BigInt(bountyId);
  for (const entry of challenges.values()) {
    if (entry.bountyId === id) return entry;
  }
  return null;
}

function list() {
  return Array.from(challenges.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

module.exports = { upsert, get, getByBountyId, list };
