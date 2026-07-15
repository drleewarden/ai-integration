"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

const budgetOptions = [
  "Under $10K",
  "$10K–$30K",
  "$30K–$80K",
  "$80K–$150K",
  "$150K+",
  "Unsure",
];

const nextSteps = [
  {
    step: "1",
    label: "We read it (same day)",
    body: "Craig and Darryn both read every submission. You're not going into a CRM queue.",
  },
  {
    step: "2",
    label: "We assess the fit (within 24 hours)",
    body: "We'll have an initial view on whether we can help and what we'd propose. If we're not the right fit, we'll tell you that too -- and point you toward someone who might be.",
  },
  {
    step: "3",
    label: "We reach out directly",
    body: "Not an automated sequence. A direct email from Craig or Darryn with our assessment and a suggested next step.",
  },
  {
    step: "4",
    label: "First call (30 minutes)",
    body: "If we both think there's a fit, we set up a 30-minute call. We ask questions. You ask questions. No pitch deck.",
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    problem: "",
    budget: "",
  });
  const [status, setStatus] = useState<{ type: string; message: string }>({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    if (!formData.name || !formData.email || !formData.company || !formData.problem) {
      setStatus({ type: "error", message: "Please fill in all required fields." });
      setSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          message: `Problem: ${formData.problem}\n\nBudget range: ${formData.budget || "Not specified"}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setStatus({ type: "error", message: data.error || "Failed to send. Please try again." });
      }
    } catch {
      setStatus({ type: "error", message: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
        {/* Hero -- light background */}
        <section
          className="section-tight"
          style={{
            backgroundColor: "var(--warm-cream)",
            paddingTop: "clamp(6rem, 12vw, 9rem)",
          }}
        >
          <div className="container">
            <span className="eyebrow" style={{ marginBottom: "1.5rem" }}>Book a Call</span>
            <h1
              className="h-display"
              style={{
                color: "var(--midnight-ink)",
                fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
                maxWidth: "20ch",
                marginTop: "1.25rem",
                marginBottom: "1.25rem",
              }}
            >
              Tell us about the problem.{" "}
              <em className="gold">We'll tell you if we're the right fit.</em>
            </h1>
            <p
              className="body-copy"
              style={{ maxWidth: "48ch", marginBottom: 0 }}
            >
              We respond within 24 hours with an honest answer: whether we can help, what we'd propose,
              and what a Discovery Sprint would look like for your specific situation.
            </p>
          </div>
        </section>

        {/* Main content -- dark background for form */}
        <section
          className="section"
          style={{ backgroundColor: "var(--midnight-ink)" }}
        >
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) minmax(0,1.1fr)",
                gap: "clamp(3rem,6vw,6rem)",
                alignItems: "start",
              }}
            >
              {/* Left: trust signals + what happens next */}
              <div>
                {/* Trust signals */}
                <div
                  style={{
                    paddingBottom: "clamp(2rem,4vw,3rem)",
                    borderBottom: "1px solid var(--rule-cream)",
                    marginBottom: "clamp(2rem,4vw,3rem)",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 300,
                      fontSize: "1.4rem",
                      color: "var(--warm-cream)",
                      marginBottom: "1.25rem",
                    }}
                  >
                    Before you submit
                  </h2>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {[
                      "No NDAs in the first call",
                      "No vague roadmaps -- plain English next steps",
                      "Response within 24 hours (business days)",
                      "We'll tell you honestly if we're not the right fit",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="body-copy"
                        style={{
                          color: "rgba(245,240,232,0.7)",
                          display: "flex",
                          gap: "0.75rem",
                          marginBottom: "0.65rem",
                        }}
                      >
                        <span style={{ color: "var(--liquid-gold)", fontFamily: "var(--font-mono)" }}>--</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What happens next */}
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 300,
                      fontSize: "1.4rem",
                      color: "var(--warm-cream)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    What happens after you submit
                  </h2>
                  <div>
                    {nextSteps.map((s, i) => (
                      <div
                        key={i}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2.5rem 1fr",
                          gap: "1rem",
                          paddingBottom: "1.5rem",
                          marginBottom: "1.5rem",
                          borderBottom: i < nextSteps.length - 1 ? "1px solid var(--rule-cream)" : "none",
                        }}
                      >
                        <div
                          style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            backgroundColor: "var(--liquid-gold)",
                            color: "var(--midnight-ink)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {s.step}
                        </div>
                        <div>
                          <p
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              color: "var(--warm-cream)",
                              marginBottom: "0.4rem",
                            }}
                          >
                            {s.label}
                          </p>
                          <p
                            className="body-copy"
                            style={{ color: "rgba(245,240,232,0.55)", fontSize: "0.85rem" }}
                          >
                            {s.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: form */}
              <div>
                {submitted ? (
                  <div
                    style={{
                      border: "1px solid var(--rule-cream-strong)",
                      padding: "clamp(2.5rem,4vw,4rem)",
                    }}
                  >
                    <h2
                      className="h-section"
                      style={{
                        color: "var(--warm-cream)",
                        marginBottom: "1rem",
                        fontSize: "clamp(1.75rem,3vw,2.5rem)",
                      }}
                    >
                      Got it. We'll be in touch within 24 hours.
                    </h2>
                    <p
                      className="body-copy"
                      style={{ color: "rgba(245,240,232,0.65)", marginBottom: "2rem" }}
                    >
                      Thanks for reaching out. Craig and Darryn will read this today and come back to you
                      with an honest assessment. In the meantime --
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <a href="/work" className="cta-link">
                        See our case studies → real outcomes from recent engagements <ArrowRight size={11} />
                      </a>
                      <a href="/process" className="cta-link">
                        Read how our process works → what a Discovery Sprint actually looks like <ArrowRight size={11} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {status.type === "error" && (
                      <div
                        style={{
                          padding: "1rem 1.25rem",
                          backgroundColor: "rgba(220,53,69,0.12)",
                          border: "1px solid rgba(220,53,69,0.3)",
                          color: "#f87171",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {status.message}
                      </div>
                    )}

                    <div>
                      <label
                        className="label"
                        htmlFor="contact-name"
                        style={{ color: "rgba(245,240,232,0.55)", display: "block", marginBottom: "0.5rem" }}
                      >
                        Name *
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Jane Smith"
                        className="input-dark"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="label"
                        htmlFor="contact-email"
                        style={{ color: "rgba(245,240,232,0.55)", display: "block", marginBottom: "0.5rem" }}
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jane@company.com.au"
                        className="input-dark"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="label"
                        htmlFor="contact-company"
                        style={{ color: "rgba(245,240,232,0.55)", display: "block", marginBottom: "0.5rem" }}
                      >
                        Company *
                      </label>
                      <input
                        type="text"
                        id="contact-company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your company"
                        className="input-dark"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="label"
                        htmlFor="contact-problem"
                        style={{ color: "rgba(245,240,232,0.55)", display: "block", marginBottom: "0.5rem" }}
                      >
                        Tell us about your project *
                      </label>
                      <textarea
                        id="contact-problem"
                        name="problem"
                        value={formData.problem}
                        onChange={handleChange}
                        placeholder="What's the specific operational challenge? What have you tried so far?"
                        rows={5}
                        className="input-dark"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="label"
                        htmlFor="contact-budget"
                        style={{ color: "rgba(245,240,232,0.55)", display: "block", marginBottom: "0.5rem" }}
                      >
                        Budget{" "}
                        <span style={{ color: "rgba(245,240,232,0.3)" }}>(optional)</span>
                      </label>
                      <select
                        id="contact-budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="input-dark"
                        style={{ cursor: "pointer" }}
                      >
                        <option value="">Select a range...</option>
                        {budgetOptions.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="cta cta-gold"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        opacity: submitting ? 0.6 : 1,
                        cursor: submitting ? "not-allowed" : "pointer",
                      }}
                    >
                      {submitting ? "Sending..." : <>Start the conversation <ArrowRight size={14} /></>}
                    </button>
                  </form>
                )}

                {/* Alt contact */}
                {!submitted && (
                  <div
                    style={{
                      marginTop: "2rem",
                      paddingTop: "1.5rem",
                      borderTop: "1px solid var(--rule-cream)",
                    }}
                  >
                    <p className="body-copy" style={{ color: "rgba(245,240,232,0.45)", fontSize: "0.85rem" }}>
                      Prefer email?{" "}
                      <a
                        href="mailto:contact@creative-milk.com.au"
                        style={{
                          color: "var(--liquid-gold)",
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        contact@creative-milk.com.au
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
