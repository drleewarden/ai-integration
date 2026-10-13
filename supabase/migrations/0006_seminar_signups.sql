-- ============================================================================
-- 0006: seminar_signups + complimentary Pro access
--
-- Seminar attendees scan a QR code that opens /seminar?c=<code>. The form
-- captures name, email and marketing consent into seminar_signups BEFORE the
-- magic link is sent, so we keep the attendee list even if someone never
-- clicks the email. When they land on /seminar/welcome signed in, their row
-- is matched by email and member_profiles.complimentary_pro_until is set.
--
-- Why a separate column instead of writing tier = 'pro':
--   The Stripe webhook is the only writer of member_profiles.tier. Writing
--   'pro' here would be clobbered by (or clobber) subscription events. The
--   effective tier is computed in lib/supabase/auth-server.ts as
--   tier = 'pro' OR complimentary_pro_until > now().
--
-- Access model: RLS enabled with NO policies on seminar_signups, service-role
-- only (same as workshop_payments). Contains PII: name, email.
-- ============================================================================

create table if not exists public.seminar_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_code text not null check (char_length(event_code) <= 100),
  name text not null check (char_length(name) <= 200),
  email text not null check (char_length(email) <= 320),
  marketing_opt_in boolean not null default false,
  -- Exact consent wording shown at the time, for Spam Act evidence.
  consent_text text,
  member_id uuid references auth.users (id) on delete set null,
  granted_at timestamptz
);

-- One row per person per event; re-submits update the existing row. The API
-- lowercases email before writing, so a plain constraint works for upsert
-- (PostgREST on_conflict can't target an expression index).
alter table public.seminar_signups
  add constraint seminar_signups_event_email_key unique (event_code, email);
alter table public.seminar_signups
  add constraint seminar_signups_email_lower check (email = lower(email));

alter table public.seminar_signups enable row level security;
-- Deliberately NO policies: only the service role reads or writes.

alter table public.member_profiles
  add column if not exists complimentary_pro_until timestamptz;

-- ── BACK-OUT PLAN ───────────────────────────────────────────────────────────
-- alter table public.member_profiles drop column complimentary_pro_until;
-- drop table public.seminar_signups;
