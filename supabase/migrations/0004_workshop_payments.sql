-- ============================================================================
-- 0004: workshop_payments — per-person workshop payment links with a custom
-- amount. The emailed link is /pay/<id>; the amount is read server-side from
-- this table when Checkout starts, so the URL never carries a price.
--
-- Access model: RLS enabled with NO policies — service-role only. The admin
-- page/API, pay page, checkout API, and Stripe webhook all use the server-side
-- service client (same pattern as the readiness tables).
-- ============================================================================

create table workshop_payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  amount_cents integer not null
    check (amount_cents > 0 and amount_cents <= 1000000),
  currency text not null default 'aud',
  description text not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'void')),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  created_by text not null
);

create index workshop_payments_created_idx
  on workshop_payments (created_at desc);

alter table workshop_payments enable row level security;
