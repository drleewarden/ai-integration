-- ============================================================================
-- Creative Milk -- MEMBERS-ONLY bootstrap (fresh project)
-- File: members_only_bootstrap.sql
-- ============================================================================
--
-- WHY THIS FILE EXISTS:
--   The original Supabase project was deleted, so its schema can't be dumped.
--   Migrations 0001 + 0002 were written to EXTEND a pre-existing CRM (tables
--   profiles / opportunities / activities / documents / fee_items /
--   onboarding_tasks) that is NOT in this repo -- so 0001 fails on a fresh
--   project at the first `alter table public.opportunities ...`.
--
--   This file is a SELF-CONTAINED subset that stands up ONLY the members-area
--   sign-in path (member_profiles + signup trigger + private file bucket).
--   It deliberately creates NONE of the CRM tables and NONE of the CRM-lockdown
--   policies from 0002 (those reference contacts/readiness_assessments/playbooks
--   which don't exist here).
--
--   Run THIS INSTEAD OF 0001 + 0002 on the new project.
--   It is idempotent and forward-compatible: if you later reconstruct the CRM,
--   run the real 0001 then 0002 -- both use IF NOT EXISTS / DROP IF EXISTS and
--   will not conflict with what this file created.
--
-- WHAT IT DOES:
--   1. set_updated_at() -- shared updated_at trigger fn (0001 normally provides
--      it; included here because we are not running 0001).
--   2. public.member_profiles -- one row per member, tier free|pro (verbatim
--      from 0002 so a later full migration is a no-op against it).
--   3. Backfill member_profiles from any existing auth.users.
--   4. handle_new_member() -- auto-create a member row on auth.users insert.
--   5. RLS: a member may SELECT only their own row. All writes are service-role
--      (Stripe webhook / server routes) which bypasses RLS.
--   6. Private storage bucket member-files (no client policies; downloads are
--      minted server-side as signed URLs).
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Shared updated_at trigger fn (from 0001) ────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── member_profiles (verbatim from 0002) ────────────────────────────────────
create table if not exists public.member_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  tier text not null default 'free' check (tier in ('free', 'pro')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text,
  welcomed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists member_profiles_stripe_customer_idx
  on public.member_profiles (stripe_customer_id);

drop trigger if exists member_profiles_set_updated_at on public.member_profiles;
create trigger member_profiles_set_updated_at
  before update on public.member_profiles
  for each row execute function public.set_updated_at();

-- Backfill any users that already exist (e.g. created before this ran).
insert into public.member_profiles (id, email)
select id, coalesce(email, '') from auth.users
on conflict (id) do nothing;

-- ── Auto-create a member row on signup ──────────────────────────────────────
create or replace function public.handle_new_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.member_profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_member on auth.users;
create trigger on_auth_user_created_member
  after insert on auth.users
  for each row execute function public.handle_new_member();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.member_profiles enable row level security;

drop policy if exists "Members can view own profile" on public.member_profiles;
create policy "Members can view own profile"
  on public.member_profiles for select to authenticated
  using (id = auth.uid());
-- No insert/update/delete policies: only the service role writes.

-- ── Private bucket for member files ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('member-files', 'member-files', false)
on conflict (id) do nothing;
-- Deliberately NO storage.objects policies: clients never touch this bucket
-- directly; the download route mints signed URLs with the service role.

-- ============================================================================
-- DONE. Members sign-in path is ready:
--   auth.users (built-in) + member_profiles + signup trigger + member-files.
-- The AI Readiness CRM (contacts, opportunities, readiness_assessments, ...)
-- is intentionally NOT created here -- see 0001/0002 when you rebuild it.
-- ============================================================================

-- ── Member activity (dashboard feed) ────────────────────────────────────────
-- Server-recorded tool runs and downloads. summary holds only
-- { "score": <int>, "host": "<hostname>" } for audits; null for downloads.

create table if not exists public.member_activity (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users (id) on delete cascade,
  item_slug text not null,
  kind text not null check (kind in ('tool_run', 'download')),
  summary jsonb,
  created_at timestamptz not null default now()
);

create index if not exists member_activity_member_created_idx
  on public.member_activity (member_id, created_at desc);

-- RLS: members see and write only their own rows. No update/delete policies.
alter table public.member_activity enable row level security;

drop policy if exists "Members can view own activity" on public.member_activity;
create policy "Members can view own activity"
  on public.member_activity for select to authenticated
  using (member_id = auth.uid());

drop policy if exists "Members can insert own activity" on public.member_activity;
create policy "Members can insert own activity"
  on public.member_activity for insert to authenticated
  with check (member_id = auth.uid());
