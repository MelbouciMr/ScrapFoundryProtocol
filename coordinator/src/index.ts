import "dotenv/config";
import express from "express";
import cors from "cors";
import { epochCron } from "./services/epochService";
import { scrapingCron } from "./services/scrapingQueue";

// Routes
import authRouter from "./routes/auth";
import tokenRouter from "./routes/token";
import sitesRouter from "./routes/sites";
import drillRouter from "./routes/drill";
import submitRouter from "./routes/submit";
import refineRouter from "./routes/refine";
import receiptRouter from "./routes/receipt";
import epochRouter from "./routes/epoch";
import creditsRouter from "./routes/credits";
import stakeRouter from "./routes/stake";
import claimRouter from "./routes/claim";
import healthRouter from "./routes/health";

// Gitlawb Integration
import GitlawbIntegration from "./gitlawb";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || "").split(","),
  credentials: true,
}));
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ──────────────────────────────────────────────
app.use("/v1/health",          healthRouter);
app.use("/v1/token",           tokenRouter);
app.use("/v1/auth",            authRouter);
app.use("/v1/sites",           sitesRouter);
app.use("/v1/drill",           drillRouter);
app.use("/v1/submit",          submitRouter);
app.use("/v1/refine",          refineRouter);
app.use("/v1/receipt-calldata",receiptRouter);
app.use("/v1/epoch",           epochRouter);
app.use("/v1/credits",         creditsRouter);
app.use("/v1/claim-calldata",  claimRouter);
app.use("/v1",                 stakeRouter);  // stake/unstake/withdraw

// ─── Gitlawb Integration ─────────────────────────────────
const gitlawb = new GitlawbIntegration({
  enabled: process.env.GITLAWB_ENABLED === 'true',
  rpcUrl: process.env.BASE_RPC_URL || '',
  bountyContract: process.env.GITLAWB_BOUNTY_CONTRACT || '',
  scrapToken: process.env.SCRAP_TOKEN_CONTRACT || '',
  coordinatorPrivateKey: process.env.COORDINATOR_PRIVATE_KEY || '',
  githubToken: process.env.GITHUB_TOKEN || '',
  githubOrg: process.env.GITHUB_ORG || 'scrapfoundry',
  githubRepo: process.env.GITHUB_REPO || 'challenges'
});

// Initialize Gitlawb (async)
if (process.env.GITLAWB_ENABLED === 'true') {
  gitlawb.initialize()
    .then(() => {
      console.log('[GITLAWB] Integration initialized');
      // Mount Gitlawb routes after initialization
      app.use("/v1/gitlawb", gitlawb.getRouter());
    })
    .catch(err => {
      console.error('[GITLAWB] Initialization failed:', err.message);
      console.error('[GITLAWB] Bounty features will be unavailable');
    });
} else {
  console.log('[GITLAWB] Integration disabled (set GITLAWB_ENABLED=true to enable)');
}

// Export gitlawb instance for use in routes
export { gitlawb };

// ─── Background jobs ─────────────────────────────────────
epochCron.start();
scrapingCron.start();
console.log("[SCRAP] Background crons started");

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[SCRAP] Coordinator running on port ${PORT}`);
  console.log(`[SCRAP] Chain ID: ${process.env.CHAIN_ID}`);
  console.log(`[SCRAP] Settlement: ${process.env.SETTLEMENT_CONTRACT_ADDRESS}`);
});

export default app;
