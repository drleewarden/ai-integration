import type { Metadata } from "next";
import Nav from "@/app/components/Nav";
import WebsiteShowcase from "./WebsiteShowcase";
import "./websites.css";

export const metadata: Metadata = {
  title: "Selected Website Work | Creative Milk",
  description:
    "A curated selection of digital products and websites Darryn Lee-Warden helped bring to life.",
  alternates: { canonical: "https://websites.creative-milk.com.au" },
};

export default function WebsitesPortfolioPage() {
  return (
    <>
      <a href="#websites-main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <WebsiteShowcase />
    </>
  );
}
