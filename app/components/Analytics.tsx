import AnalyticsLoader from "./AnalyticsLoader";

/**
 * Google Tag Manager loader.
 *
 * This container owns the site's Google and Meta browser/server tracking.
 * Keep it pinned here so a stale deployment environment variable cannot load
 * the retired container. Only a Vercel production deployment can render the
 * loader; development, local production builds, and Preview deployments do
 * not send events into production ads data.
 *
 * Visitors can revoke analytics and advertising consent through the footer's
 * Cookie settings control.
 */
export default function Analytics() {
  if (process.env.VERCEL_ENV !== "production") return null;
  return <AnalyticsLoader />;
}
