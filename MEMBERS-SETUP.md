# Members Area — Manual Setup

One-time dashboard tasks that code cannot do. Complete in order.

## 1. Supabase

1. **Pre-flight (critical):** run the two verification queries at the top of
   `supabase/migrations/0002_members_area.sql` (team users all have profiles
   rows; no auto-profiles trigger on auth.users).
2. Run `supabase/migrations/0002_members_area.sql` in the SQL editor.
3. Auth → Providers: enable **Email** (magic link + password) and **Google**.
   Google needs an OAuth client from Google Cloud Console
   (APIs & Services → Credentials → OAuth client ID → Web application), with
   authorised redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
4. Auth → URL Configuration: set Site URL to
   `https://www.creative-milk.com.au`, add redirect URLs:
   `https://www.creative-milk.com.au/auth/callback`,
   `http://localhost:3000/auth/callback`.
5. Storage: confirm the private `member-files` bucket exists (created by the
   migration). Upload seed file to
   `ai-policy-template/ai-policy-template-v1.zip`.
6. Settings → API: copy the **anon public** key.

## 2. Stripe

1. Products → Add product: "Creative Milk Pro", recurring **$29.00 AUD
   monthly**. Copy the price ID (`price_…`).
2. Developers → Webhooks → Add endpoint:
   `https://www.creative-milk.com.au/api/stripe/webhook`, events:
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Copy the signing secret (`whsec_…`).
3. Settings → Billing → Customer portal: enable, allow cancellations.
4. For local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   (use the CLI's whsec in `.env.local`).

## 3. Environment variables (Vercel + .env.local)

| Var | Where from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings → API |
| `STRIPE_SECRET_KEY` | Stripe Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint |
| `STRIPE_PRICE_ID_PRO` | Stripe product price |

Existing vars unchanged. Redeploy after adding.

## 4. Smoke test (Stripe test mode first)

1. Sign up with a fresh email → welcome email arrives → library renders,
   Pro guide locked.
2. Upgrade with test card `4242 4242 4242 4242` → redirected to account →
   Pro guide unlocked.
3. Download the free template → file downloads.
4. Cancel via Manage billing → after period end (or immediately in test
   clock), tier returns to free.
