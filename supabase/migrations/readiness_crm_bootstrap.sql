-- ============================================================================
-- Creative Milk -- AI READINESS / CRM bootstrap (fresh project)
-- File: readiness_crm_bootstrap.sql
-- ============================================================================
--
-- WHY THIS FILE EXISTS:
--   The original Supabase project was deleted, so its schema can't be dumped.
--   Migration 0001 was written to EXTEND a pre-existing CRM (opportunities /
--   activities / documents / profiles) that is NOT in this repo -- so 0001
--   fails on a fresh project at the first `alter table public.opportunities`.
--
--   members_only_bootstrap.sql stood up the members-area path only; it
--   deliberately created none of the CRM tables. As a result the production
--   project has NO readiness_assessments table and /api/readiness/submit
--   returns 500 ("Failed to persist assessment") on every submission.
--
--   This file is the CRM counterpart: a SELF-CONTAINED, idempotent script
--   that creates the four tables the /api/readiness/* routes touch, shaped
--   to match what the APP CODE actually reads and writes today.
--
--   Run THIS INSTEAD OF 0001 on the new project (after, or independently of,
--   members_only_bootstrap.sql). Do NOT run 0001 afterwards: 0001 adds a
--   snake_case stage check ('new_lead', 'qualified', ...) but the app code
--   writes display-case stages ('New Lead', 'Qualified') -- the constraint
--   would break the book-call and email-playbook routes.
--
-- WHAT IT DOES:
--   1. contacts              -- verbatim from 0001
--   2. opportunities         -- reconstructed: base columns the app uses +
--                               the readiness columns 0001 added
--   3. readiness_assessments -- verbatim from 0001
--   4. activities            -- reconstructed: has BOTH `data` and `metadata`
--                               jsonb (submit writes data; book-call writes
--                               metadata)
--   5. documents             -- reconstructed from email-playbook usage
--   6. RLS enabled on all five with NO policies: every route uses the
--      service role (bypasses RLS); anon/authenticated clients get nothing.
--      (0001's admin policies referenced a `profiles` table that does not
--      exist on this project, so they are intentionally omitted.)
--   7. Private storage bucket `playbooks` (no client policies; the PDF is
--      uploaded server-side with the service role).
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Shared updated_at trigger fn (same as 0001 / members bootstrap) ─────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- contacts (verbatim from 0001)
-- ============================================================================
create table if not exists public.contacts (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,

  -- identity
  email         text not null,
  first_name    text,
  last_name     text,
  phone         text,

  -- business context (captured progressively across the funnel)
  company       text,
  company_size  text check (company_size in ('1-10','11-50','51-200','200+')),
  role          text check (role in ('founder','exec','ops','marketing','other')),
  suburb        text,

  -- attribution + notes
  source        text not null default 'unknown',
  notes         text,

  constraint contacts_email_unique unique (email)
);

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

create index if not exists contacts_email_idx       on public.contacts (email);
create index if not exists contacts_created_at_idx  on public.contacts (created_at desc);
create index if not exists contacts_source_idx      on public.contacts (source);

comment on table public.contacts is
  'People we have identified. One row per unique email. Source of truth for person info; opportunities reference contacts via contact_id.';

-- ============================================================================
-- opportunities (reconstructed: pre-0001 base + 0001 additions, flattened)
-- ============================================================================
-- NOTE: unlike 0001, there is NO check constraint on stage. The app writes
-- display-case values ('New Lead', 'Qualified'); 0001's snake_case check
-- would reject them. Stage stays free text by design until the code and
-- schema agree on one canonical set.
-- ============================================================================
create table if not exists public.opportunities (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,

  title             text not null,
  stage             text not null default 'New Lead',
  stage_changed_at  timestamptz not null default now(),

  -- from 0001
  contact_id        uuid references public.contacts(id) on delete restrict,
  source            text not null default 'unknown',
  readiness_score   integer check (readiness_score between 0 and 100),
  readiness_band    text check (readiness_band in ('starting_out','foundational','developing','ai_ready','ai_leader')),
  problem_summary   text
);

drop trigger if exists opportunities_set_updated_at on public.opportunities;
create trigger opportunities_set_updated_at
  before update on public.opportunities
  for each row execute function public.set_updated_at();

create index if not exists opportunities_contact_id_idx on public.opportunities (contact_id);
create index if not exists opportunities_source_idx     on public.opportunities (source);
create index if not exists opportunities_stage_idx      on public.opportunities (stage);

-- ============================================================================
-- readiness_assessments (verbatim from 0001)
-- ============================================================================
create table if not exists public.readiness_assessments (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  completed_at      timestamptz,
  deleted_at        timestamptz,

  -- raw answers + computed scores
  answers           jsonb not null,
  pillar_scores     jsonb not null,
  overall_score     integer not null check (overall_score between 0 and 100),
  band              text not null check (band in ('starting_out','foundational','developing','ai_ready','ai_leader')),
  focus_areas       jsonb not null,

  -- composition metadata (lets us rebuild the same playbook later if logic evolves)
  composition_schema_version integer not null default 1,
  weakness_patterns jsonb not null,
  strongest_pillar  text not null,
  pillar_tiers      jsonb not null,

  -- progressive linkage
  contact_id        uuid references public.contacts(id) on delete set null,
  opportunity_id    uuid references public.opportunities(id) on delete set null,

  -- playbook lifecycle
  playbook_storage_path  text,
  playbook_generated_at  timestamptz,
  playbook_sent_at       timestamptz,

  -- request context (low-PII; never store full IP)
  user_agent        text,
  referrer          text,
  ip_country        text
);

create index if not exists readiness_assessments_contact_id_idx     on public.readiness_assessments (contact_id);
create index if not exists readiness_assessments_opportunity_id_idx on public.readiness_assessments (opportunity_id);
create index if not exists readiness_assessments_created_at_idx     on public.readiness_assessments (created_at desc);
create index if not exists readiness_assessments_band_idx           on public.readiness_assessments (band);

comment on table public.readiness_assessments is
  'One row per completed assessment. Created anonymously; contact and opportunity links set progressively as the prospect engages.';

-- ============================================================================
-- activities (reconstructed from app usage)
-- ============================================================================
-- Carries BOTH jsonb payload columns because the code is split:
--   /api/readiness/submit     inserts { ..., data: {...} }
--   /api/readiness/book-call  inserts { ..., metadata: {...} }
-- Both inserts are fire-and-forget, but with only one column present half
-- the activity log would silently fail.
-- ============================================================================
create table if not exists public.activities (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),

  contact_id        uuid references public.contacts(id) on delete set null,
  opportunity_id    uuid references public.opportunities(id) on delete set null,
  assessment_id     uuid references public.readiness_assessments(id) on delete set null,

  type              text not null,
  description       text,
  data              jsonb,
  metadata          jsonb
);

create index if not exists activities_contact_id_idx    on public.activities (contact_id, created_at desc);
create index if not exists activities_assessment_id_idx on public.activities (assessment_id, created_at desc);
create index if not exists activities_type_idx          on public.activities (type);

-- ============================================================================
-- documents (reconstructed from /api/readiness/email-playbook usage)
-- ============================================================================
create table if not exists public.documents (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),

  contact_id        uuid references public.contacts(id) on delete cascade,
  opportunity_id    uuid references public.opportunities(id) on delete set null,
  assessment_id     uuid references public.readiness_assessments(id) on delete set null,

  type              text,
  file_path         text,
  file_type         text,
  file_size         bigint
);

create index if not exists documents_contact_id_idx    on public.documents (contact_id);
create index if not exists documents_assessment_id_idx on public.documents (assessment_id);
create index if not exists documents_type_idx          on public.documents (type);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- RLS on, NO policies: all reads and writes go through /api/readiness/*
-- server routes using the service role key (bypasses RLS). Anonymous and
-- authenticated clients can touch nothing directly -- least privilege.
-- 0001's "Team/Admin" policies referenced a `profiles` table that does not
-- exist on this project; add policies only if a CRM UI is rebuilt.
-- ============================================================================
alter table public.contacts              enable row level security;
alter table public.opportunities         enable row level security;
alter table public.readiness_assessments enable row level security;
alter table public.activities            enable row level security;
alter table public.documents             enable row level security;

-- ── Private bucket for playbook PDFs ────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('playbooks', 'playbooks', false)
on conflict (id) do nothing;
-- Deliberately NO storage.objects policies: the PDF is uploaded and read
-- server-side with the service role only.

-- ============================================================================
-- DONE. The AI Readiness funnel is ready:
--   contacts + opportunities + readiness_assessments + activities + documents
--   + private playbooks bucket.
-- ============================================================================
