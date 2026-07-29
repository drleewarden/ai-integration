import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Syne, DM_Mono } from "next/font/google";
import Analytics from "./components/Analytics";
import ConsentBanner from "./components/ConsentBanner";
import BackToTop from "./components/BackToTop";
import { OrganisationSchema, WebsiteSchema } from "./components/Schema";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Creative Milk -- Intelligence that actually works",
  description:
    "Creative Milk builds AI systems scoped around your actual business problems -- strategy, custom builds, integration, and training, measured by outcomes.",
  metadataBase: new URL("https://www.creative-milk.com.au"),
  // Relative canonical resolves against each route's own path, giving every
  // page a self-referencing canonical unless it overrides it.
  alternates: { canonical: "./" },
  openGraph: {
    title: "Creative Milk -- Intelligence that actually works",
    description:
      "AI systems scoped around your actual business problems. Outcomes, not deliverables.",
    type: "website",
    siteName: "Creative Milk",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creative Milk -- Intelligence that actually works",
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
      lang="en"
      className={`${cormorantGaramond.variable} ${syne.variable} ${dmMono.variable}`}
    >
      <head>
        <meta name="facebook-domain-verification" content="iuiqmg6qd0cif7jsdr4z1iwdd7fnp1" />
        {/*
          Consent Mode v2 defaults. Non-essential storage stays denied until
          the visitor explicitly accepts it in ConsentBanner.
        */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              functionality_storage: 'granted',
              personalization_storage: 'denied',
              security_storage: 'granted'
            });
          `}
        </Script>
      </head>
      <body className="antialiased">
        <OrganisationSchema />
        <WebsiteSchema />
        <Analytics />
        {children}
        <BackToTop />
        <ConsentBanner />
      </body>
    </html>
  );
}
