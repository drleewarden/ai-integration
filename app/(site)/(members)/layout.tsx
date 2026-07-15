import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

/**
 * Chrome for the members area -- same solid-nav treatment as (dark-nav).
 * Auth is enforced by middleware.ts (all of /members except /members/upgrade).
 */
export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav forceDark />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
