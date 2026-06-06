import type { Metadata } from "next";
import data from "./data.json";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";

export const metadata: Metadata = {
  title: "Why 80% of AI Implementations Fail -- And the 5 Things That Separate the Ones That Don't | Creative Milk Insights",
  description: "67–80% of mid-market AI projects fail to deliver ROI. Here are the five specific failure modes we've seen across 50+ engagements -- and how to avoid each one.",
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