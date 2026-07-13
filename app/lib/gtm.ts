/**
 * Google Tag Manager dataLayer helper.
 *
 * Use `pushEvent` to fire a Custom Event into the GTM container. Event names
 * are stable identifiers — GTM triggers match against them case-sensitively,
 * so prefer the `EVENTS` constants over inline strings.
 *
 * Consent Mode v2 helpers (`grantConsent` / `denyConsent`) are intended to be
 * wired into a future cookie banner. Defaults are set to `denied` in
 * `app/layout.tsx` before GTM loads.
 *
 * Never include PII (name, email, message bodies, IP) in event payloads.
 * Doing so violates the GA4 Terms of Service.
 */

type DataLayerEntry = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
  }
}

export const EVENTS = {
  CONTACT_FORM_SUBMIT: "contact_form_submit",
  CONTACT_FORM_ERROR: "contact_form_error",
  CTA_CLICK: "cta_click",
  WORKSHOP_SIGNUP_START: "workshop_signup_start",
  WORKSHOP_SIGNUP_SUBMIT: "workshop_signup_submit",
  WORKSHOP_SIGNUP_ERROR: "workshop_signup_error",
  NEWSLETTER_SUBMIT: "newsletter_submit",
  CONSENT_ACCEPT: "consent_accept",
  CONSENT_DECLINE: "consent_decline",
  COOKIE_SETTINGS_OPEN: "cookie_settings_open",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS] | (string & {});

export function pushEvent<T extends DataLayerEntry = DataLayerEntry>(
  event: EventName,
  payload?: T,
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...(payload ?? {}) });
}

type ConsentState = "granted" | "denied";

export type ConsentUpdate = {
  ad_storage?: ConsentState;
  ad_user_data?: ConsentState;
  ad_personalization?: ConsentState;
  analytics_storage?: ConsentState;
  functionality_storage?: ConsentState;
  personalization_storage?: ConsentState;
  security_storage?: ConsentState;
};

/**
 * Push a Consent Mode v2 update into the dataLayer.
 *
 * GTM's consent template reads consent state by listening for an
 * arguments-shaped push of the form ['consent', 'update', { ... }] — the same
 * shape the standard `gtag('consent', 'update', { ... })` shim produces. We
 * replicate that shape directly.
 */
export function updateConsent(update: ConsentUpdate): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.dataLayer.push(["consent", "update", update] as any);
}

export function grantConsent(): void {
  updateConsent({
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted",
    functionality_storage: "granted",
    personalization_storage: "granted",
    security_storage: "granted",
  });
}

export function denyConsent(): void {
  updateConsent({
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
}
