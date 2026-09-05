-- ============================================================================
-- KORA Product Discovery System — Migration (v3, consolidated)
-- ============================================================================
-- This supersedes any earlier draft — nothing has been deployed yet, so
-- there's one migration to run.
--
-- Confirmed against your real schema:
--   - products.owner is an EMAIL (matches profiles.email)
--   - rfqs is your existing general buyer-request board
-- ============================================================================

-- 1. Discovery sources — one row per connected external source
create table if not exists discovery_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,                                 -- shown to buyers as "Sourced from {name}"
  source_type text not null check (source_type in ('api', 'csv', 'scrape')),
  config jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  schedule_cron text not null default '0 */6 * * *',
  last_run_at timestamptz,
  last_run_status text,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

-- 2. Run log
create table if not exists discovery_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references discovery_sources(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'success', 'failed')),
  items_found int not null default 0,
  items_new int not null default 0,
  items_updated int not null default 0,
  items_duplicate int not null default 0,
  items_marked_unavailable int not null default 0,
  error_message text
);

create index if not exists idx_discovery_runs_source on discovery_runs(source_id, started_at desc);

-- 3. Extend products — additive/nullable, every existing row defaults to
--    listing_source='internal', is_claimed=true, availability='available',
--    so nothing about your current marketplace changes.
alter table products
  add column if not exists listing_source text not null default 'internal'
    check (listing_source in ('internal', 'discovered')),
  add column if not exists discovery_source_id uuid references discovery_sources(id) on delete set null,
  add column if not exists external_ref_id text,
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists availability text not null default 'available'
    check (availability in ('available', 'limited', 'unavailable')),
  add column if not exists external_supplier_name text,
  add column if not exists external_supplier_contact_phone text,
  add column if not exists external_supplier_contact_email text,
  add column if not exists is_claimed boolean not null default true,
  add column if not exists content_hash text,
  add column if not exists discovered_at timestamptz,
  add column if not exists last_synced_at timestamptz;

alter table products alter column owner drop not null;

create unique index if not exists idx_products_discovery_dedup
  on products (discovery_source_id, external_ref_id)
  where discovery_source_id is not null and external_ref_id is not null;

create index if not exists idx_products_listing_source on products(listing_source);
create index if not exists idx_products_availability on products(availability);
create index if not exists idx_products_content_hash on products(content_hash) where content_hash is not null;

-- 4. Target an existing rfqs row at one product/supplier (optional).
alter table rfqs
  add column if not exists product_id uuid references products(id) on delete set null,
  add column if not exists target_seller_email text;

create index if not exists idx_rfqs_product on rfqs(product_id) where product_id is not null;

-- 5. Unclaimed-supplier invite tracking
create table if not exists supplier_claim_invites (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  contact_phone text,
  contact_email text,
  invite_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'notified', 'claimed', 'expired')),
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  claimed_by_email text,
  claimed_at timestamptz
);

create index if not exists idx_claim_invites_product on supplier_claim_invites(product_id);
create index if not exists idx_claim_invites_status on supplier_claim_invites(status);

-- 6. RLS — admin-only on discovery admin tables
alter table discovery_sources enable row level security;
alter table discovery_runs enable row level security;
alter table supplier_claim_invites enable row level security;

drop policy if exists "admins manage discovery_sources" on discovery_sources;
create policy "admins manage discovery_sources" on discovery_sources
  for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists "admins read discovery_runs" on discovery_runs;
create policy "admins read discovery_runs" on discovery_runs
  for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists "admins manage supplier_claim_invites" on supplier_claim_invites;
create policy "admins manage supplier_claim_invites" on supplier_claim_invites
  for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));
