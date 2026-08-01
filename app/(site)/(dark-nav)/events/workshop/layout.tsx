import type { Metadata } from "next";

// The workshop page is a client component, so its metadata lives here.
// This route is an older duplicate of /events/workshop-melbourne (same event,
// different build) -- canonicalised to the live/promoted URL 2026-08-01
// (seo-audit-agent monthly run) to resolve the duplicate-content split; see
// reports/seo-audit/creative-milk.com.au/history.md for the finding.
export const metadata: Metadata = {
  title: "AI Automation Workshop, Melbourne | Creative Milk",
  description:
    "A two-hour, in-person AI workshop in Melbourne: learn the fundamentals in plain English and build a working automated email reply system for your business.",
  alternates: {
    canonical: "https://www.creative-milk.com.au/events/workshop-melbourne",
  },
};

export default function WorkshopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
