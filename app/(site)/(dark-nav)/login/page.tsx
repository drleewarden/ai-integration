import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/app/components/members/AuthForm";

export const metadata: Metadata = {
  title: "Sign in | Creative Milk Members",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <section className="section" style={{ maxWidth: 420, margin: "0 auto" }}>
      <p className="eyebrow">Members</p>
      <h1 className="h-display">Sign in</h1>
      <AuthForm mode="login" next={next ?? null} />
      <p style={{ marginTop: "1.5rem" }}>
        New here?{" "}
        <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}>
          Create a free account
        </Link>
      </p>
    </section>
  );
}
