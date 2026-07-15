-- ============================================================================
-- Creative Milk -- Members area (v1)
-- Migration: 0002_members_area.sql
-- ============================================================================
--
-- WHAT THIS MIGRATION DOES:
--   1. LOCKS DOWN existing CRM RLS. Migration 0001 granted any authenticated
--      user read/write on CRM tables. Once the public can sign up (members),
--      "authenticated" no longer means "team". Every "Team can ..." policy is
--      recreated to require a public.profiles row (team members have one;
--      public members will not).
--   2. Creates public.member_profiles (one row per member, tier free|pro).
--   3. Trigger: auto-create a member_profiles row on auth.users insert.
--   4. RLS: members may SELECT their own row only. All writes go through the
--      service role (Stripe webhook / server routes) which bypasses RLS.
--   5. Creates private storage bucket member-files (no client policies at
--      all -- downloads are minted server-side as signed URLs).
--
-- BEFORE APPLYING, verify in Supabase Studio:
--   a. Every team user has a public.profiles row:
--        select u.id, u.email from auth.users u
--        left join public.profiles p on p.id = u.id where p.id is null;
--      -> must return 0 rows (any hits lose CRM access when this applies).
--   b. No existing trigger auto-creates public.profiles rows on auth.users
--      insert (would silently make every member a team member):
--        select tgname from pg_trigger
--        where tgrelid = 'auth.users'::regclass and not tgisinternal;
--      -> if a profiles-creating trigger exists, scope it before applying.
--   c. Pre-0001 CRM tables (opportunities, activities, documents, ...) have
--      policies that exist only in the live DB. List every policy that
--      still trusts bare "authenticated":
--        select schemaname, tablename, policyname, qual
--        from pg_policies
--        where qual like '%auth.role()%' or with_check like '%auth.role()%';
--      -> recreate each hit with public.is_team_member(), same pattern as
--         below, BEFORE members can sign up.
-- ============================================================================

-- ── Helper: team membership check ──────────────────────────────────────────
create or replace function public.is_team_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where profiles.id = auth.uid());
$$;

-- ── 1. CRM lockdown: recreate "Team can ..." policies ──────────────────────
-- contacts
drop policy if exists "Team can view contacts" on public.contacts;
create policy "Team can view contacts"
  on public.contacts for select to authenticated
  using (public.is_team_member());
drop policy if exists "Team can insert contacts" on public.contacts;
create policy "Team can insert contacts"
  on public.contacts for insert to authenticated
  with check (public.is_team_member());
drop policy if exists "Team can update contacts" on public.contacts;
create policy "Team can update contacts"
  on public.contacts for update to authenticated
  using (public.is_team_member());

-- readiness_assessments
drop policy if exists "Team can view readiness_assessments" on public.readiness_assessments;
create policy "Team can view readiness_assessments"
  on public.readiness_assessments for select to authenticated
  using (public.is_team_member());
drop policy if exists "Team can insert readiness_assessments" on public.readiness_assessments;
create policy "Team can insert readiness_assessments"
  on public.readiness_assessments for insert to authenticated
  with check (public.is_team_member());
drop policy if exists "Team can update readiness_assessments" on public.readiness_assessments;
create policy "Team can update readiness_assessments"
  on public.readiness_assessments for update to authenticated
  using (public.is_team_member());

-- playbooks bucket (storage.objects)
drop policy if exists "Team can view playbooks" on storage.objects;
create policy "Team can view playbooks"
  on storage.objects for select to authenticated
  using (bucket_id = 'playbooks' and public.is_team_member());
drop policy if exists "Team can upload playbooks" on storage.objects;
create policy "Team can upload playbooks"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'playbooks' and public.is_team_member());
drop policy if exists "Team can update playbooks" on storage.objects;
create policy "Team can update playbooks"
  on storage.objects for update to authenticated
  using (bucket_id = 'playbooks' and public.is_team_member());
drop policy if exists "Team can delete playbooks" on storage.objects;
create policy "Team can delete playbooks"
  on storage.objects for delete to authenticated
  using (bucket_id = 'playbooks' and public.is_team_member());

-- The 10 policies above are ALL of migration 0001's "Team can" policies
-- (3 contacts, 3 readiness_assessments, 4 playbooks). The pre-existing CRM
-- tables (opportunities, activities, documents, profiles) were created
-- BEFORE 0001, so their policies live only in the database -- pre-flight
-- check (c) below finds and lists them for the same treatment.

-- ── 2. member_profiles ──────────────────────────────────────────────────────
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

-- reuse the shared updated_at trigger fn from 0001
drop trigger if exists member_profiles_set_updated_at on public.member_profiles;
create trigger member_profiles_set_updated_at
  before update on public.member_profiles
  for each row execute function public.set_updated_at();

-- ── 3. auto-create profile on signup ────────────────────────────────────────
create or replace function public.handle_new_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.member_profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_member on auth.users;
create trigger on_auth_user_created_member
  after insert on auth.users
  for each row execute function public.handle_new_member();

-- ── 4. RLS ──────────────────────────────────────────────────────────────────
alter table public.member_profiles enable row level security;

drop policy if exists "Members can view own profile" on public.member_profiles;
create policy "Members can view own profile"
  on public.member_profiles for select to authenticated
  using (id = auth.uid());
-- No insert/update/delete policies: only the service role writes.

-- ── 5. Private bucket for member files ──────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('member-files', 'member-files', false)
on conflict (id) do nothing;
-- Deliberately NO storage.objects policies for member-files: clients can
-- never touch it directly; the download route mints signed URLs with the
-- service role.

-- ── BACK-OUT PLAN ───────────────────────────────────────────────────────────
-- drop trigger on_auth_user_created_member on auth.users;
-- drop function public.handle_new_member();
-- drop table public.member_profiles;
-- delete from storage.buckets where id = 'member-files';
-- Recreate the 0001 "Team can ..." policies verbatim if reverting lockdown.
