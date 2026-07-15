import type { Metadata } from "next";

// The workshop page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "AI Automation Workshop, Melbourne | Creative Milk",
  description:
    "A two-hour, in-person AI workshop in Melbourne: learn the fundamentals in plain English and build a working automated email reply system for your business.",
};

export default function WorkshopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
