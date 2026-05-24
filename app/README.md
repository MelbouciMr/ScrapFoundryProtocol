# SCRAP Protocol - Frontend

Next.js frontend for SCRAP Protocol with Gitlawb bounty integration.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.local .env.local.example
# Edit .env.local with your values
```

**Required variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_COORDINATOR_URL=http://localhost:4000
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## 📦 Features

### Core Features
- 🔐 Wallet authentication (Privy)
- 📊 Real-time dashboard
- 🤖 Agent management
- 📈 Epoch tracking
- 💰 Token staking

### Gitlawb Integration (NEW)
- 🎯 Bounty marketplace view
- 📋 Active bounties list
- 🔄 Real-time status updates
- 📊 Bounty statistics
- 🔗 Direct links to gitlawb.com

---

## 🎨 New Components

### BountiesPanel
Display active Gitlawb bounties with filters and stats.

**Usage:**
```tsx
import BountiesPanel from "@/components/dashboard/BountiesPanel";

<BountiesPanel />
```

**Features:**
- Filter by status (open, claimed, submitted, completed)
- Real-time updates (10s refresh)
- Difficulty badges
- Reward display
- Status indicators

---

## 📡 API Routes

### GET /api/gitlawb/bounties
Fetch all bounties from coordinator.

**Query params:**
- `status` - Filter by status

**Response:**
```json
[
  {
    "challengeId": "challenge-001",
    "bountyId": "12345",
    "title": "Purity Analysis",
    "reward": "1000",
    "status": "open",
    "difficulty": "easy"
  }
]
```

### POST /api/gitlawb/bounties
Create new bounty (requires auth).

**Body:**
```json
{
  "challengeId": "challenge-001",
  "title": "New Challenge",
  "repoName": "challenge-001",
  "reward": "1000"
}
```

---

## 🔧 Configuration

### Coordinator Connection

The frontend connects to the coordinator backend:

```bash
# Development
NEXT_PUBLIC_COORDINATOR_URL=http://localhost:4000

# Production
NEXT_PUBLIC_COORDINATOR_URL=https://your-coordinator.railway.app
```

### Gitlawb Features

Bounty features are automatically enabled when:
- Coordinator has `GITLAWB_ENABLED=true`
- Coordinator is accessible
- `/v1/gitlawb/bounties` endpoint is available

---

## 📂 Project Structure

```
app/src/
├── app/
│   ├── (landing)/
│   │   └── page.tsx              # Landing page
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Main dashboard
│   │   ├── docs/
│   │   └── login/
│   └── api/
│       └── gitlawb/
│           └── bounties/
│               └── route.ts      # Bounty API endpoint
│
├── components/
│   ├── dashboard/
│   │   ├── BountiesPanel.tsx    # 🆕 Gitlawb bounties
│   │   ├── AgentPanel.tsx
│   │   ├── EpochPanel.tsx
│   │   └── ...
│   └── landing/
│       └── ...
│
└── lib/
    └── ...
```

---

## 🎯 Adding Bounties to Dashboard

Edit `app/(app)/dashboard/page.tsx`:

```tsx
import BountiesPanel from "@/components/dashboard/BountiesPanel";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Existing panels */}
      <AgentPanel />
      <EpochPanel />
      
      {/* NEW: Bounties panel */}
      <BountiesPanel />
    </div>
  );
}
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

```bash
# Required env vars in Vercel:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_COORDINATOR_URL
NEXT_PUBLIC_APP_URL
```

### Railway

```bash
railway up
railway variables set NEXT_PUBLIC_COORDINATOR_URL=https://...
```

### Docker

```bash
docker build -t scrap-frontend .
docker run -p 3000:3000 scrap-frontend
```

---

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 🔗 Environment Variables

### Required
```bash
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anon key
NEXT_PUBLIC_COORDINATOR_URL       # Backend API URL
```

### Optional
```bash
NEXT_PUBLIC_PRIVY_APP_ID          # Privy wallet auth
PRIVY_APP_SECRET                  # Privy secret
ANTHROPIC_API_KEY                 # For LLM features
SCRAP_WEBHOOK_SECRET             # For bounty creation
```

---

## 📚 Documentation

- **Main README**: [../README.md](../README.md)
- **Backend Docs**: [../coordinator/README.md](../coordinator/README.md)
- **Gitlawb Integration**: [../coordinator/GITLAWB_INTEGRATION.md](../coordinator/GITLAWB_INTEGRATION.md)

---

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: React hooks
- **Auth**: Privy
- **Database**: Supabase
- **Blockchain**: ethers.js

---

## 🆘 Troubleshooting

### "Failed to fetch bounties"

**Check:**
1. Coordinator is running: `curl http://localhost:4000/v1/health`
2. Gitlawb enabled in coordinator `.env`
3. `NEXT_PUBLIC_COORDINATOR_URL` is correct

**Fix:**
```bash
# Update frontend .env.local
NEXT_PUBLIC_COORDINATOR_URL=http://localhost:4000
```

### "CORS error"

**Fix:** Coordinator should allow frontend origin:
```bash
# coordinator/.env
ALLOWED_ORIGINS=http://localhost:3000,https://scrapfoundry.online
```

---

## 📄 License

MIT License
