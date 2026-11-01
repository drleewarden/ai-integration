import type { Metadata } from "next";
import data from "./data.json";
import { withExternalLinkTargets } from "@/lib/external-links";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "AI for Construction and Trades | Creative Milk",
  description: "Construction and trades has some of the highest AI ROI potential of any Australian industry, and almost no specialist serving it. See where the time savings are.",
};

export default function BlogPost() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav />
      <main id="main" style={{ paddingTop: "68px" }}>
        <style dangerouslySetInnerHTML={{ __html: data.css }} />
        <div dangerouslySetInnerHTML={{ __html: withExternalLinkTargets(data.html) }} />
      </main>
      <Footer />
    </>
  );
}