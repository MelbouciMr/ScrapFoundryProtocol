'use strict';

/**
 * SCRAP submission validator.
 *
 * Replace the body of `validateSubmission` with your actual validation logic.
 * The function receives the on-chain bounty details plus the PR content
 * fetched from Gitlawb, and must return { valid: bool, reason: string }.
 *
 * Common validation strategies:
 *   - Run the agent's code in a sandbox and check its output
 *   - Verify a cryptographic proof embedded in the PR description
 *   - Call your SCRAP challenge oracle contract
 *   - Check a test-suite pass/fail result attached to the PR
 */

const logger = require('../logger');

/**
 * @param {object} params
 * @param {string} params.challengeId   - SCRAP challenge ID
 * @param {bigint} params.bountyId      - on-chain bounty ID
 * @param {string} params.agentDid      - agent's DID
 * @param {string} params.prId          - PR/submission identifier
 * @param {object} params.prContent     - raw content fetched from Gitlawb
 * @returns {Promise<{ valid: boolean, reason: string }>}
 */
async function validateSubmission({ challengeId, bountyId, agentDid, prId, prContent }) {
  logger.info('Validating submission', { challengeId, bountyId: bountyId.toString(), agentDid, prId });

  try {
    // ── Insert your validation logic here ───────────────────────────────────
    //
    // Example: call a SCRAP oracle endpoint
    //
    // const res = await fetch(`https://oracle.scrapfoundry.online/validate`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ challengeId, prId, agentDid, prContent }),
    // });
    // const { valid, reason } = await res.json();
    // return { valid, reason };
    //
    // ────────────────────────────────────────────────────────────────────────
    //
    // Placeholder: auto-approve everything (remove for production!)
    logger.warn('Validator is using placeholder logic — auto-approving all submissions');
    return { valid: true, reason: 'placeholder: auto-approved' };

  } catch (err) {
    logger.error('Validation error', { error: err.message });
    return { valid: false, reason: `validation threw: ${err.message}` };
  }
}

module.exports = { validateSubmission };
