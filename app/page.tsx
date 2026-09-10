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
  title: "AI Automation & Specialised Websites | Creative Milk Melbourne",
  description:
    "Creative Milk builds custom AI agents, workflow automations and specialised business websites. Melbourne-based strategy, design and development for Australian businesses.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "AI Automation & Specialised Websites | Creative Milk",
    description: "Custom AI agents, workflow automation and business websites, built around your business goals.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Automation & Specialised Websites | Creative Milk",
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
