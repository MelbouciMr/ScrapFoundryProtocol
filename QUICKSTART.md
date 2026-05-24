# 🚀 Quick Start Guide - SCRAP + Gitlawb

Get SCRAP Protocol with Gitlawb integration running in 15 minutes.

---

## ⚡ Prerequisites Check

```bash
node --version    # Should be 18+
npm --version     # Should be 9+
git --version     # Any recent version
```

---

## 📥 Step 1: Setup (5 min)

### A. Install Backend Dependencies

```bash
cd coordinator
npm install
```

### B. Create Environment File

```bash
cp .env.example .env
```

### C. Configure Minimum Required Variables

Edit `.env` and set these:

```bash
# Minimum for local testing
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_key_here

# For Gitlawb (optional - can test without)
GITLAWB_ENABLED=false  # Set to true when ready
```

---

## 🏃 Step 2: Run Locally (2 min)

```bash
# From coordinator folder
npm run dev
```

You should see:

```
✅ Connected to Base network - Block: 12345678
[SCRAP] Background crons started
[SCRAP] Coordinator running on port 4000
```

---

## ✅ Step 3: Test Health (1 min)

Open new terminal:

```bash
curl http://localhost:4000/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-05-24T..."
}
```

---

## 🎯 Step 4: Enable Gitlawb (7 min)

### A. Create GitHub Token (3 min)

1. Go to https://github.com/settings/tokens?type=beta
2. Click "Generate new token"
3. Configure:
   - Name: "SCRAP Coordinator"
   - Permissions: Pull requests (Read), Contents (Read)
4. Copy token (starts with `github_pat_`)

### B. Update Environment (1 min)

Edit `.env`:

```bash
# Enable Gitlawb
GITLAWB_ENABLED=true

# GitHub integration
GITHUB_TOKEN=github_pat_YOUR_TOKEN_HERE
GITHUB_ORG=scrapfoundry
GITHUB_REPO=challenges

# Blockchain (use public RPC for testing)
BASE_RPC_URL=https://mainnet.base.org
CHAIN_ID=8453

# Contracts (deploy these later)
GITLAWB_BOUNTY_CONTRACT=0x... # Deploy GitlawbBounty.sol
SCRAP_TOKEN_CONTRACT=0x...    # Your $SCRAP token
COORDINATOR_PRIVATE_KEY=0x... # Coordinator wallet
```

### C. Restart Server (1 min)

```bash
# Stop server (Ctrl+C)
npm run dev
```

You should see:

```
✅ Connected to Base network - Block: 12345678
👂 Gitlawb event listeners started
✅ GitHub API connection verified
🎯 Gitlawb integration initialized successfully
[GITLAWB] Integration initialized
```

### D. Test Gitlawb Health (2 min)

```bash
curl http://localhost:4000/v1/gitlawb/bounties/health
```

Expected response:

```json
{
  "status": "healthy",
  "github": {
    "connected": true,
    "repo": "scrapfoundry/challenges",
    "rateLimit": {
      "remaining": 5000,
      "limit": 5000
    }
  },
  "blockchain": {
    "network": "Base",
    "latestBlock": 12345678
  }
}
```

---

## 🎉 Success!

You now have:
- ✅ SCRAP Coordinator running
- ✅ Gitlawb integration enabled
- ✅ GitHub API connected
- ✅ Health checks passing

---

## 🔜 Next Steps

### For Production:

1. **Deploy Contracts** (30 min)
   ```bash
   # See: coordinator/GITLAWB_INTEGRATION.md#step-3
   ```

2. **Setup GitHub Repo** (15 min)
   ```bash
   # See: coordinator/GITLAWB_INTEGRATION.md#step-1
   ```

3. **Create First Bounty** (5 min)
   ```bash
   curl -X POST http://localhost:4000/v1/gitlawb/bounties \
     -H "Content-Type: application/json" \
     -d '{
       "challengeId": "test-001",
       "title": "Test Challenge",
       "repoName": "test",
       "reward": "100"
     }'
   ```

4. **Deploy to Railway/Render** (10 min)
   ```bash
   # See: coordinator/README.md#deployment
   ```

---

## 🆘 Troubleshooting

### "Cannot connect to Base RPC"

**Fix:** Use public RPC for testing:
```bash
BASE_RPC_URL=https://mainnet.base.org
```

### "GitHub health check failed"

**Fix:** Verify token permissions:
- Pull requests: Read ✅
- Contents: Read ✅

### "Gitlawb integration disabled"

**Fix:** Set in `.env`:
```bash
GITLAWB_ENABLED=true
```

---

## 📚 Full Documentation

- **[README.md](./README.md)** - Project overview
- **[coordinator/README.md](./coordinator/README.md)** - Complete backend docs
- **[coordinator/GITLAWB_INTEGRATION.md](./coordinator/GITLAWB_INTEGRATION.md)** - Detailed setup

---

## 💬 Need Help?

- Check health endpoint: `curl http://localhost:4000/v1/health`
- Check Gitlawb health: `curl http://localhost:4000/v1/gitlawb/bounties/health`
- Review logs in terminal
- See troubleshooting section above

---

**You're ready to build! 🚀**
