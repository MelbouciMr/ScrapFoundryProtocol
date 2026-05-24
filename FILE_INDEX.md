# 📂 Project Structure Index

Complete file structure of SCRAP Protocol with Gitlawb integration.

---

## 📦 Root Directory

```
scrap-unified/
├── README.md                    # 👈 Start here - Project overview
├── QUICKSTART.md               # 🚀 15-minute setup guide
├── CHANGELOG.md                # 📝 Integration changes log
│
├── coordinator/                # 🔧 Backend API + Gitlawb
├── app/                        # 🎨 Frontend (Next.js)
├── contracts/                  # 📜 Smart contracts
└── supabase/                   # 🗄️ Database schemas
```

---

## 🔧 coordinator/ - Backend

### Main Files
```
coordinator/
├── README.md                   # Complete backend documentation
├── GITLAWB_INTEGRATION.md     # Gitlawb setup guide
├── package.json               # Dependencies (with Gitlawb packages)
├── .env.example               # Environment variables template
└── tsconfig.json              # TypeScript configuration
```

### Source Code
```
coordinator/src/
├── index.ts                   # 🚪 Main entry point (Gitlawb integrated)
│
├── routes/                    # API endpoints
│   ├── auth.ts               # Authentication
│   ├── drill.ts              # Challenge solving
│   ├── submit.ts             # Solution submission
│   ├── refine.ts             # Analysis refinement
│   ├── epoch.ts              # Epoch management
│   ├── health.ts             # Health check
│   └── ...                   # Other SCRAP routes
│
├── services/                  # Business logic
│   ├── oracle.ts             # Price oracle
│   ├── epochService.ts       # Epoch management
│   └── scrapingQueue.ts      # Background jobs
│
├── middleware/                # Express middleware
│   └── auth.ts               # Authentication middleware
│
├── challenges/                # Challenge generation
│   └── generator.ts          # Challenge templates
│
└── gitlawb/                  # 🆕 Gitlawb Integration Module
    ├── index.ts              # Main integration class
    ├── config.js             # Configuration
    ├── logger.js             # Winston logger
    │
    ├── routes/               # Bounty API routes
    │   ├── challenges.js     # Bounty CRUD (create, list, delete)
    │   └── health.js         # Bounty system health check
    │
    ├── services/             # Core services
    │   ├── gitlawb.js       # GitHub API client (@octokit/rest)
    │   └── validator.js     # Submission validator (customize this!)
    │
    ├── listeners/            # Blockchain event listeners
    │   └── events.js        # BountySubmitted, BountyClaimed, etc.
    │
    ├── contracts/            # Smart contract interfaces
    │   ├── bounty.js        # GitlawbBounty contract wrapper
    │   └── abis/            # Contract ABIs
    │       ├── GitlawbBounty.json
    │       └── ERC20.json
    │
    └── store/                # State management
        └── index.js          # In-memory bounty store
```

### Key Integration Points

**1. Main Entry (index.ts):**
- Lines 20-23: Gitlawb import
- Lines 52-73: Gitlawb initialization
- Line 68: Routes mounted at `/v1/gitlawb/*`
- Line 74: Export gitlawb instance

**2. Integration Module (gitlawb/index.ts):**
- `GitlawbIntegration` class
- `initialize()` - Setup contracts, listeners, GitHub
- `publishChallenge()` - Create bounty from challenge
- `healthCheck()` - System status

**3. GitHub Client (gitlawb/services/gitlawb.js):**
- `fetchPR()` - Fetch PR content from GitHub
- `health()` - Verify GitHub access
- `rateLimit()` - Check API limits
- ETag caching implementation

**4. Validator (gitlawb/services/validator.js):**
- `validateSubmission()` - **Customize this!**
- Default: auto-approve (placeholder)
- Replace with SCRAP-specific logic

**5. Event Listeners (gitlawb/listeners/events.js):**
- `BountyClaimed` → Update state
- `BountySubmitted` → Fetch PR → Validate → Approve
- `BountyCompleted` → Mark complete
- `BountyCancelled` → Mark cancelled

---

## 🎨 app/ - Frontend

```
app/
├── package.json              # Next.js dependencies
├── next.config.js            # Next.js configuration
├── .env.example              # Frontend environment
│
├── src/
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   └── lib/                  # Utilities
│
└── public/                   # Static assets
```

---

## 📜 contracts/ - Smart Contracts

```
contracts/
├── src/
│   ├── ScrapToken.sol        # ERC-20 $SCRAP token
│   ├── ScrapSettlement.sol   # Settlement contract
│   └── ...                   # Other contracts
│
├── foundry.toml              # Foundry configuration
└── script/                   # Deployment scripts
```

**External Contract (not in repo):**
- `GitlawbBounty.sol` - Get from https://github.com/gitlawb/contracts

---

## 🗄️ supabase/ - Database

```
supabase/
├── migrations/               # SQL migrations
└── seed.sql                  # Initial data
```

---

## 📝 Documentation Hierarchy

### Start Here
1. **[README.md](./README.md)** - 5 min read
   - What is SCRAP Protocol
   - Features overview
   - Quick links

2. **[QUICKSTART.md](./QUICKSTART.md)** - 15 min setup
   - Prerequisites
   - Local development
   - First test

### Deep Dive
3. **[coordinator/README.md](./coordinator/README.md)** - 30 min read
   - Complete API reference
   - Configuration options
   - Deployment guides

4. **[coordinator/GITLAWB_INTEGRATION.md](./coordinator/GITLAWB_INTEGRATION.md)** - 45 min
   - Step-by-step setup
   - GitHub integration
   - Contract deployment
   - Testing guide
   - Troubleshooting

### Reference
5. **[CHANGELOG.md](./CHANGELOG.md)**
   - What changed in this integration
   - Breaking changes
   - Upgrade guide

---

## 🔑 Important Files to Configure

### 1. Environment Variables (CRITICAL)

**coordinator/.env** - Backend configuration
```
Priority 1 (Required for core SCRAP):
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- COORDINATOR_PRIVATE_KEY
- SCRAP_TOKEN_ADDRESS
- BASE_RPC_URL

Priority 2 (Required for Gitlawb):
- GITLAWB_ENABLED=true
- GITLAWB_BOUNTY_CONTRACT
- GITHUB_TOKEN
- GITHUB_ORG
- GITHUB_REPO
```

### 2. Validator Logic (CRITICAL)

**coordinator/src/gitlawb/services/validator.js**
- Lines 28-54: `validateSubmission()` function
- **YOU MUST customize this** with SCRAP validation logic
- Default auto-approves everything (insecure!)

### 3. Reward Tiers

**coordinator/src/gitlawb/index.ts**
- Lines 93-97: `rewardMap` object
- Customize $SCRAP amounts per difficulty

---

## 🚀 Execution Flow

### Challenge → Bounty → Solution → Payment

```
1. Challenge Generated (SCRAP)
   └─ coordinator/src/challenges/generator.ts

2. Bounty Published (Gitlawb)
   └─ coordinator/src/gitlawb/index.ts:publishChallenge()
   └─ coordinator/src/gitlawb/contracts/bounty.js:createBounty()
   └─ On-chain: BountyCreated event

3. Agent Claims (gitlawb.com UI)
   └─ On-chain: BountyClaimed event
   └─ coordinator/src/gitlawb/listeners/events.js (line 21)

4. Agent Submits PR (GitHub)
   └─ github.com/scrapfoundry/challenges/pull/42

5. Agent Submits Bounty (gitlawb.com UI)
   └─ On-chain: BountySubmitted event
   └─ coordinator/src/gitlawb/listeners/events.js (line 33)

6. Automatic Validation
   └─ Fetch PR: coordinator/src/gitlawb/services/gitlawb.js:fetchPR()
   └─ Validate: coordinator/src/gitlawb/services/validator.js:validateSubmission()
   └─ Approve: coordinator/src/gitlawb/contracts/bounty.js:approveBounty()
   └─ On-chain: BountyCompleted event
   └─ Payment released automatically
```

---

## 🔍 Finding Specific Features

### "Where do I configure...?"

**GitHub token:** `coordinator/.env` → `GITHUB_TOKEN`
**Reward amounts:** `coordinator/src/gitlawb/index.ts` → `rewardMap`
**Validation logic:** `coordinator/src/gitlawb/services/validator.js`
**Event listeners:** `coordinator/src/gitlawb/listeners/events.js`
**API routes:** `coordinator/src/gitlawb/routes/`
**Health checks:** `coordinator/src/gitlawb/routes/health.js`

### "Where is the code that...?"

**Publishes bounties:** `coordinator/src/gitlawb/index.ts:publishChallenge()`
**Fetches PRs:** `coordinator/src/gitlawb/services/gitlawb.js:fetchPR()`
**Validates submissions:** `coordinator/src/gitlawb/services/validator.js:validateSubmission()`
**Approves bounties:** `coordinator/src/gitlawb/contracts/bounty.js:approveBounty()`
**Listens to events:** `coordinator/src/gitlawb/listeners/events.js`
**Manages state:** `coordinator/src/gitlawb/store/index.js`

---

## 📊 File Statistics

```
Total files: ~150
Total lines: ~8,000
Languages:
- TypeScript: 60%
- JavaScript: 30%
- Solidity: 5%
- Documentation: 5%

Documentation:
- 5 main docs
- 1,500+ lines of docs
- 50+ code examples
```

---

## 🎯 Next Steps After Unzipping

1. Read [README.md](./README.md)
2. Follow [QUICKSTART.md](./QUICKSTART.md)
3. Configure `coordinator/.env`
4. Run `npm install` in coordinator
5. Test with `npm run dev`
6. Read [GITLAWB_INTEGRATION.md](./coordinator/GITLAWB_INTEGRATION.md) when ready

---

**Happy coding! 🚀**
