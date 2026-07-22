import type { Metadata } from "next";
import CheckoutButton from "@/app/components/members/CheckoutButton";

export const metadata: Metadata = {
  title: "Creative Milk Pro — every tool, plugin and guide | Creative Milk",
  description:
    "Upgrade to Creative Milk Pro for $29/month: the full library of AI tools, plugins, templates and playbooks for Australian small businesses.",
};

export const dynamic = "force-dynamic";

const INCLUSIONS = [
  "Every Pro guide and playbook, including new releases",
  "All downloadable plugins, skills and templates",
  "Every interactive tool in the members library",
  "Cancel any time from your account — no lock-in",
];

export default function UpgradePage() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ maxWidth: 640, marginInline: "auto" }}>
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>
            Members · Pro
          </p>
          <h1
            className="h-display"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              marginBottom: "1.5rem",
            }}
          >
            Unlock the whole library
          </h1>
          <p style={{ color: "var(--slate-mid)", lineHeight: 1.6 }}>
            The free plan gets you started. Pro gets you everything we build —
            the playbooks, plugins and tools we use inside real client
            engagements — for less than an hour of anyone's time.
          </p>
          <ul style={{ margin: "1.5rem 0", paddingLeft: "1.25rem", lineHeight: 1.9 }}>
            {INCLUSIONS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p style={{ fontSize: "1.5rem", margin: "2rem 0 1.5rem" }}>
            <strong>$29</strong> AUD / month
          </p>
          <CheckoutButton />
        </div>
      </div>
    </section>
  );
}
