import type { Metadata } from "next";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Clients from "./components/Clients";
import Services from "./components/Services";
import Work from "./components/Work";
import Process from "./components/Process";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  // Brand first: "creative milk" is the site's biggest query and page one is
  // shared with unrelated agencies of the same name, so the title leads with
  // the brand and says what this Creative Milk does.
  title: "Creative Milk | AI Automation & Specialised Websites, Melbourne",
  description:
    "Creative Milk is a Melbourne AI consultancy. We build custom AI agents, workflow automations and specialised business websites for Australian businesses.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Creative Milk | AI Automation & Specialised Websites",
    description: "Custom AI agents, workflow automation and business websites, built around your business goals.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creative Milk | AI Automation & Specialised Websites",
    description: "Custom AI agents, workflow automation and business websites, built around your business goals.",
  },
};

export default function CreativeMilkSite() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Marquee />
        <Clients />
        <Services />
        <Work />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
