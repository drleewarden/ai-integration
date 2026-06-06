import type { Metadata } from "next";
import data from "./data.json";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";

export const metadata: Metadata = {
  title: "Your AI System Shipped. Now the Real Work Begins -- How to Get Your Team to Actually Use It | Creative Milk Insights",
  description: "Most AI projects don't fail because the technology doesn't work. They fail because the team doesn't adopt it. Here's the adoption framework we use across every Creative Milk engagement.",
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