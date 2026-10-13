import type { Metadata } from "next";
import Link from "next/link";
import SeminarForm from "@/app/components/members/SeminarForm";
import { isSeminarCodeValid } from "@/lib/members/seminar";

export const metadata: Metadata = {
  title: "Seminar premium pack | Creative Milk Members",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * QR landing page for seminar attendees: /seminar?c=<SEMINAR_CODE>.
 * The code is checked here only to choose what to render; the API route
 * re-checks it, so editing the URL can't skip the gate.
 */
export default async function SeminarPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const valid = isSeminarCodeValid(c);

  return (
    <section className="section members-auth-section">
      <div className="container">
        <div style={{ maxWidth: 420, marginInline: "auto" }}>
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>
            Seminar attendees
          </p>
          <h1
            className="h-display"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              marginBottom: "1rem",
            }}
          >
            Thanks for coming. Here&rsquo;s your <em className="gold">premium pack.</em>
          </h1>
          {valid ? (
            <>
              <p style={{ color: "var(--slate-mid)", marginBottom: "2rem" }}>
                Pop in your name and email and we&rsquo;ll unlock the full
                Creative Milk Pro library of AI guides, plugins and tools.
                No card needed.
              </p>
              <SeminarForm code={c!} />
            </>
          ) : (
            <p style={{ color: "var(--slate-mid)" }}>
              This seminar link has expired or isn&rsquo;t valid. You can
              still <Link href="/signup">create a free account</Link>, or
              email <a href="mailto:contact@creative-milk.com.au">contact@creative-milk.com.au</a>{" "}
              and we&rsquo;ll sort you out.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
