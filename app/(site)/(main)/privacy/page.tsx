import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Creative Milk",
  description:
    "How Creative Milk collects, uses, and protects personal information -- including analytics, forms, and third-party services -- under the Australian Privacy Act.",
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = "13 July 2026";

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="section"
        style={{
          backgroundColor: "var(--midnight-ink)",
          paddingTop: "clamp(6rem, 12vw, 9rem)",
        }}
      >
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>
            Privacy
          </p>
          <h1
            className="h-display"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              color: "var(--warm-cream)",
              maxWidth: "20ch",
              marginBottom: "1.5rem",
            }}
          >
            How we handle your <em className="gold">information.</em>
          </h1>
          <p
            className="body-copy"
            style={{
              color: "rgba(245,240,232,0.7)",
              maxWidth: "58ch",
            }}
          >
            Plain-English summary of what we collect, why, and what you can do
            about it. Effective {EFFECTIVE_DATE}.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="container" style={{ maxWidth: "72ch" }}>
          <PolicySection title="Who we are">
            <p>
              This site is operated by Creative Milk Pty Ltd (&quot;Creative Milk&quot;,
              &quot;we&quot;, &quot;us&quot;). Our registered address is Level 7, 80 Dorcas Street,
              South Melbourne, VIC 3205, Australia. We are bound by the
              Australian Privacy Principles under the Privacy Act 1988 (Cth).
            </p>
          </PolicySection>

          <PolicySection title="What we collect">
            <p>We collect two categories of information:</p>
            <ul>
              <li>
                <strong>Information you give us</strong> via forms on this site
                -- your name, email, business type, phone (where provided), and
                any free-text you enter (e.g. describing a workflow you&#39;d like
                automated, or answers in the AI Readiness assessment).
              </li>
              <li>
                <strong>Information collected automatically</strong> when you
                visit -- IP address, device and browser type, referring URL,
                pages viewed, timestamps, and interaction events (button
                clicks, form submissions). We do not collect precise location.
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="How we use it">
            <ul>
              <li>To respond to enquiries and deliver services you request.</li>
              <li>
                To email you the outputs of tools you use on the site (e.g. the
                AI Readiness playbook PDF).
              </li>
              <li>
                To improve the site -- understand which pages people find
                useful and where they get stuck.
              </li>
              <li>
                To measure the performance of marketing (which channels bring
                us aligned enquiries).
              </li>
              <li>
                To meet legal obligations (tax records, dispute resolution,
                etc.).
              </li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal information.
            </p>
          </PolicySection>

          <PolicySection title="Third-party services we use">
            <p>
              These services process some of your information on our behalf.
              Each has its own privacy policy governing what they do with it.
            </p>
            <ul>
              <li>
                <strong>Google Analytics 4 &amp; Google Tag Manager</strong> -- website
                analytics and event tracking. Uses cookies and processes IP
                addresses (which Google anonymises before storage). See the{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                  Google Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Meta Pixel (Facebook)</strong> -- measures the
                performance of Meta ad campaigns and helps us reach similar
                audiences. See the{" "}
                <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer">
                  Meta Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Supabase</strong> -- database hosting for the AI
                Readiness assessment. Data is stored in the Sydney region. See
                the{" "}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                  Supabase Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Resend</strong> -- delivers transactional emails
                (confirmations, playbook downloads). See the{" "}
                <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                  Resend Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Vercel</strong> -- website hosting. Automatically logs
                requests (IP, user agent, path) for a limited period for
                security and debugging. See the{" "}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                  Vercel Privacy Policy
                </a>
                .
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="Cookies and similar technologies">
            <p>
              This site uses cookies for analytics, marketing measurement, and
              essential functionality. You can control cookies via your
              browser settings:
            </p>
            <ul>
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chrome
                </a>{" "}
                &middot;{" "}
                <a
                  href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Firefox
                </a>{" "}
                &middot;{" "}
                <a
                  href="https://support.apple.com/en-au/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Safari
                </a>{" "}
                &middot;{" "}
                <a
                  href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Edge
                </a>
              </li>
              <li>
                Opt out of Google Analytics on any site by installing the{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>
                .
              </li>
              <li>
                Manage Meta&#39;s ad settings via your{" "}
                <a
                  href="https://accountscenter.facebook.com/ad_preferences"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Meta Ad Preferences
                </a>
                .
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="How long we keep it">
            <ul>
              <li>
                Form submissions and enquiries: retained while the enquiry is
                active plus 7 years for tax and legal record-keeping.
              </li>
              <li>
                AI Readiness assessment data: retained indefinitely under the
                anonymous ID we generate. You can request deletion at any time
                (see below).
              </li>
              <li>
                Analytics data: aggregated and stored by Google for 14 months
                per GA4&#39;s data retention setting.
              </li>
              <li>
                Server logs: 30 days.
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="Your rights">
            <p>Under Australian privacy law you can:</p>
            <ul>
              <li>Ask what personal information we hold about you.</li>
              <li>Ask us to correct information that is inaccurate.</li>
              <li>Ask us to delete your information (subject to legal exceptions like tax records).</li>
              <li>Withdraw consent to marketing communications at any time.</li>
              <li>
                Lodge a complaint with the{" "}
                <a href="https://www.oaic.gov.au/" target="_blank" rel="noopener noreferrer">
                  Office of the Australian Information Commissioner (OAIC)
                </a>{" "}
                if you believe we&#39;ve mishandled your information.
              </li>
            </ul>
            <p>
              To exercise any of these rights, use the{" "}
              <a href="/contact">contact form</a> and mention &quot;Privacy request&quot; --
              we&#39;ll respond within 30 days.
            </p>
          </PolicySection>

          <PolicySection title="Security">
            <p>
              We use industry-standard practices to protect your information:
              HTTPS across the site, encrypted database storage, restricted
              access to production systems, and rate-limiting on public forms.
              No system is perfect -- if we ever have reason to believe your
              data has been exposed, we&#39;ll notify you and the OAIC in
              accordance with the Notifiable Data Breaches scheme.
            </p>
          </PolicySection>

          <PolicySection title="Data location">
            <p>
              Our primary database (Supabase) is hosted in Sydney, Australia.
              Some third-party processors (Google, Meta, Resend, Vercel) may
              transfer or process data outside Australia -- typically in the
              US or EU -- under standard contractual protections.
            </p>
          </PolicySection>

          <PolicySection title="Children">
            <p>
              This site is not directed at children under 16 and we do not
              knowingly collect information from them.
            </p>
          </PolicySection>

          <PolicySection title="Changes to this policy">
            <p>
              We may update this policy from time to time. The effective date
              at the top reflects the latest version. Material changes will be
              noted on the homepage or emailed to affected users where
              practical.
            </p>
          </PolicySection>

          <PolicySection title="Contact">
            <p>
              Privacy questions or requests: use the{" "}
              <a href="/contact">contact form</a> or write to us at Level 7,
              80 Dorcas Street, South Melbourne, VIC 3205.
            </p>
          </PolicySection>
        </div>
      </section>
    </>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "clamp(2rem, 4vw, 3rem)" }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          lineHeight: 1.2,
          margin: "0 0 1rem",
          color: "var(--midnight-ink)",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "1rem",
          lineHeight: 1.7,
          color: "var(--slate-mid, #5a5a5a)",
        }}
        className="policy-prose"
      >
        {children}
      </div>
    </div>
  );
}
