import type { Metadata } from "next";
import Nav from "../../components/Nav";
import Clients from "../../components/Clients";
import Contact from "../../components/Contact";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Clients | Creative Milk",
  description:
    "Companies Creative Milk has worked with across software, government, insurance, energy, health, retail, and design-led technology teams.",
};

export default function ClientsPage() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Clients standalone />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
