import type { Metadata } from "next";
import Link from "next/link";
import { getMemberProfile } from "@/lib/supabase/auth-server";
import ManageBillingButton from "@/app/components/members/ManageBillingButton";
import SignOutButton from "@/app/components/members/SignOutButton";

export const metadata: Metadata = {
  title: "Your account | Creative Milk Members",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const { upgraded } = await searchParams;
  const member = await getMemberProfile();
  if (!member) return null; // middleware guards; belt-and-braces

  const { profile } = member;

  return (
    <section className="section">
      <div className="container">
        <div style={{ maxWidth: 640, marginInline: "auto" }}>
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>
            Members
          </p>
          <h1
            className="h-display"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              marginBottom: "2rem",
            }}
          >
            Your account
          </h1>

          {upgraded === "1" && (
            <p role="status" style={{ color: "var(--liquid-gold)" }}>
              Welcome to Pro! Your library is fully unlocked. (If items still
              show as locked, give it a few seconds and refresh.)
            </p>
          )}

          <dl style={{ margin: 0 }}>
            <dt className="eyebrow no-rule" style={{ marginBottom: "0.35rem" }}>
              Email
            </dt>
            <dd style={{ margin: "0 0 1.5rem", fontSize: "1.125rem" }}>
              {profile.email}
            </dd>
            <dt className="eyebrow no-rule" style={{ marginBottom: "0.35rem" }}>
              Plan
            </dt>
            <dd style={{ margin: 0, fontSize: "1.125rem" }}>
              {profile.tier === "pro" ? "Pro — $29/month" : "Free"}
              {profile.tier === "free" && (
                <>
                  {" · "}
                  <Link href="/members/upgrade">Upgrade to Pro</Link>
                </>
              )}
            </dd>
          </dl>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: "1px solid var(--rule)",
              flexWrap: "wrap",
            }}
          >
            {profile.stripe_customer_id && <ManageBillingButton />}
            <SignOutButton />
          </div>
        </div>
      </div>
    </section>
  );
}
