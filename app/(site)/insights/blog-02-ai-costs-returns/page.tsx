import type { Metadata } from "next";
import data from "./data.json";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";

export const metadata: Metadata = {
  title: "What AI Actually Costs an Australian Business -- And What It Returns | Creative Milk Insights",
  description: "What does AI implementation actually cost for an Australian mid-market business -- and what should you expect in return? A plain-English breakdown with real numbers.",
};

export default function BlogPost() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav />
      <main id="main" style={{ paddingTop: "68px" }}>
        <style dangerouslySetInnerHTML={{ __html: data.css }} />
        <div dangerouslySetInnerHTML={{ __html: data.html }} />
      </main>
      <Footer />
    </>
  );
}