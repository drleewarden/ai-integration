import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import Analytics from "./components/Analytics";
import ConsentBanner from "./components/ConsentBanner";
import BackToTop from "./components/BackToTop";
import { OrganisationSchema, WebsiteSchema } from "./components/Schema";
import { PostHogProvider } from "./components/PostHogProvider";
import "./globals.css";

// Self-hosted so builds never depend on Google Fonts. Next 15 crashes on the
// extensionless /l/font?kit= URLs Google sometimes returns (vercel/next.js#99114,
// fixed only in 16.4.3). Latin files and weight declarations copied from Google's
// css2 response.
const cormorantGaramond = localFont({
  src: [
    { path: "./fonts/CormorantGaramond-latin-var.woff2", weight: "300", style: "normal" },
    { path: "./fonts/CormorantGaramond-latin-var.woff2", weight: "400", style: "normal" },
    { path: "./fonts/CormorantGaramond-latin-var.woff2", weight: "600", style: "normal" },
    { path: "./fonts/CormorantGaramond-latin-italic-var.woff2", weight: "300", style: "italic" },
    { path: "./fonts/CormorantGaramond-latin-italic-var.woff2", weight: "400", style: "italic" },
    { path: "./fonts/CormorantGaramond-latin-italic-var.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-cormorant-garamond",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const syne = localFont({
  src: [
    { path: "./fonts/Syne-latin-var.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Syne-latin-var.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Syne-latin-var.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Syne-latin-var.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = localFont({
  src: [
    { path: "./fonts/DMMono-latin-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/DMMono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/DMMono-latin-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Creative Milk - Intelligence that actually works",
  description:
    "Creative Milk builds AI systems scoped around your actual business problems - strategy, custom builds, integration, and training, measured by outcomes.",
  metadataBase: new URL("https://www.creative-milk.com.au"),
  // Relative canonical resolves against each route's own path, giving every
  // page a self-referencing canonical unless it overrides it.
  alternates: { canonical: "./" },
  openGraph: {
    title: "Creative Milk - Intelligence that actually works",
    description:
      "AI systems scoped around your actual business problems. Outcomes, not deliverables.",
    type: "website",
    siteName: "Creative Milk",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creative Milk - Intelligence that actually works",
    description:
      "AI systems scoped around your actual business problems. Outcomes, not deliverables.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F1526",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-AU"
      className={`${cormorantGaramond.variable} ${syne.variable} ${dmMono.variable}`}
    >
      <head>
        <meta name="facebook-domain-verification" content="iuiqmg6qd0cif7jsdr4z1iwdd7fnp1" />
        {/*
          Consent Mode v2 defaults for the footer-controlled opt-out model.
          Visitors can revoke non-essential tracking through Cookie settings.
        */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            var cmConsent = 'granted';
            try {
              if (window.localStorage.getItem('cm_consent') === 'denied') {
                cmConsent = 'denied';
              }
            } catch (e) {}
            gtag('consent', 'default', {
              ad_storage: cmConsent,
              ad_user_data: cmConsent,
              ad_personalization: cmConsent,
              analytics_storage: cmConsent,
              functionality_storage: 'granted',
              personalization_storage: cmConsent,
              security_storage: 'granted'
            });
          `}
        </Script>
      </head>
      <body className="antialiased">
        <OrganisationSchema />
        <WebsiteSchema />
        <Analytics />
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <BackToTop />
        <ConsentBanner />
        {/* Google Preferred Sources button renderer, see components/PreferredSource.tsx */}
        <Script
          id="google-preferred-source"
          src="https://news.google.com/swg/js/v1/publisher.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
