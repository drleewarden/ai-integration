import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/auth-server";
import { getServiceSupabase } from "@/lib/supabase/server";
import {
  GOOGLE_REVIEW_URL,
  SEMINAR_PRO_DAYS,
  complimentaryUntil,
} from "@/lib/members/seminar";

export const metadata: Metadata = {
  title: "You're in | Creative Milk Members",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Post-magic-link landing for seminar attendees. Grants complimentary Pro
 * once per seminar_signups row, matched on the SIGNED-IN user's email (from
 * the verified Supabase session, never from the URL). The row only exists
 * if the API accepted a valid QR code, so that is the access check.
 * Idempotent: granted_at stops a refresh from extending access.
 */
async function grantFor(userId: string, email: string) {
  const service = getServiceSupabase();
  const { data: signup } = await service
    .from("seminar_signups")
    .select("id, name, granted_at")
    .eq("email", email.toLowerCase())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!signup) return null;

  const { data: profile } = await service
    .from("member_profiles")
    .select("display_name, complimentary_pro_until")
    .eq("id", userId)
    .maybeSingle();

  if (signup.granted_at) {
    return { name: signup.name as string, until: profile?.complimentary_pro_until ?? null };
  }

  const until = complimentaryUntil(profile?.complimentary_pro_until ?? null, SEMINAR_PRO_DAYS);

  const { error } = await service
    .from("member_profiles")
    .update({
      complimentary_pro_until: until.toISOString(),
      ...(profile?.display_name ? {} : { display_name: signup.name }),
    })
    .eq("id", userId);
  if (error) {
    console.error("[seminar/welcome] grant failed:", error.code, error.message);
    return null;
  }
  await service
    .from("seminar_signups")
    .update({ granted_at: new Date().toISOString(), member_id: userId })
    .eq("id", signup.id);

  return { name: signup.name as string, until: until.toISOString() };
}

export default async function SeminarWelcomePage() {
  const user = await getSessionUser();
  const grant = user?.email ? await grantFor(user.id, user.email) : null;
  const firstName = grant?.name.split(/\s+/)[0];

  return (
    <section className="section members-auth-section">
      <div className="container">
        <div style={{ maxWidth: 520, marginInline: "auto" }}>
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>
            Seminar attendees
          </p>

          {!user ? (
            <>
              <h1 className="h-display" style={{ fontSize: "clamp(2.25rem, 5vw, 3rem)", marginBottom: "1rem" }}>
                Sign in to unlock your pack
              </h1>
              <p>
                <Link href="/login?next=%2Fseminar%2Fwelcome">Sign in</Link>{" "}
                with the email you used at the seminar.
              </p>
            </>
          ) : !grant ? (
            <>
              <h1 className="h-display" style={{ fontSize: "clamp(2.25rem, 5vw, 3rem)", marginBottom: "1rem" }}>
                We couldn&rsquo;t find your seminar sign-up
              </h1>
              <p style={{ color: "var(--slate-mid)" }}>
                Make sure you&rsquo;re signed in with the same email you
                entered at the seminar, or email{" "}
                <a href="mailto:contact@creative-milk.com.au">contact@creative-milk.com.au</a>{" "}
                and we&rsquo;ll unlock it for you.
              </p>
            </>
          ) : (
            <>
              <h1 className="h-display" style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "1rem" }}>
                You&rsquo;re in{firstName ? `, ${firstName}` : ""}. <em className="gold">Pack unlocked.</em>
              </h1>
              <p style={{ color: "var(--slate-mid)", marginBottom: "2rem" }}>
                Your premium pack is live
                {grant.until
                  ? ` until ${new Date(grant.until).toLocaleDateString("en-AU", { dateStyle: "long" })}`
                  : ""}
                . Every Pro guide, plugin and tool in the library is yours.
              </p>
              <Link href="/members/library" className="cta cta-gold" style={{ justifyContent: "center" }}>
                Open your library
              </Link>

              {/* The review ask is separate from, and not a condition of,
                  access (Google review policy bans incentivised reviews). */}
              <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--rule)" }}>
                <p className="eyebrow no-rule" style={{ marginBottom: "0.75rem" }}>
                  One small favour
                </p>
                <p style={{ marginBottom: "1.5rem" }}>
                  If you got something out of today, an honest Google review
                  helps other business owners find us. It takes a minute.
                </p>
                <a
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta cta-outline-ink"
                  style={{ justifyContent: "center" }}
                >
                  Leave a Google review
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
