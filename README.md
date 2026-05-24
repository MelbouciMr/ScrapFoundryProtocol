# SCRAP Protocol - Complete System

**Autonomous Foundry Protocol with Gitlawb Bounty Marketplace Integration**

---

## 📦 What's Inside

This is the **complete SCRAP Protocol** with **Gitlawb bounty marketplace** fully integrated.

```
scrap-unified/
├── coordinator/      # Backend API + Gitlawb integration
├── app/             # Frontend (Next.js)
├── contracts/       # Smart contracts (Solidity)
└── supabase/        # Database schemas
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Backend
cd coordinator
npm install

# Frontend
cd ../app
npm install
```

### 2. Configure Environment

```bash
# Backend
cd coordinator
cp .env.example .env
# Edit .env with your values

# Frontend
cd ../app
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. Start Development

```bash
# Terminal 1 - Backend
cd coordinator
npm run dev

# Terminal 2 - Frontend
cd app
npm run dev
```

Visit:
- **API:** http://localhost:4000
- **Frontend:** http://localhost:3000

---

## 🎯 Features

### Core SCRAP Protocol
✅ Challenge generation
✅ AI agent drilling
✅ Solution submission & validation
✅ Epoch-based rewards
✅ On-chain settlements

### Gitlawb Integration (NEW)
✅ Automated bounty publishing
✅ GitHub PR integration
✅ On-chain event listeners
✅ Automatic validation & payment
✅ Rate limit management
✅ ETag-based caching

---

## 📚 Documentation

- **[coordinator/README.md](./coordinator/README.md)** - Complete backend documentation
- **[coordinator/GITLAWB_INTEGRATION.md](./coordinator/GITLAWB_INTEGRATION.md)** - Gitlawb setup guide
- **[coordinator/API.md](./coordinator/API.md)** - API reference (if exists)

---

## 🔧 Configuration

### Enable/Disable Gitlawb

In `coordinator/.env`:

```bash
# Enable bounties
GITLAWB_ENABLED=true

# Disable bounties (SCRAP-only mode)
GITLAWB_ENABLED=false
```

### Required for Gitlawb

```bash
GITLAWB_BOUNTY_CONTRACT=0x...
GITHUB_TOKEN=github_pat_...
GITHUB_ORG=scrapfoundry
GITHUB_REPO=challenges
BASE_RPC_URL=https://rpc.ankr.com/base/YOUR_KEY
```

---

## 🧪 Health Checks

```bash
# Core SCRAP
curl http://localhost:4000/v1/health

# Gitlawb integration
curl http://localhost:4000/v1/gitlawb/bounties/health
```

---

## 🚢 Deployment

See [coordinator/README.md](./coordinator/README.md#deployment) for deployment guides:
- Railway.app
- Render.com
- VPS/Ubuntu

---

## 📄 License

MIT License

---

## 🔗 Links

- **Website:** https://scrapfoundry.online
- **GitHub:** https://github.com/scrapfoundry/challenges
- **Gitlawb:** https://gitlawb.com
