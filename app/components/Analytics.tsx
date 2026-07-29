import Script from "next/script";

/**
 * Google Tag Manager loader.
 *
 * This container owns the site's Google and Meta browser/server tracking.
 * Keep it pinned here so a stale deployment environment variable cannot load
 * the retired container. It is disabled in development and Vercel Preview
 * deployments so test events do not contaminate production ads data.
 *
 * `NEXT_PUBLIC_GTM_AUTH` + `NEXT_PUBLIC_GTM_PREVIEW` are optional and used to
 * point a deployment at a non-Live GTM environment (e.g. the Preview
 * environment configured inside the container). Production should leave both
 * blank so the Live container is served.
 *
 * Consent Mode v2 defaults are set in `app/layout.tsx` with
 * `strategy="beforeInteractive"` so they land before this loader runs.
 */
export default function Analytics() {
  const vercelEnvironment = process.env.VERCEL_ENV;
  const isProduction =
    vercelEnvironment === "production" ||
    (!vercelEnvironment && process.env.NODE_ENV === "production");
  if (!isProduction) return null;

  const gtmId = "GTM-WLC8NXHD";

  const gtmAuth = process.env.NEXT_PUBLIC_GTM_AUTH ?? "";
  const gtmPreview = process.env.NEXT_PUBLIC_GTM_PREVIEW ?? "";
  const envSuffix =
    gtmAuth && gtmPreview
      ? `&gtm_auth=${gtmAuth}&gtm_preview=${gtmPreview}&gtm_cookies_win=x`
      : "";

  return (
    <>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl+'${envSuffix}';f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}${envSuffix}`}
          title="Google Tag Manager"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
