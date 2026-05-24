# 🏭 SCRAP Protocol — Complete Deployment Guide

> **Written from the actual source code.** Every command, every env var, every file path in this guide matches your real project at `scrap/scrap-unified/`.

---

## ⚠️ BEFORE YOU START — READ THIS

| Fact | Detail |
|------|--------|
| **Real project path** | `C:\___PROYECTOS_LARPS\scrap\scrap-unified\` |
| **Contract toolchain** | Hardhat (NOT Foundry) |
| **Contracts that exist** | `ScrapToken.sol`, `ScrapSettlement.sol` |
| **Node.js version required** | 20.x |
| **All WSL commands run in** | WSL2 terminal (`wsl` from Windows) |

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites & Accounts](#part-1--prerequisites--accounts)
2. [GitHub Repository Setup](#part-2--github-repository-setup)
3. [Supabase Database Setup](#part-3--supabase-database-setup)
4. [Smart Contract Deployment (Base)](#part-4--smart-contract-deployment-base-network)
5. [Backend Deployment (Render.com)](#part-5--backend-deployment-rendercom)
6. [Frontend Deployment (Vercel)](#part-6--frontend-deployment-vercel)
7. [GitHub Org & Challenges Repo](#part-7--github-organization--challenges-repo)
8. [Post-Deployment Configuration](#part-8--post-deployment-configuration)
9. [Production Checklist](#part-9--production-checklist)
10. [Troubleshooting](#part-10--troubleshooting)

---

## PART 1 — Prerequisites & Accounts

### 1.1 Required Accounts

Create accounts (free tier on all) before doing anything else:

| Service | URL | Purpose |
|---------|-----|---------|
| GitHub | https://github.com | Code hosting |
| Render.com | https://render.com | Backend hosting |
| Vercel | https://vercel.com | Frontend hosting |
| Supabase | https://supabase.com | PostgreSQL database |
| Alchemy | https://alchemy.com | Base RPC endpoint |
| Anthropic | https://console.anthropic.com | Claude API (FOREMAN-7) |
| Privy | https://privy.io | Wallet authentication |
| Basescan | https://basescan.org | Contract verification |
| Metals-API | https://metals-api.com | Steel price oracle |

### 1.2 Required API Keys — Where to Get Each

#### GitHub Personal Access Token (Fine-grained)
1. Go to https://github.com/settings/tokens?type=beta
2. Click **"Generate new token"**
3. Name: `scrap-coordinator`
4. Repository access: **Only select repositories** → `scrapfoundry/challenges`
5. Permissions: **Pull requests: Read**, **Contents: Read**
6. Click **Generate token** — copy it immediately (shown once)

#### Supabase Keys
After creating your project (Part 3):
- Go to **Project Settings → API**
- Copy: `Project URL`, `anon public`, `service_role secret`

#### Alchemy RPC URL
1. Create app at https://dashboard.alchemy.com
2. Network: **Base Mainnet**
3. Copy the HTTPS URL — looks like: `https://base-mainnet.g.alchemy.com/v2/YOUR_KEY`

#### Anthropic API Key
1. Go to https://console.anthropic.com/keys
2. Click **Create Key**
3. Name: `scrap-protocol`
4. Copy the `sk-ant-api03-...` key

#### Privy App Credentials
1. Go to https://dashboard.privy.io
2. Create new app → name it `SCRAP Protocol`
3. Settings → Basics → copy **App ID** and **App Secret**
4. Settings → **Login Methods** → enable **Wallet** (and Email if desired)

#### Basescan API Key
1. Register at https://basescan.org/register
2. Go to **My Account → API Keys**
3. Add key named `scrap`

#### Metals-API Key
1. Register at https://metals-api.com
2. Free tier gives 100 requests/month (sufficient for dev)
3. Copy API key from dashboard

### 1.3 Local Setup Requirements

Open WSL2 and verify/install:

```bash
# Check Node.js — must be v20.x
node --version
# If missing or wrong version, install via nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Check npm
npm --version   # should be 10.x

# Check git
git --version   # any recent version

# Install ts-node globally (needed for Hardhat scripts)
npm install -g ts-node typescript
```

---

## PART 2 — GitHub Repository Setup

### 2.1 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `scrap-protocol`
3. Visibility: **Private** (you can make it public later)
4. Do NOT initialize with README (your project already has files)
5. Click **Create repository**
6. Copy the repository URL: `https://github.com/YOUR_USERNAME/scrap-protocol.git`

### 2.2 Create .gitignore

⚠️ **CRITICAL — do this BEFORE the first commit or your private keys will be exposed.**

In WSL2:
```bash
cd /mnt/c/___PROYECTOS_LARPS/scrap/scrap-unified
```

Create `.gitignore` at the project root:
```bash
cat > .gitignore << 'EOF'
# Environment files — NEVER commit these
.env
.env.local
.env.production
.env.*.local
**/.env
**/.env.local
**/.env.production

# Node
node_modules/
**/node_modules/
dist/
**/dist/
.next/
**/.next/

# Hardhat
contracts/artifacts/
contracts/cache/
contracts/typechain-types/

# Keys and secrets
*.pem
*.key
.secret

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/
EOF
```

Verify the .gitignore is correct:
```bash
cat .gitignore
```

### 2.3 Initialize Git and Push

```bash
cd /mnt/c/___PROYECTOS_LARPS/scrap/scrap-unified

# Initialize git
git init

# Stage all files (gitignore will exclude .env files automatically)
git add .

# Verify NO .env files are staged — this must show 0 results
git status | grep "\.env"

# If any .env files appear above — STOP and fix your .gitignore before continuing

# Create first commit
git commit -m "feat: initial SCRAP Protocol commit"

# Add your GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/scrap-protocol.git

# Push
git branch -M main
git push -u origin main
```

### 2.4 Verify

Go to `https://github.com/YOUR_USERNAME/scrap-protocol` and confirm:
- [ ] Code is visible
- [ ] No `.env` files appear anywhere in the file tree
- [ ] `coordinator/.env.example` is present (this is safe — it has no real values)

---

## PART 3 — Supabase Database Setup

### 3.1 Create Supabase Project

1. Go to https://app.supabase.com
2. Click **New project**
3. Organization: your account
4. Project name: `scrap-protocol`
5. Database password: generate a strong one and **save it**
6. Region: choose closest to your users
7. Click **Create new project** — wait ~2 minutes for provisioning

### 3.2 Get Connection Strings

1. Click **Project Settings** (gear icon, bottom left)
2. Click **API**
3. Copy and save these three values:

```
SUPABASE_URL        = https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY   = eyJhbGciOiJIUzI1NiIsInR5cCI...  (long JWT)
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI...  (different long JWT)
```

⚠️ **CRITICAL**: The `service_role` key bypasses Row Level Security. NEVER expose it in frontend code or public repos.

### 3.3 Run Database Schema

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open your local file: `supabase/schema.sql`
4. Copy the ENTIRE contents of that file
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)

You should see: `Success. No rows returned`

### 3.4 Verify Tables Were Created

In the SQL Editor, run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- `agent_messages`
- `agent_plans`
- `agents`
- `batch_jobs`
- `epochs`
- `event_logs`
- `foundries`
- `furnaces`
- `global_events`
- `profiles`
- `scrap_batches`

Also verify seed data:
```sql
SELECT * FROM epochs;
SELECT * FROM global_events;
```
Both should return 1 row each.

### 3.5 Run Protocol Schema (if it exists)

```bash
# Check if there's a second schema file
ls /mnt/c/___PROYECTOS_LARPS/scrap/scrap-unified/supabase/
```

If `protocol_schema.sql` exists, run it in the SQL Editor the same way as step 3.3.

---

## PART 4 — Smart Contract Deployment (Base Network)

⚠️ **CRITICAL**: You need ETH on Base mainnet in your deployer wallet to pay gas fees. Typically ~0.005 ETH is sufficient for both contracts.

### 4.1 Install Dependencies

```bash
cd /mnt/c/___PROYECTOS_LARPS/scrap/scrap-unified/contracts
npm install
```

### 4.2 Configure Wallet

You need two wallets:
1. **Deployer wallet** — pays gas fees, owns the deployed contracts
2. **Coordinator wallet** — signs EIP-712 receipts (can be a different wallet)

⚠️ **NEVER use your main personal wallet as the deployer in production. Create dedicated wallets.**

To create wallets quickly (using Node.js):
```bash
node -e "const {ethers} = require('ethers'); const w = ethers.Wallet.createRandom(); console.log('Address:', w.address, '\nPrivate key:', w.privateKey)"
```
Run this twice — save one as deployer, one as coordinator.

Fund the deployer wallet with ETH on Base mainnet via a bridge or exchange.

### 4.3 Create contracts/.env

```bash
cd /mnt/c/___PROYECTOS_LARPS/scrap/scrap-unified/contracts
cp .env.example .env
```

Edit `contracts/.env` with your real values:
```
DEPLOYER_PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY_HERE
COORDINATOR_ADDRESS=0xYOUR_COORDINATOR_WALLET_ADDRESS_HERE
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY
```

Leave `SCRAP_TOKEN_ADDRESS` blank for now — you'll fill it after step 4.4.

### 4.4 Compile Contracts

```bash
cd /mnt/c/___PROYECTOS_LARPS/scrap/scrap-unified/contracts
npm run compile
```

Expected output:
```
Compiled 2 Solidity files successfully (evm target: paris).
```

### 4.5 Deploy ScrapToken

```bash
cd /mnt/c/___PROYECTOS_LARPS/scrap/scrap-unified/contracts
npm run deploy:token
```

Expected output:
```
Deploying ScrapToken with: 0xYOUR_DEPLOYER_ADDRESS
Balance: 0.01 ETH
✅ ScrapToken deployed to: 0xABCDEF...

Add to .env:
SCRAP_TOKEN_ADDRESS=0xABCDEF...
```

⚠️ **CRITICAL**: Copy the deployed address immediately. You'll need it for every other step.

### 4.6 Update .env with Token Address

Edit `contracts/.env`:
```
SCRAP_TOKEN_ADDRESS=0xABCDEF...   # paste the address from step 4.5
```

### 4.7 Deploy ScrapSettlement

```bash
cd /mnt/c/___PROYECTOS_LARPS/scrap/scrap-unified/contracts
npm run deploy:settlement
```

Expected output:
```
Deploying ScrapSettlement...
  Token:        0xABCDEF...
  Coordinator:  0xYOUR_COORDINATOR_ADDRESS
  Owner:        0xYOUR_DEPLOYER_ADDRESS
✅ ScrapSettlement deployed to: 0x123456...

Add to .env:
SETTLEMENT_CONTRACT_ADDRESS=0x123456...

Verify on Basescan:
npx hardhat verify --network base 0x123456... 0xABCDEF... 0xCOORDINATOR 0xOWNER
```

### 4.8 Verify Contracts on Basescan

Run the exact verify command printed by the deploy script:
```bash
cd /mnt/c/___PROYECTOS_LARPS/scrap/scrap-unified/contracts

# Verify ScrapToken
npx hardhat verify --network base 0xSCRAP_TOKEN_ADDRESS 0xDEPLOYER_ADDRESS

# Verify ScrapSettlement (use the exact command printed in step 4.7)
npx hardhat verify --network base 0xSETTLEMENT_ADDRESS 0xSCRAP_TOKEN_ADDRESS 0xCOORDINATOR_ADDRESS 0xDEPLOYER_ADDRESS
```

Check https://basescan.org/address/0xYOUR_CONTRACT — you should see a green checkmark ✅ and a "Contract" tab with verified source.

### 4.9 Save All Deployed Addresses

Create a file `contracts/DEPLOYED_ADDRESSES.txt`:
```
Network: Base Mainnet (Chain ID: 8453)
Deployed: [DATE]

ScrapToken:       0x...
ScrapSettlement:  0x...
Deployer wallet:  0x...
Coordinator wallet: 0x...
```

⚠️ Do NOT include private keys in this file.

---

## PART 5 — Backend Deployment (Render.com)

### 5.1 Create Render Account & Web Service

1. Go to https://render.com and sign up
2. Click **New +** → **Web Service**
3. Connect your GitHub account if not already connected
4. Select your `scrap-protocol` repository
5. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `scrap-coordinator` |
| **Region** | Oregon (US West) or closest to you |
| **Branch** | `main` |
| **Root Directory** | `coordinator` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node dist/index.js` |
| **Plan** | Free (OK for launch; upgrade if you need no spin-down) |

6. Click **Create Web Service** — do NOT deploy yet, add env vars first.

### 5.2 Add Environment Variables

In Render dashboard → your service → **Environment** tab → add each:

```
PORT                        = 4000
NODE_ENV                    = production

# Supabase
SUPABASE_URL                = https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY   = eyJ...your_service_role_key...

# Coordinator Wallet
COORDINATOR_PRIVATE_KEY     = 0x...your_coordinator_private_key...
COORDINATOR_ADDRESS         = 0x...your_coordinator_address...

# Contracts
SCRAP_TOKEN_ADDRESS         = 0x...ScrapToken_address_from_Part_4...
SCRAP_TOKEN_CONTRACT        = 0x...same_as_above...
SETTLEMENT_CONTRACT_ADDRESS = 0x...ScrapSettlement_address_from_Part_4...

# Chain
CHAIN_ID                    = 8453
RPC_URL                     = https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
BASE_RPC_URL                = https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# APIs
ANTHROPIC_API_KEY           = sk-ant-api03-...
METALS_API_KEY              = your_metals_api_key

# Config
EPOCH_DURATION_SECONDS      = 86400
AUTH_TOKEN_TTL              = 3600
ALLOWED_ORIGINS             = https://your-app.vercel.app,https://scrapfoundry.online

# Gitlawb / GitHub Integration
GITLAWB_ENABLED             = true
GITLAWB_BOUNTY_CONTRACT     = 0x0000000000000000000000000000000000000000
GITLAWB_REPO_OWNER          = scrapfoundry
GITLAWB_NODE_URL            = https://mainnet.base.org
DEFAULT_REWARD_SCRAP        = 1000
LOG_LEVEL                   = info
SCRAP_WEBHOOK_SECRET        = generate_random_32_char_string_here

# GitHub
GITHUB_TOKEN                = github_pat_...your_fine_grained_token...
GITHUB_ORG                  = scrapfoundry
GITHUB_REPO                 = challenges
```

> **Generate SCRAP_WEBHOOK_SECRET**: Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in WSL2

> **ALLOWED_ORIGINS placeholder**: Use `https://scrapfoundry.online` for now. Update after Vercel deploy.

> **GITLAWB_BOUNTY_CONTRACT**: Set to zero address if you haven't deployed the bounty contract yet. The coordinator gracefully skips bounty features in that case.

### 5.3 Deploy Backend

1. Click **Manual Deploy** → **Deploy latest commit**
2. Watch the logs — deployment takes 2-4 minutes
3. Look for: `[SCRAP] Coordinator running on port 4000`

### 5.4 Verify Backend

Your Render URL will look like: `https://scrap-coordinator-xxxx.onrender.com`

Test the health endpoint:
```bash
curl https://scrap-coordinator-xxxx.onrender.com/v1/health
```

Expected: `{"status":"ok"}` or similar JSON response.

⚠️ **Free tier spin-down**: On Render's free tier, the service sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds. Upgrade to Starter ($7/mo) to avoid this for production.

---

## PART 6 — Frontend Deployment (Vercel)

### 6.1 Create Vercel Account & Import Project

1. Go to https://vercel.com and sign up (use GitHub login)
2. Click **Add New** → **Project**
3. Import your `scrap-protocol` repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | `app` |
| **Build Command** | `next build` (default) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` (default) |
| **Node.js Version** | 20.x |

5. Do NOT deploy yet — add env vars first.

### 6.2 Add Environment Variables

In Vercel project → **Settings** → **Environment Variables** → add each:

```
NEXT_PUBLIC_SUPABASE_URL        = https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ...your_anon_key...
SUPABASE_SERVICE_ROLE_KEY       = eyJ...your_service_role_key...

NEXT_PUBLIC_PRIVY_APP_ID        = clxxxxxxxxxxxxxxxxxxxxxxxx
PRIVY_APP_SECRET                = your_privy_app_secret

ANTHROPIC_API_KEY               = sk-ant-api03-...

NEXT_PUBLIC_COORDINATOR_URL     = https://scrap-coordinator-xxxx.onrender.com

SCRAP_WEBHOOK_SECRET            = same_value_as_backend

NEXT_PUBLIC_APP_URL             = https://scrapfoundry.online
NEXT_PUBLIC_ROOT_DOMAIN         = scrapfoundry.online
```

> **Privy setup**: In your Privy dashboard, add your Vercel domain (`your-app.vercel.app` and `scrapfoundry.online`) to **Allowed Origins** before deploying.

> **NEXT_PUBLIC_COORDINATOR_URL**: Use the Render URL from Part 5.3.

### 6.3 Deploy Frontend

1. Click **Deploy**
2. Build takes 2-4 minutes
3. Vercel gives you a URL like `https://scrap-protocol-xxxx.vercel.app`

### 6.4 Verify Frontend

1. Visit `https://scrap-protocol-xxxx.vercel.app`
2. The site should load (may have placeholder state if no wallet connected)
3. Open browser DevTools → Console — look for any red errors
4. Try connecting a wallet via Privy

### 6.5 Custom Domain (Optional)

1. In Vercel → **Settings** → **Domains**
2. Add `scrapfoundry.online`
3. Add the DNS records shown by Vercel to your domain registrar
4. Wait for DNS propagation (up to 24 hours)

---

## PART 7 — GitHub Organization & Challenges Repo

### 7.1 Create GitHub Organization

1. Go to https://github.com/organizations/new
2. Organization name: `scrapfoundry`
3. Plan: Free
4. Finish setup

### 7.2 Create Challenges Repository

1. In the `scrapfoundry` org, click **New repository**
2. Repository name: `challenges`
3. Visibility: **Public** (agents need to read it)
4. Initialize with a README: ✅ yes
5. Click **Create repository**

### 7.3 Initialize Repository Structure

```bash
# Clone the repo
git clone https://github.com/scrapfoundry/challenges.git
cd challenges

# Create challenge folder structure
mkdir -p challenges/001-first-challenge

cat > challenges/001-first-challenge/README.md << 'EOF'
# Challenge 001 — First Challenge

## Objective
[Describe what the AI agent must accomplish]

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Evaluation Criteria
- Correctness: 60%
- Efficiency: 40%

## Reward
1000 $SCRAP

## Submission
Submit via Pull Request to this repository.
EOF

git add .
git commit -m "feat: add first challenge"
git push origin main
```

### 7.4 Verify GitHub Token Access

```bash
# Test your fine-grained token can read the repo
curl -H "Authorization: Bearer github_pat_YOUR_TOKEN" \
  https://api.github.com/repos/scrapfoundry/challenges
```

Expected: JSON response with repo details (not a 401 or 404).

---

## PART 8 — Post-Deployment Configuration

### 8.1 Update ALLOWED_ORIGINS on Render

Now that you have your Vercel URL:

1. Render dashboard → `scrap-coordinator` → **Environment**
2. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS = https://scrap-protocol-xxxx.vercel.app,https://scrapfoundry.online
   ```
3. Save → service auto-redeploys

### 8.2 Update Privy Allowed Origins

1. Privy dashboard → your app → **Settings**
2. Add your Vercel URLs to **Allowed Origins**:
   - `https://scrap-protocol-xxxx.vercel.app`
   - `https://scrapfoundry.online`

### 8.3 Full Flow Test

Run through this sequence:

```bash
# 1. Health check
curl https://scrap-coordinator-xxxx.onrender.com/v1/health

# 2. Check CORS
curl -H "Origin: https://scrap-protocol-xxxx.vercel.app" \
     https://scrap-coordinator-xxxx.onrender.com/v1/health

# 3. Check Gitlawb routes (if GITLAWB_ENABLED=true)
curl https://scrap-coordinator-xxxx.onrender.com/v1/gitlawb/challenges
```

### 8.4 Test Database Connection

In Supabase → SQL Editor:
```sql
-- Verify the coordinator can write (test via API)
SELECT count(*) FROM profiles;
SELECT count(*) FROM epochs;
```

### 8.5 Create First Test Bounty (Manual)

1. Go to https://gitlawb.com (or the bounty platform)
2. Create a new bounty manually
3. Set the GitHub repo to `scrapfoundry/challenges`
4. Set the challenge to point to `challenges/001-first-challenge`
5. Monitor coordinator logs in Render for Gitlawb integration events

---

## PART 9 — Production Checklist

Go through every item before announcing the launch:

### Security
- [ ] No `.env` files committed to git (run `git log --all -- "**/.env"` — should be empty)
- [ ] `COORDINATOR_PRIVATE_KEY` only in Render env vars, never in code
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only in backend and Vercel server-side vars
- [ ] `PRIVY_APP_SECRET` only in Vercel env vars (not `NEXT_PUBLIC_`)
- [ ] `SCRAP_WEBHOOK_SECRET` set to a random 32+ char string (same value on both services)
- [ ] GitHub token has minimal permissions (PR: Read, Contents: Read only)

### Contracts
- [ ] ScrapToken verified on Basescan ✅
- [ ] ScrapSettlement verified on Basescan ✅
- [ ] Deployed addresses saved in `contracts/DEPLOYED_ADDRESSES.txt`
- [ ] Coordinator wallet has some ETH for future transactions

### Backend
- [ ] Health endpoint returns 200: `GET /v1/health`
- [ ] CORS configured with correct Vercel domain
- [ ] All env vars set in Render (no `undefined` values in logs)
- [ ] Background crons started (check logs for `[SCRAP] Background crons started`)

### Frontend
- [ ] Site loads without console errors
- [ ] Wallet connection works via Privy
- [ ] Coordinator URL is the Render URL (not localhost)
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain

### Database
- [ ] All 11 tables created
- [ ] RLS enabled on all tables
- [ ] Seed data present (1 epoch, 1 global event)
- [ ] `protocol_schema.sql` run if it exists

### GitHub
- [ ] `scrapfoundry` organization created
- [ ] `challenges` repo is public
- [ ] At least one challenge folder with README
- [ ] Fine-grained token scoped to `scrapfoundry/challenges` only

---

## PART 10 — Troubleshooting

### "Module not found" on Render build

**Symptom**: Build fails with `Cannot find module 'xyz'`

**Fix**:
```bash
# Make sure all imports exist in package.json
cd coordinator
npm install
npm run build  # test locally first
```

Check that the failing module is in `dependencies` not `devDependencies` (production builds don't install devDependencies).

---

### CORS error in browser console

**Symptom**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Fix**: In Render env vars, verify `ALLOWED_ORIGINS` contains your exact Vercel URL with no trailing slash:
```
ALLOWED_ORIGINS = https://scrap-protocol-xxxx.vercel.app,https://scrapfoundry.online
```
Redeploy the backend after changing this.

---

### Database connection failure

**Symptom**: Coordinator logs show `Connection refused` or Supabase errors

**Fix**:
1. Verify `SUPABASE_URL` starts with `https://` and has no trailing slash
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is the **service_role** key, not the anon key
3. Check Supabase dashboard — is the project paused? (Free tier pauses after 1 week inactive)
4. Go to Supabase → **Settings** → **Database** → click **Restore** if paused

---

### Contract deployment fails: "insufficient funds"

**Symptom**: `Error: insufficient funds for intrinsic transaction cost`

**Fix**: Send more ETH to your deployer wallet on Base mainnet. Minimum ~0.005 ETH needed.

To check current balance:
```bash
node -e "
const {ethers} = require('ethers');
const p = new ethers.JsonRpcProvider('https://mainnet.base.org');
p.getBalance('0xYOUR_DEPLOYER_ADDRESS').then(b => console.log(ethers.formatEther(b), 'ETH'));
"
```

---

### Contract verification fails

**Symptom**: `Etherscan API returned an unexpected response`

**Fix**:
1. Wait 1 minute after deployment before verifying
2. Make sure `BASESCAN_API_KEY` is set in `contracts/.env`
3. Use the exact arguments from the deploy script output
4. Try manual verification at https://basescan.org/verifyContract

---

### Render service: first request takes 30+ seconds

**Cause**: Free tier spins down after 15 minutes of inactivity. This is normal.

**Fix**: Upgrade to Render Starter ($7/mo) for always-on services. Or set up a cron job to ping the health endpoint every 10 minutes to keep it warm.

---

### Environment variable `undefined` in logs

**Symptom**: Coordinator logs show `[SCRAP] Settlement: undefined`

**Fix**: Check Render environment tab. Variable names are case-sensitive. Redeploy after any env var change (Render auto-redeploys when you save env vars).

---

### Build fails on Vercel: TypeScript errors

**Symptom**: `Type error: Property 'x' does not exist on type 'y'`

**Fix**: Run `npm run build` locally first:
```bash
cd /mnt/c/___PROYECTOS_LARPS/scrap/scrap-unified/app
npm install
npm run build
```
Fix all TypeScript errors locally, push, then redeploy.

---

### Privy wallet connection fails

**Symptom**: Wallet connect button doesn't work, or `Invalid App ID` error

**Fix**:
1. Verify `NEXT_PUBLIC_PRIVY_APP_ID` matches your Privy dashboard
2. In Privy dashboard → Settings → add your Vercel domain to **Allowed Origins**
3. Make sure the `clxxxxxxxx` format ID is correct (not the app name)

---

## 📌 Quick Reference — All Deployed URLs

Fill this in as you deploy:

```
Supabase Project:   https://xxxxxxxxxxxx.supabase.co
Render Backend:     https://scrap-coordinator-xxxx.onrender.com
Vercel Frontend:    https://scrap-protocol-xxxx.vercel.app
Custom Domain:      https://scrapfoundry.online
Challenges Repo:    https://github.com/scrapfoundry/challenges
ScrapToken:         https://basescan.org/address/0x...
ScrapSettlement:    https://basescan.org/address/0x...
```

---

## 📌 Quick Reference — Contract Addresses

```
Network:            Base Mainnet (Chain ID: 8453)
ScrapToken:         0x_____________________________
ScrapSettlement:    0x_____________________________
Deployer:           0x_____________________________
Coordinator:        0x_____________________________
```

---

*Guide generated from actual source code in `scrap/scrap-unified/`. Last updated: 2026-05-24.*
