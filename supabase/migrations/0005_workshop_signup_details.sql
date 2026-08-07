-- Store the public workshop form fields that were previously available only
-- in the internal notification email. Existing payment-link rows remain null.

alter table public.workshop_payments
  add column if not exists business_type text,
  add column if not exists workflows text;

alter table public.workshop_payments
  add constraint workshop_payments_business_type_length
    check (business_type is null or char_length(business_type) <= 200),
  add constraint workshop_payments_workflows_length
    check (workflows is null or char_length(workflows) <= 2000);
