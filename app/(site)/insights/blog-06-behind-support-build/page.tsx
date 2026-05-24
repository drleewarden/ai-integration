import type { Metadata } from "next";
import data from "./data.json";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";

export const metadata: Metadata = {
  title: "Blog Article 06: How We Cut Support Ticket Volume by 60% -- A Behind-the-Scenes Look | Creative Milk Insights",
  description: "A detailed look at the AI system Creative Milk built for a SaaS customer support platform -- the architecture, the integrations, what went wrong, and the 60% ticket reduction outcome.",
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