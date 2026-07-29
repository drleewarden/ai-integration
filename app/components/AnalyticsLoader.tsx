"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { CONSENT_CHANGED_EVENT } from "./ConsentBanner";

const GTM_ID = "GTM-WLC8NXHD";

function hasOptedOut(): boolean {
  try {
    return window.localStorage.getItem("cm_consent") === "denied";
  } catch {
    return false;
  }
}

/** Loads GTM by default while preserving a visitor's saved footer opt-out. */
export default function AnalyticsLoader() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    setEnabled(!hasOptedOut());

    const onConsentChanged = (event: Event) => {
      const choice = (event as CustomEvent<"granted" | "denied">).detail;
      setEnabled(choice === "granted");
    };
    window.addEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
    return () =>
      window.removeEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
  }, []);

  if (enabled !== true) return null;

  return (
    <>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          title="Google Tag Manager"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
