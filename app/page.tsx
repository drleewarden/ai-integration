import type { Metadata } from "next";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Services from "./components/Services";
import Work from "./components/Work";
import Process from "./components/Process";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Creative Milk — Intelligence that actually works",
  description:
    "Creative Milk builds custom AI systems for Australian businesses — scoped around your specific problem, measured by outcomes you can point to. No buzzwords. No black boxes.",
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
        <Services />
        <Work />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
