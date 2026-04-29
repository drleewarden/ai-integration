import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Navigation from "./components/Navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Consultant Australia | Custom AI Systems That Deliver Outcomes | Creative Milk",
  description:
    "Creative Milk builds custom AI systems for Australian mid-market businesses. Scoped, measured, delivered in 6–8 weeks. 50+ engagements. 95% outcome rate. Book a call.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0JX1S9YZ2G"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0JX1S9YZ2G');
          `}
        </Script>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-Z7VVQ67K');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-Z7VVQ67K"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Navigation />
        {children}
        <footer style={{ backgroundColor: "var(--midnight-ink)" }} className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <a href="/" className="text-lg font-bold" style={{ color: "var(--warm-cream)" }}>
                Creative Milk
              </a>
              <p className="text-sm mt-1" style={{ color: "rgba(245,240,232,0.5)" }}>
                AI implementation partners. Australia.
              </p>
            </div>
            <nav className="flex flex-wrap gap-6 text-sm" style={{ color: "rgba(245,240,232,0.6)" }}>
              <a href="/what-we-build" className="hover:text-white transition-colors">What We Build</a>
              <a href="/work" className="hover:text-white transition-colors">Work</a>
              <a href="/process" className="hover:text-white transition-colors">Process</a>
              <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="/insights" className="hover:text-white transition-colors">Insights</a>
              <a href="/about" className="hover:text-white transition-colors">About</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </nav>
            <p className="text-sm" style={{ color: "rgba(245,240,232,0.4)" }}>
              © 2026 Creative Milk. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
