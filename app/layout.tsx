import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Syne, DM_Mono } from "next/font/google";
import Analytics from "./components/Analytics";
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
    "Creative Milk builds AI systems scoped around your actual business problems. Strategy, custom solutions, integration, training -- measured by outcomes, not deliverables.",
  metadataBase: new URL("https://www.creative-milk.com.au"),
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        {/*
          Consent Mode v2 defaults. Must land before GTM loads or they are
          ignored. A future cookie banner calls `grantConsent()` /
          `denyConsent()` from `app/lib/gtm.ts` to update.
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
              security_storage: 'granted',
              wait_for_update: 500
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
      </body>
    </html>
  );
}
