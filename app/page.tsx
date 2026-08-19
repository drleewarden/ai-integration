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
  title: "AI Automation Melbourne | Custom AI Agents | Creative Milk",
  description:
    "Melbourne AI automation company building custom AI agents and workflow automations for Australian businesses. Measured by hours recovered and outcomes delivered.",
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
