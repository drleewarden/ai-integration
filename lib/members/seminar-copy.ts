/**
 * Seminar copy and links shared by client and server. Kept apart from
 * lib/members/seminar.ts, which imports node:crypto and is server-only.
 */
export const GOOGLE_REVIEW_URL =
  "https://g.page/r/CX-qWyywUKYkEBM/review?utm_source=seminar&utm_medium=qr&utm_campaign=seminar";

/** Exact wording stored with each opt-in as consent evidence (Spam Act 2003). */
export const SEMINAR_CONSENT_TEXT =
  "Yes, email me Creative Milk news, tips and offers. I can unsubscribe any time.";

/** Thank-you pop-up shown after the sign-up form submits. */
export const SEMINAR_THANKS_TEXT =
  "Thanks so much for attending our workshop. We really appreciate your time. I hope you enjoyed the session. We are now pushing you through to a Google review page. If you could give some feedback on the session, it'd be much appreciated. Thank you so much again, and we will be sending you the premium package.";

/** Seconds before the pop-up sends the attendee on to the review page. */
export const SEMINAR_REVIEW_REDIRECT_SECONDS = 5;
