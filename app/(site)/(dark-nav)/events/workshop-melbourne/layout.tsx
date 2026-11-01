import type { Metadata } from "next";
import { EventSchema } from "@/app/components/Schema";

// The workshop page is a client component, so its metadata lives here.
// This route had no layout.tsx at all and was silently inheriting the root
// layout's generic homepage title/description + no Event schema - fixed
// 2026-08-01 (seo-audit-agent monthly run) ahead of the Fri 7 Aug 2026 event.
// This is the live, promoted workshop URL (see marketing-context.md);
// /events/workshop is an older duplicate, now canonicalised here.
export const metadata: Metadata = {
  title: "AI Automation Workshop, Melbourne | Creative Milk",
  description:
    "A two-hour, in-person AI workshop in Melbourne. The founding cohort ran on Friday 7 August 2026; ask Creative Milk about the next date.",
};

export default function WorkshopMelbourneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EventSchema />
      {children}
    </>
  );
}
