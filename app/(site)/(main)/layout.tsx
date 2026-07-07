import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

/**
 * Shared chrome for standard site pages: skip link, transparent-at-top Nav,
 * main landmark, and Footer. Pages in this group render sections only.
 *
 * Pages that need the solid nav from the top live in the sibling
 * `(dark-nav)` group. Pages that manage their own chrome (ai-readiness,
 * opportunity-cost) stay outside both groups.
 */
export default function MainSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
