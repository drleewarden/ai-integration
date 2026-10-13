/**
 * Seminar copy and links shared by client and server. Kept apart from
 * lib/members/seminar.ts, which imports node:crypto and is server-only.
 */
export const GOOGLE_REVIEW_URL =
  "https://g.page/r/CX-qWyywUKYkEBM/review?utm_source=seminar&utm_medium=qr&utm_campaign=seminar";

/** Exact wording stored with each opt-in as consent evidence (Spam Act 2003). */
export const SEMINAR_CONSENT_TEXT =
  "Yes, email me Creative Milk news, tips and offers. I can unsubscribe any time.";
