import type { Metadata } from "next";

// The contact page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Contact Creative Milk | Book an AI Consultation",
  description:
    "Tell us the business problem you want AI to solve. Craig and Darryn read every submission and reply directly within one business day.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
