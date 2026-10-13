/**
 * Cookie-based Supabase client for Server Components and route handlers.
 * Uses the ANON key - RLS applies (members can only read their own
 * member_profiles row). This is deliberately separate from
 * lib/supabase/server.ts (service role, RLS bypass), which stays reserved
 * for the webhook, signed URLs, and profile writes.
 */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { MemberTier } from "@/lib/members/items";
import { effectiveTier } from "@/lib/members/seminar";

export async function getAuthServerSupabase(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Server Components cannot set cookies; route handlers can.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignored: middleware refreshes sessions for Server Components.
          }
        },
      },
    },
  );
}

export async function getSessionUser(): Promise<User | null> {
  const supabase = await getAuthServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export interface MemberProfileRow {
  /** Effective tier: paid Pro or a live complimentary grant both read "pro". */
  tier: MemberTier;
  /** True when Pro comes only from a complimentary (seminar) grant. */
  complimentary: boolean;
  complimentary_pro_until: string | null;
  email: string;
  display_name: string | null;
  stripe_customer_id: string | null;
  subscription_status: string | null;
}

export async function getMemberProfile(): Promise<{
  user: User;
  profile: MemberProfileRow;
} | null> {
  const supabase = await getAuthServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("member_profiles")
    .select(
      "tier, email, display_name, stripe_customer_id, subscription_status, complimentary_pro_until",
    )
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    if (profileError)
      console.error("[members] profile read failed:", profileError);
    // Signed in but no profile row (trigger raced or was added later):
    // treat as free-tier with auth-user email so the page still renders.
    return {
      user: data.user,
      profile: {
        tier: "free",
        complimentary: false,
        complimentary_pro_until: null,
        email: data.user.email ?? "",
        display_name: null,
        stripe_customer_id: null,
        subscription_status: null,
      },
    };
  }

  // Fold the complimentary grant in here so every canAccess() call site gets
  // it without change. The raw paid tier stays the Stripe webhook's alone.
  const paidTier = profile.tier as MemberTier;
  const tier = effectiveTier(paidTier, profile.complimentary_pro_until);
  return {
    user: data.user,
    profile: {
      ...(profile as Omit<MemberProfileRow, "tier" | "complimentary">),
      tier,
      complimentary: tier === "pro" && paidTier !== "pro",
    },
  };
}
