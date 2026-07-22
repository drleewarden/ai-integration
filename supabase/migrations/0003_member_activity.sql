-- ============================================================================
-- 0003: member_activity — per-member activity feed for the members dashboard
-- (tool runs and downloads, server-recorded only).
-- ============================================================================

create table member_activity (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users (id) on delete cascade,
  item_slug text not null,
  kind text not null check (kind in ('tool_run', 'download')),
  summary jsonb,
  created_at timestamptz not null default now()
);

create index member_activity_member_created_idx
  on member_activity (member_id, created_at desc);

-- RLS: members see and write only their own rows. No update/delete policies —
-- activity is append-only from the member's perspective.
alter table member_activity enable row level security;

create policy "Members can view own activity"
  on member_activity for select to authenticated
  using (member_id = auth.uid());

create policy "Members can insert own activity"
  on member_activity for insert to authenticated
  with check (member_id = auth.uid());
