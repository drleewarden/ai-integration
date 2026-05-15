import type { Metadata } from "next";
import data from "./data.json";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Blog Article 05: What Is an AI Agent — And Do I Actually Need One? | Creative Milk Insights",
  description: "AI agents are being sold as the answer to everything right now. Here's a plain-English explanation of what they actually are, when you need one, and when you don't.",
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