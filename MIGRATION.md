# Migration Guide - SCRAP v2.0 Clean

## ✅ Changes Made

### 🧹 Cleanup - Removed

#### Bankr References (ELIMINATED)
- ❌ `coordinator/src/services/foreman.ts` - Removed Bankr LLM Gateway
- ❌ `app/src/lib/claude/agent.ts` - Removed Bankr API calls
- ❌ `coordinator/.env.example` - Removed BANKR_API_KEY
- ❌ `app/.env.local` - Removed BANKR_API_KEY
- ❌ All documentation references to Bankr

#### SMELT Branding (ELIMINATED)
- ❌ All references updated from SMELT → SCRAP
- ❌ Domains updated: smelt.world → scrapfoundry.online
- ❌ Token names updated: $SMELT → $SCRAP
- ❌ Variable names: SMELT_TOKEN → SCRAP_TOKEN

---

### ✨ Additions - New Features

#### 1. Frontend - Gitlawb Integration
**New Components:**
- ✅ `app/src/components/dashboard/BountiesPanel.tsx`
  - Real-time bounty display
  - Filter by status
  - Statistics dashboard
  - Difficulty badges
  - Direct links to gitlawb.com

**New API Routes:**
- ✅ `app/src/app/api/gitlawb/bounties/route.ts`
  - GET /api/gitlawb/bounties - Fetch bounties
  - POST /api/gitlawb/bounties - Create bounty

**New Documentation:**
- ✅ `app/README.md` - Complete frontend guide
  - Component usage
  - API documentation
  - Deployment instructions

#### 2. Backend - Direct Anthropic Integration
**Updated Files:**
- ✅ `coordinator/src/services/foreman.ts`
  - Direct Anthropic API
  - No third-party gateway
  - Standard API format

- ✅ `app/src/lib/claude/agent.ts`
  - Anthropic API client
  - Proper error handling
  - Mock mode fallback

#### 3. Environment Variables - Simplified
**coordinator/.env.example:**
```bash
# REMOVED
- BANKR_API_KEY

# ADDED
+ ANTHROPIC_API_KEY
+ GITLAWB_ENABLED
+ GITHUB_TOKEN
+ GITHUB_ORG
+ GITHUB_REPO

# RENAMED
- SMELT_TOKEN_ADDRESS → SCRAP_TOKEN_ADDRESS
- RPC_URL → BASE_RPC_URL
```

**app/.env.local:**
```bash
# REMOVED
- BANKR_API_KEY
- SMELT references

# ADDED
+ ANTHROPIC_API_KEY
+ SCRAP_WEBHOOK_SECRET

# UPDATED
- Domains to scrapfoundry.online
- Coordinator URL format
```

---

## 🔄 Migration Steps

### For Existing Users:

#### 1. Update Environment Variables

**Backend (coordinator/.env):**
```bash
# Remove these:
BANKR_API_KEY=...

# Add these:
ANTHROPIC_API_KEY=sk-ant-api03-your_key_here

# Rename these:
SCRAP_TOKEN_ADDRESS=$SMELT_TOKEN_ADDRESS  # Use old value
BASE_RPC_URL=$RPC_URL                     # Use old value
```

**Frontend (app/.env.local):**
```bash
# Remove:
BANKR_API_KEY=...

# Add:
ANTHROPIC_API_KEY=sk-ant-api03-your_key_here
SCRAP_WEBHOOK_SECRET=$(openssl rand -hex 32)

# Update domains:
NEXT_PUBLIC_APP_URL=https://scrapfoundry.online
NEXT_PUBLIC_ROOT_DOMAIN=scrapfoundry.online
```

#### 2. Get Anthropic API Key

1. Go to https://console.anthropic.com
2. Create account / Sign in
3. Generate API key
4. Copy key (starts with `sk-ant-api03-`)
5. Add to both backend and frontend `.env`

#### 3. Update Dependencies

```bash
# Backend
cd coordinator
npm install

# Frontend
cd ../app
npm install
```

#### 4. Test Migration

```bash
# Backend
cd coordinator
npm run dev
curl http://localhost:4000/v1/health

# Frontend
cd ../app
npm run dev
# Visit http://localhost:3000
```

---

## 📊 Breaking Changes

### API Changes
None - All existing endpoints remain compatible

### Environment Variables
- `BANKR_API_KEY` → `ANTHROPIC_API_KEY` (required)
- `SMELT_TOKEN_ADDRESS` → `SCRAP_TOKEN_ADDRESS` (rename)
- `RPC_URL` → `BASE_RPC_URL` (rename)

### Code Changes
If you modified these files, review changes:
- `coordinator/src/services/foreman.ts`
- `app/src/lib/claude/agent.ts`

---

## ✅ Verification Checklist

After migration, verify:

### Backend
- [ ] `npm run dev` starts without errors
- [ ] `/v1/health` returns 200 OK
- [ ] `/v1/gitlawb/bounties/health` works (if enabled)
- [ ] No console errors about BANKR_API_KEY
- [ ] LLM features work (or fall back to mock)

### Frontend
- [ ] `npm run dev` starts without errors
- [ ] App loads at http://localhost:3000
- [ ] No console errors about Bankr
- [ ] BountiesPanel component renders (if added)
- [ ] Can connect wallet via Privy

### Integration
- [ ] Frontend can reach backend API
- [ ] CORS configured correctly
- [ ] Bounties fetch if Gitlawb enabled
- [ ] No 404s or 500s in network tab

---

## 🆘 Troubleshooting

### "ANTHROPIC_API_KEY not set"

**Fix:**
```bash
# Add to .env:
ANTHROPIC_API_KEY=sk-ant-api03-your_key_here
```

### "isBankrGenerated is not defined"

**Cause:** Frontend using old code

**Fix:**
```bash
cd app
npm install
# Restart dev server
```

### "SMELT_TOKEN_ADDRESS not found"

**Cause:** Using old env var name

**Fix:**
```bash
# In .env, rename:
SCRAP_TOKEN_ADDRESS=0x...  # Use your token address
```

### LLM Features Not Working

**Check:**
1. `ANTHROPIC_API_KEY` is set in `.env`
2. Key starts with `sk-ant-api03-`
3. Key is valid (test at console.anthropic.com)
4. No rate limit errors in logs

**Mock Mode:**
- If key not set → uses mock data
- This is intentional, not an error
- Add key to enable real LLM

---

## 📚 Updated Documentation

All docs updated to remove Bankr and SMELT:

- ✅ README.md
- ✅ QUICKSTART.md  
- ✅ coordinator/README.md
- ✅ coordinator/GITLAWB_INTEGRATION.md
- ✅ app/README.md
- ✅ CHANGELOG.md

---

## 🔗 External Dependencies

### Before (v1.x)
- Bankr LLM Gateway (bankr.bot)
- SMELT token

### After (v2.0)
- Anthropic API (api.anthropic.com)
- SCRAP token
- Gitlawb (gitlawb.com) - optional

---

## 💡 Benefits of Migration

### Removed Dependencies
- ✅ No third-party LLM gateway
- ✅ No Bankr account needed
- ✅ Direct Anthropic billing

### Added Features
- ✅ Gitlawb bounty integration
- ✅ GitHub PR validation
- ✅ Frontend bounty UI
- ✅ Automatic rewards

### Cleaner Code
- ✅ Consistent naming (SCRAP)
- ✅ Direct API integration
- ✅ Better documentation
- ✅ No legacy references

---

## 🎯 Next Steps

1. Complete migration using checklist above
2. Test all features
3. Deploy to production
4. Enable Gitlawb (optional)
5. Create first bounty

---

**Migration complete! You're now on SCRAP v2.0** ✅
