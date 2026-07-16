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
          Consent Mode v2 defaults. Tracking storage granted by default —
          the /privacy page discloses what is collected and how to opt out
          via browser controls.
        */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
              analytics_storage: 'granted',
              functionality_storage: 'granted',
              personalization_storage: 'granted',
              security_storage: 'granted'
            });
          `}
        </Script>
      </head>
      <body className="antialiased">
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2179507452620533');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2179507452620533&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <OrganisationSchema />
        <WebsiteSchema />
        <Analytics />
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
