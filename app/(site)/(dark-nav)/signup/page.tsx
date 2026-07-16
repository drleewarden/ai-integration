import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/app/components/members/AuthForm";

export const metadata: Metadata = {
  title: "Create your free account | Creative Milk Members",
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <section className="section" style={{ maxWidth: 420, margin: "0 auto" }}>
      <p className="eyebrow">Members</p>
      <h1 className="h-display">Create your free account</h1>
      <p>
        Free tools, plugins and guides for Australian small businesses — no
        card required.
      </p>
      <AuthForm mode="signup" next={next ?? null} />
      <p style={{ marginTop: "1.5rem" }}>
        Already a member?{" "}
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>
          Sign in
        </Link>
      </p>
    </section>
  );
}
