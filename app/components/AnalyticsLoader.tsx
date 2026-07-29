"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { CONSENT_CHANGED_EVENT } from "./ConsentBanner";

const GTM_ID = "GTM-WLC8NXHD";

function hasStoredConsent(): boolean {
  try {
    return window.localStorage.getItem("cm_consent") === "granted";
  } catch {
    return false;
  }
}

/**
 * Loads the live GTM container only after explicit consent. Gating the
 * container itself also covers custom Meta tags that do not automatically
 * honour Google's Consent Mode state.
 */
export default function AnalyticsLoader() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    setHasConsent(hasStoredConsent());

    const onConsentChanged = (event: Event) => {
      const choice = (event as CustomEvent<"granted" | "denied">).detail;
      setHasConsent(choice === "granted");
    };
    window.addEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
    return () =>
      window.removeEventListener(CONSENT_CHANGED_EVENT, onConsentChanged);
  }, []);

  if (!hasConsent) return null;

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
