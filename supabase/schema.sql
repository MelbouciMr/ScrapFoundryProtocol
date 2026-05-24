-- ============================================================
-- SCRAP Protocol — Complete Database Schema
-- Run this in your Supabase SQL editor
-- Contains: Dashboard tables + Protocol coordinator tables
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PART 1: DASHBOARD & FRONTEND TABLES
-- These power the visual foundry interface
-- ============================================================

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  wallet_address text unique not null,
  display_name text,
  avatar_url text,
  role text not null default 'operator' check (role in ('operator', 'observer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- EPOCHS
-- ─────────────────────────────────────────────
create table if not exists epochs (
  id uuid primary key default uuid_generate_v4(),
  epoch_number integer unique not null,
  label text not null,
  total_scrap_processed numeric not null default 0,
  total_refined_output numeric not null default 0,
  top_foundry_id uuid,
  global_pressure numeric not null default 0 check (global_pressure >= 0 and global_pressure <= 100),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- GLOBAL EVENTS
-- ─────────────────────────────────────────────
create table if not exists global_events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  event_type text not null check (event_type in ('scrap_surge', 'heat_wave', 'slag_crisis', 'refinery_boost', 'system_anomaly')),
  active boolean not null default true,
  started_at timestamptz not null default now(),
  ends_at timestamptz,
  effect_data jsonb,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- FOUNDRIES
-- ─────────────────────────────────────────────
create table if not exists foundries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  operator_id uuid not null references profiles(id),
  heat numeric not null default 45 check (heat >= 0 and heat <= 100),
  fuel numeric not null default 72 check (fuel >= 0 and fuel <= 100),
  scrap_stockpile numeric not null default 18420,
  slag_accumulation numeric not null default 640,
  purity_score numeric not null default 87.4 check (purity_score >= 0 and purity_score <= 100),
  furnace_mode text not null default 'auto' check (furnace_mode in ('off', 'idle', 'auto', 'boost', 'emergency')),
  capacity numeric not null default 50000,
  throughput_rate numeric not null default 420,
  total_batches_processed integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- AGENTS
-- ─────────────────────────────────────────────
create table if not exists agents (
  id uuid primary key default uuid_generate_v4(),
  foundry_id uuid not null references foundries(id),
  name text not null,
  model text not null,
  state text not null default 'idle' check (state in ('idle', 'scanning', 'hauling', 'scraping', 'purging', 'repairing', 'overheated', 'alert')),
  mode text not null default 'autonomous' check (mode in ('autonomous', 'assisted', 'manual')),
  efficiency numeric not null default 94.2 check (efficiency >= 0 and efficiency <= 100),
  uptime_hours numeric not null default 47.8,
  last_action text,
  last_action_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- SCRAP BATCHES
-- ─────────────────────────────────────────────
create table if not exists scrap_batches (
  id uuid primary key default uuid_generate_v4(),
  foundry_id uuid not null references foundries(id),
  batch_code text unique not null,
  scrap_weight numeric not null,
  impurity_level numeric not null check (impurity_level >= 0 and impurity_level <= 100),
  thermal_difficulty integer not null check (thermal_difficulty >= 1 and thermal_difficulty <= 10),
  refined_yield numeric,
  status text not null default 'queued' check (status in ('queued', 'processing', 'refined', 'failed')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- BATCH JOBS
-- ─────────────────────────────────────────────
create table if not exists batch_jobs (
  id uuid primary key default uuid_generate_v4(),
  batch_id uuid not null references scrap_batches(id),
  agent_id uuid not null references agents(id),
  job_type text not null check (job_type in ('thermal_ramp', 'impurity_scan', 'yield_calculation', 'slag_purge')),
  progress numeric not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'pending' check (status in ('pending', 'running', 'complete', 'failed')),
  result_data jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- FURNACES
-- ─────────────────────────────────────────────
create table if not exists furnaces (
  id uuid primary key default uuid_generate_v4(),
  foundry_id uuid not null references foundries(id),
  name text not null,
  temperature numeric not null default 1240 check (temperature >= 0 and temperature <= 2000),
  capacity numeric not null default 25000,
  status text not null default 'idle' check (status in ('idle', 'heating', 'active', 'cooling', 'maintenance')),
  fuel_consumption_rate numeric not null default 18.4,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- EVENT LOGS
-- ─────────────────────────────────────────────
create table if not exists event_logs (
  id uuid primary key default uuid_generate_v4(),
  foundry_id uuid references foundries(id),
  agent_id uuid references agents(id),
  event_type text not null check (event_type in ('system', 'alert', 'batch', 'agent', 'manual')),
  severity text not null check (severity in ('info', 'warn', 'error', 'critical')),
  message text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- AGENT MESSAGES
-- ─────────────────────────────────────────────
create table if not exists agent_messages (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references agents(id),
  message_type text not null check (message_type in ('log', 'alert', 'report', 'commentary')),
  content text not null,
  is_llm_generated boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- AGENT PLANS
-- ─────────────────────────────────────────────
create table if not exists agent_plans (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references agents(id),
  recommended_actions jsonb not null,
  next_steps jsonb not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  risk_summary text not null,
  is_llm_generated boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger foundries_updated_at before update on foundries
  for each row execute function update_updated_at();

create trigger agents_updated_at before update on agents
  for each row execute function update_updated_at();

create trigger furnaces_updated_at before update on furnaces
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- SEED DATA — Dashboard
-- ─────────────────────────────────────────────

-- Seed Epoch 1
insert into epochs (epoch_number, label, total_scrap_processed, total_refined_output, global_pressure, active) values
  (1, 'THE FIRST MELT', 847290, 624180, 62, true)
on conflict (epoch_number) do nothing;

-- Seed Global Event
insert into global_events (title, description, event_type, active, started_at, ends_at, effect_data) values
  (
    'SCRAP SURGE — SECTOR-7 DETECTED',
    'Autonomous hauler fleets report unprecedented scrap concentration in SECTOR-7. All foundries advised to increase intake capacity. Event duration: 48 hours.',
    'scrap_surge',
    true,
    now(),
    now() + interval '48 hours',
    '{"scrap_multiplier": 1.4, "affected_region": "SECTOR-7"}'::jsonb
  )
on conflict do nothing;

-- ============================================================
-- PART 2: PROTOCOL COORDINATOR TABLES
-- These power the backend mining/staking protocol
-- ============================================================

-- ─────────────────────────────────────────────
-- PROTOCOL EPOCHS
-- ─────────────────────────────────────────────
create table if not exists protocol_epochs (
  id uuid primary key default uuid_generate_v4(),
  epoch_number integer unique not null,
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  active boolean not null default true,
  funded boolean not null default false,
  total_credits integer not null default 0,
  reward_amount numeric not null default 0,
  steel_price_usd integer not null default 620,
  steel_multiplier numeric not null default 1.0,
  steel_band text not null default 'BASELINE',
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- FOUNDRY ZONES (drill sites)
-- ─────────────────────────────────────────────
create table if not exists foundry_zones (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  region text not null,
  depth text not null check (depth in ('shallow', 'medium', 'deep')),
  active boolean not null default true,
  richness_multiplier numeric not null default 1.0,
  total_batches integer not null default 50,
  remaining_batches integer not null default 50,
  depletion_pct integer not null default 0,
  reserve_estimate_label text not null default '10-50',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- MINER PROFILES
-- ─────────────────────────────────────────────
create table if not exists miner_profiles (
  id uuid primary key default uuid_generate_v4(),
  wallet_address text unique not null,
  stake_tier text not null default 'none' check (stake_tier in ('none', 'scout', 'operator', 'overseer')),
  staked_amount numeric not null default 0,
  total_credits_earned integer not null default 0,
  total_lots_completed integer not null default 0,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- AUTH NONCES
-- ─────────────────────────────────────────────
create table if not exists auth_nonces (
  id uuid primary key default uuid_generate_v4(),
  miner text not null,
  nonce text not null,
  message text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- AUTH TOKENS
-- ─────────────────────────────────────────────
create table if not exists auth_tokens (
  id uuid primary key default uuid_generate_v4(),
  miner text not null,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists auth_tokens_token_idx on auth_tokens (token);
create index if not exists auth_tokens_miner_idx on auth_tokens (miner);

-- ─────────────────────────────────────────────
-- ACTIVE DRILLS (in-flight challenges)
-- ─────────────────────────────────────────────
create table if not exists active_drills (
  id uuid primary key default uuid_generate_v4(),
  miner text not null,
  site_id uuid not null references foundry_zones(id),
  challenge_id text not null,
  epoch_id integer not null,
  nonce text not null,
  depth text not null,
  credits integer not null default 1,
  constraints jsonb,
  completed boolean not null default false,
  passed boolean,
  artifact text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists active_drills_miner_idx on active_drills (miner, completed);

-- ─────────────────────────────────────────────
-- SCRAP LOTS (refined batches ready for claim)
-- ─────────────────────────────────────────────
create table if not exists scrap_lots (
  id uuid primary key default uuid_generate_v4(),
  miner text not null,
  site_id uuid not null references foundry_zones(id),
  challenge_id text not null,
  epoch_id integer not null,
  depth text not null,
  credits integer not null default 1,
  solve_index integer not null,
  nonce text not null,
  artifact text not null,
  status text not null default 'refining' check (status in ('refining', 'ready', 'claimed')),
  available_at timestamptz not null,
  ready_at timestamptz,
  signature text,
  calldata text,
  created_at timestamptz not null default now()
);

create index if not exists scrap_lots_miner_idx on scrap_lots (miner, epoch_id);
create index if not exists scrap_lots_status_idx on scrap_lots (status, available_at);

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGERS (Protocol tables)
-- ─────────────────────────────────────────────
create trigger foundry_zones_updated_at before update on foundry_zones
  for each row execute function update_updated_at();

create trigger miner_profiles_updated_at before update on miner_profiles
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- RPC FUNCTION — increment epoch credits atomically
-- ─────────────────────────────────────────────
create or replace function increment_epoch_credits(p_epoch_number integer, p_credits integer)
returns void as $$
begin
  update protocol_epochs
  set total_credits = total_credits + p_credits
  where epoch_number = p_epoch_number;
end;
$$ language plpgsql;

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table protocol_epochs enable row level security;
alter table foundry_zones enable row level security;
alter table miner_profiles enable row level security;
alter table auth_nonces enable row level security;
alter table auth_tokens enable row level security;
alter table active_drills enable row level security;
alter table scrap_lots enable row level security;

-- Public read on epochs and zones (for landing/dashboard)
create policy "Public read epochs" on protocol_epochs for select using (true);
create policy "Public read zones" on foundry_zones for select using (true);

-- Service role bypasses RLS for coordinator (it uses service role key)
-- Miner profiles public read for leaderboard
create policy "Public read miner profiles" on miner_profiles for select using (true);

-- Scrap lots: public read for leaderboard/stats
create policy "Public read scrap lots" on scrap_lots for select using (true);

-- ─────────────────────────────────────────────
-- SEED DATA — Foundry Zones
-- ─────────────────────────────────────────────
insert into foundry_zones (name, region, depth, richness_multiplier, total_batches, remaining_batches, reserve_estimate_label) values
  ('GRID-7A SURFACE STRIP',    'SECTOR-7',    'shallow', 3.0, 80,  80,  '60-120'),
  ('ASHFIELD RECOVERY ZONE',   'ASHFIELD',    'shallow', 1.5, 60,  60,  '40-80'),
  ('NORTHERN EXTRACTION GRID', 'NORTH-GRID',  'shallow', 5.0, 40,  40,  '30-200'),
  ('EMBER COAST SURFACE',      'EMBER-COAST', 'shallow', 2.0, 100, 100, '80-150'),
  ('RIDGELINE OUTER ZONE',     'RIDGELINE',   'shallow', 4.0, 50,  50,  '40-180'),
  ('DELTA-IRON FLATS',         'DELTA',       'shallow', 1.0, 120, 120, '100-140')
on conflict do nothing;

-- Bootstrap protocol epoch 1
insert into protocol_epochs (epoch_number, started_at, ends_at, active, total_credits, steel_price_usd, steel_multiplier, steel_band)
values (
  1,
  now(),
  now() + interval '24 hours',
  true,
  0,
  620,
  1.0,
  'BASELINE'
) on conflict (epoch_number) do nothing;

-- ============================================================
-- SCHEMA COMPLETE
-- Tables: 20 total (11 dashboard + 9 protocol)
-- ============================================================