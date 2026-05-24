'use strict';

require('dotenv').config();

const required = [
  'BASE_RPC_URL',
  'COORDINATOR_PRIVATE_KEY',
  'GITLAWB_BOUNTY_CONTRACT',
  'SCRAP_TOKEN_CONTRACT',
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  BASE_RPC_URL:             process.env.BASE_RPC_URL,
  COORDINATOR_PRIVATE_KEY:  process.env.COORDINATOR_PRIVATE_KEY,
  BOUNTY_CONTRACT:          process.env.GITLAWB_BOUNTY_CONTRACT,
  SCRAP_TOKEN:              process.env.SCRAP_TOKEN_CONTRACT,
  GITLAWB_REPO_OWNER:       process.env.GITLAWB_REPO_OWNER || 'scrapfoundry',
  GITLAWB_NODE_URL:         process.env.GITLAWB_NODE_URL || 'http://localhost:7545',
  DEFAULT_REWARD:           process.env.DEFAULT_REWARD_SCRAP || '100',
  PORT:                     parseInt(process.env.PORT || '3000', 10),
  LOG_LEVEL:                process.env.LOG_LEVEL || 'info',
  SCRAP_WEBHOOK_SECRET:     process.env.SCRAP_WEBHOOK_SECRET || '',
};
