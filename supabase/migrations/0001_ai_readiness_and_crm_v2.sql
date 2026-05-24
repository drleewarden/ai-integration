-- ============================================================================
-- Creative Milk -- AI Readiness + CRM schema (v2)
-- Migration: 0001_ai_readiness_and_crm_v2.sql
-- ============================================================================
--
-- CONTEXT:
-- This migration extends the existing CRM (already in place) to support the
-- AI Readiness Assessment lead funnel. It does NOT recreate existing tables.
-- It is safe to re-run; every operation uses IF NOT EXISTS / IF EXISTS guards.
--
-- WHAT THIS MIGRATION DOES:
--   1. Creates new `contacts` table (people, separate from deals)
--   2. Reshapes `opportunities`:
--        - drops the embedded contact_* columns (replaced by contact_id FK)
--        - adds source, readiness_score, readiness_band, problem_summary,
--          stage_changed_at
--   3. Creates new `readiness_assessments` table
--   4. Adds contact_id + assessment_id columns to existing `activities` and
--      `documents` tables (non-breaking -- both nullable)
--   5. Adds `type` column to `documents` (non-breaking -- nullable)
--   6. Creates private storage bucket `playbooks` with RLS policies
--   7. Adds RLS policies on new tables matching existing CRM idiom:
--        - "Team can …"   → any signed-in user
--        - "Admins can delete …" → only profiles.role = 'admin'
--
-- DESIGN NOTES:
--   - Anonymous web traffic NEVER touches the DB directly. Anonymous submissions
--     go via /api/readiness/submit, which uses the service role key. Anonymous
--     reads (sharing a result URL) go via /api/readiness/result/[id], also
--     server-side with sanitised projections (no PII).
--   - Stage transitions on opportunities should always go via the activities
--     log first (insert a 'stage_changed' activity, then update opportunities).
--     This isn't enforced by the DB; it's a convention.
--   - The opportunities.title field stays as the display-name convention. For
--     AI Readiness leads we'll auto-generate "{Company} -- {Band} ({Score}/100)".
--
-- BACK-OUT PLAN (if you need to undo this migration):
--   See the bottom of this file. Strictly reverse order. Test before running.
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Helper: updated_at trigger function ─────────────────────────────────────
-- Shared by every table with an updated_at column. Idempotent.
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
-- NEW TABLE: contacts
-- ============================================================================
-- A person we have identified. Source of truth for person info.
-- One row per unique email. An opportunity references a contact (via the new
-- contact_id FK we add to opportunities below).
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

-- updated_at trigger (drop-and-create to be idempotent if migration is re-run)
drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

create index if not exists contacts_email_idx       on public.contacts (email);
create index if not exists contacts_created_at_idx  on public.contacts (created_at desc);
create index if not exists contacts_source_idx      on public.contacts (source);

comment on table public.contacts is
  'People we have identified. One row per unique email. Source of truth for person info; opportunities reference contacts via contact_id.';
comment on column public.contacts.source is
  'How the contact entered the system. Free-text but conventionally: ai_readiness, website, referral, inbound, outbound, manual.';

-- ============================================================================
-- RESHAPE: opportunities
-- ============================================================================
-- The existing opportunities table has embedded contact info (contact_name,
-- contact_email, contact_phone, company). We move that data to contacts and
-- replace those columns with a contact_id FK. We also add AI Readiness fields
-- and a source attribution column.
--
-- Because the table currently has 0 rows (verified before writing this
-- migration), we can safely drop columns. If you ever re-run this migration
-- against a populated opportunities table, the column drops will lose data.
-- ============================================================================

-- Add new columns (idempotent)
alter table public.opportunities
  add column if not exists contact_id        uuid references public.contacts(id) on delete restrict,
  add column if not exists source            text not null default 'unknown',
  add column if not exists readiness_score   integer check (readiness_score between 0 and 100),
  add column if not exists readiness_band    text check (readiness_band in ('starting_out','foundational','developing','ai_ready','ai_leader')),
  add column if not exists problem_summary   text,
  add column if not exists stage_changed_at  timestamptz not null default now();

-- Enforce valid stage values. The existing opportunities.stage column had no
-- check constraint. We add one here using the canonical set of stages.
--
-- We drop the constraint first if it already exists so the migration is
-- idempotent -- the constraint name is stable across runs.
alter table public.opportunities drop constraint if exists opportunities_stage_check;
alter table public.opportunities add constraint opportunities_stage_check
  check (stage in ('new_lead','qualified','proposal_sent','discovery_sprint','won','lost'));

-- Set default stage if there isn't one already
alter table public.opportunities alter column stage set default 'new_lead';

-- Drop the embedded-contact columns (only if they exist).
-- Safe because: opportunities table is empty.
alter table public.opportunities drop column if exists company;
alter table public.opportunities drop column if exists contact_name;
alter table public.opportunities drop column if exists contact_email;
alter table public.opportunities drop column if exists contact_phone;

-- Index for the new FK
create index if not exists opportunities_contact_id_idx on public.opportunities (contact_id);
create index if not exists opportunities_source_idx     on public.opportunities (source);

comment on column public.opportunities.contact_id is
  'The person this deal is with. Replaces previously-embedded contact_name/email/phone/company columns.';
comment on column public.opportunities.source is
  'How the lead originated. Conventionally: ai_readiness, referral, inbound, outbound, manual.';
comment on column public.opportunities.readiness_score is
  'AI Readiness score (0-100). Only populated when source = ai_readiness.';
comment on column public.opportunities.readiness_band is
  'AI Readiness band. Only populated when source = ai_readiness.';
comment on column public.opportunities.problem_summary is
  'Free-text from the Book a Call form: what AI problem the prospect is trying to solve.';

-- ============================================================================
-- NEW TABLE: readiness_assessments
-- ============================================================================
-- One row per completed assessment. Created anonymously; contact + opportunity
-- linked progressively as the prospect engages further.
--
-- The id (UUID) doubles as the public result URL slug.
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
comment on column public.readiness_assessments.answers is
  'JSON: { q1: 0..3, q2: 0..3, ..., q15: 0..3 }';
comment on column public.readiness_assessments.composition_schema_version is
  'Bumped when the playbook composer''s output shape changes. Lets us re-render old playbooks against the right composer.';

-- ============================================================================
-- BROADEN: activities
-- ============================================================================
-- The existing activities table is built for meeting capture (transcript,
-- ai_summary, action_points, duration_minutes). We add contact_id and
-- assessment_id columns so the table can also hold non-meeting events like
-- assessment_completed, playbook_sent, contact_form_submitted, stage_changed.
--
-- The existing meeting-specific columns stay nullable for non-meeting rows.
-- The type field stays text (no constraint added) so new event types can be
-- introduced from app code without a migration.
-- ============================================================================
alter table public.activities
  add column if not exists contact_id    uuid references public.contacts(id) on delete set null,
  add column if not exists assessment_id uuid references public.readiness_assessments(id) on delete set null,
  add column if not exists description   text;

create index if not exists activities_contact_id_idx    on public.activities (contact_id, created_at desc);
create index if not exists activities_assessment_id_idx on public.activities (assessment_id, created_at desc);
create index if not exists activities_type_idx          on public.activities (type);

comment on column public.activities.contact_id is
  'For non-meeting events linked to a contact rather than an opportunity (e.g. assessment_completed before the lead becomes an opportunity).';
comment on column public.activities.assessment_id is
  'For events linked to a specific AI Readiness assessment.';
comment on column public.activities.description is
  'Short human-readable summary for the timeline UI. The richer payload lives in the metadata jsonb column.';

-- ============================================================================
-- BROADEN: documents
-- ============================================================================
-- Add contact_id, assessment_id, type. Existing file_path/file_size/file_type
-- naming preserved.
-- ============================================================================
alter table public.documents
  add column if not exists contact_id    uuid references public.contacts(id) on delete cascade,
  add column if not exists assessment_id uuid references public.readiness_assessments(id) on delete set null,
  add column if not exists type          text;

create index if not exists documents_contact_id_idx    on public.documents (contact_id);
create index if not exists documents_assessment_id_idx on public.documents (assessment_id);
create index if not exists documents_type_idx          on public.documents (type);

comment on column public.documents.contact_id is
  'Documents linked to a contact (e.g. playbook PDF attached before an opportunity exists).';
comment on column public.documents.type is
  'Document category. Conventionally: playbook, proposal, contract, brief, other.';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- Mirror the existing CRM idiom precisely:
--   - "Team can …"           → any signed-in user (auth.role() = 'authenticated')
--   - "Admins can delete …"  → only profiles.role = 'admin'
--
-- Activities and documents already have policies; we don't touch those.
-- We only add policies to the NEW tables (contacts, readiness_assessments).
-- ============================================================================

alter table public.contacts              enable row level security;
alter table public.readiness_assessments enable row level security;

-- contacts ───────────────────────────────────────────────────────────────────
drop policy if exists "Team can view contacts"     on public.contacts;
drop policy if exists "Team can insert contacts"   on public.contacts;
drop policy if exists "Team can update contacts"   on public.contacts;
drop policy if exists "Admins can delete contacts" on public.contacts;

create policy "Team can view contacts"
  on public.contacts for select to authenticated
  using (auth.role() = 'authenticated'::text);

create policy "Team can insert contacts"
  on public.contacts for insert to authenticated
  with check (auth.role() = 'authenticated'::text);

create policy "Team can update contacts"
  on public.contacts for update to authenticated
  using (auth.role() = 'authenticated'::text);

create policy "Admins can delete contacts"
  on public.contacts for delete to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- readiness_assessments ──────────────────────────────────────────────────────
drop policy if exists "Team can view readiness_assessments"     on public.readiness_assessments;
drop policy if exists "Team can insert readiness_assessments"   on public.readiness_assessments;
drop policy if exists "Team can update readiness_assessments"   on public.readiness_assessments;
drop policy if exists "Admins can delete readiness_assessments" on public.readiness_assessments;

create policy "Team can view readiness_assessments"
  on public.readiness_assessments for select to authenticated
  using (auth.role() = 'authenticated'::text);

create policy "Team can insert readiness_assessments"
  on public.readiness_assessments for insert to authenticated
  with check (auth.role() = 'authenticated'::text);

create policy "Team can update readiness_assessments"
  on public.readiness_assessments for update to authenticated
  using (auth.role() = 'authenticated'::text);

create policy "Admins can delete readiness_assessments"
  on public.readiness_assessments for delete to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- Note: anon role has NO policies on any table. All anonymous traffic goes
-- through /api/readiness/* server routes using the service role key.

-- ============================================================================
-- STORAGE: playbooks bucket
-- ============================================================================
-- Private bucket. Access via signed URLs (server-generated) or via the
-- authenticated CRM. Policy idiom matches existing storage.objects policies
-- ("Team can upload/view/delete documents" on the existing documents bucket).
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('playbooks', 'playbooks', false)
on conflict (id) do nothing;

drop policy if exists "Team can view playbooks"   on storage.objects;
drop policy if exists "Team can upload playbooks" on storage.objects;
drop policy if exists "Team can update playbooks" on storage.objects;
drop policy if exists "Team can delete playbooks" on storage.objects;

create policy "Team can view playbooks"
  on storage.objects for select to authenticated
  using (bucket_id = 'playbooks');

create policy "Team can upload playbooks"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'playbooks');

create policy "Team can update playbooks"
  on storage.objects for update to authenticated
  using (bucket_id = 'playbooks');

create policy "Team can delete playbooks"
  on storage.objects for delete to authenticated
  using (bucket_id = 'playbooks');

-- ============================================================================
-- DONE
-- ============================================================================
-- After running this migration the schema should be:
--   contacts                  NEW
--   opportunities             reshaped (contact_id FK + readiness fields)
--   readiness_assessments     NEW
--   activities                +contact_id +assessment_id +description
--   documents                 +contact_id +assessment_id +type
--   fee_items                 UNCHANGED
--   onboarding_tasks          UNCHANGED
--   profiles                  UNCHANGED
-- Plus the 'playbooks' storage bucket.
-- ============================================================================


-- ============================================================================
-- BACK-OUT (DO NOT RUN -- for reference if you ever need to undo this)
-- ============================================================================
-- Reverse order:
--   drop policy "Team can view playbooks"     on storage.objects;
--   drop policy "Team can upload playbooks"   on storage.objects;
--   drop policy "Team can update playbooks"   on storage.objects;
--   drop policy "Team can delete playbooks"   on storage.objects;
--   delete from storage.buckets where id = 'playbooks';
--
--   drop policy "Team can view readiness_assessments"     on readiness_assessments;
--   drop policy "Team can insert readiness_assessments"   on readiness_assessments;
--   drop policy "Team can update readiness_assessments"   on readiness_assessments;
--   drop policy "Admins can delete readiness_assessments" on readiness_assessments;
--
--   drop policy "Team can view contacts"     on contacts;
--   drop policy "Team can insert contacts"   on contacts;
--   drop policy "Team can update contacts"   on contacts;
--   drop policy "Admins can delete contacts" on contacts;
--
--   alter table documents
--     drop column if exists contact_id,
--     drop column if exists assessment_id,
--     drop column if exists type;
--
--   alter table activities
--     drop column if exists contact_id,
--     drop column if exists assessment_id,
--     drop column if exists description;
--
--   drop table if exists readiness_assessments;
--
--   alter table opportunities
--     drop column if exists contact_id,
--     drop column if exists source,
--     drop column if exists readiness_score,
--     drop column if exists readiness_band,
--     drop column if exists problem_summary,
--     drop column if exists stage_changed_at;
--   alter table opportunities
--     add column company text,
--     add column contact_name text,
--     add column contact_email text,
--     add column contact_phone text;
--
--   drop table if exists contacts;
-- ============================================================================
