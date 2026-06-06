import type { Metadata } from "next";
import data from "./data.json";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";

export const metadata: Metadata = {
  title: "AI for Accounting Firms: 6 Processes You Can Automate in Under 8 Weeks | Creative Milk Insights",
  description: "Six specific accounting processes that Australian firms are automating with AI right now -- with realistic timelines, costs, and outcomes. A practical guide from Creative Milk.",
};

export default function BlogPost() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav forceDark />
      <main id="main" style={{ paddingTop: "68px" }}>
        <style dangerouslySetInnerHTML={{ __html: data.css }} />
        <div dangerouslySetInnerHTML={{ __html: data.html }} />
      </main>
      <Footer />
    </>
  );
}