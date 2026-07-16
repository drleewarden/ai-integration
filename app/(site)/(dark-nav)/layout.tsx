import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

/**
 * Same chrome as `(main)`, but the Nav renders its solid (scrolled) style
 * from the top of the page -- for pages whose hero doesn't suit the
 * transparent nav (blog posts, workshop).
 */
export default function DarkNavLayout({
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
