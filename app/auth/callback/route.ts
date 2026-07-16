/**
 * GET /auth/callback?code=...&next=/members
 *
 * Completes the Supabase auth code exchange for magic links, email
 * confirmations, and Google OAuth, then redirects to `next` (same-site
 * relative paths only). On failure, bounce to /login with a generic flag.
 */
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Resend } from "resend";
import { getServiceSupabase } from "@/lib/supabase/server";
import { safeNext } from "@/lib/members/safe-next";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = safeNext(req.nextUrl.searchParams.get("next"), req.url);

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=1", req.url));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchange failed:", error);
    return NextResponse.redirect(new URL("/login?error=1", req.url));
  }

  // Welcome email, once per member. Never blocks login -- all failures are
  // logged and swallowed. welcomed_at is set BEFORE sending so a Resend
  // hiccup can't cause duplicate sends on the next login.
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (user) {
      const service = getServiceSupabase();
      const { data: updated } = await service
        .from("member_profiles")
        .update({ welcomed_at: new Date().toISOString() })
        .eq("id", user.id)
        .is("welcomed_at", null)
        .select("id")
        .maybeSingle();

      if (updated && process.env.RESEND_API_KEY && user.email) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM ?? "Creative Milk <hello@creative-milk.com.au>",
          to: user.email,
          subject: "Welcome to Creative Milk Members",
          html: `
            <p>G'day,</p>
            <p>Your free Creative Milk members account is live. Your library of
            tools, plugins and guides is here:</p>
            <p><a href="https://www.creative-milk.com.au/members">Open your library</a></p>
            <p>Everything marked <strong>Pro</strong> is part of the $29/month
            plan — upgrade any time from your account page.</p>
            <p>— The Creative Milk team</p>
          `,
        });
      }
    }
  } catch (err) {
    console.error("[auth/callback] welcome email failed:", err);
  }

  return NextResponse.redirect(new URL(next, req.url));
}
