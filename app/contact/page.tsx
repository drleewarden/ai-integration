"use client";
import { useState } from "react";

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
    body: "We'll have an initial view on whether we can help and what we'd propose. If we're not the right fit, we'll tell you that too — and point you toward someone who might be.",
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

  const inputStyle = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "12px",
    border: "1px solid rgba(15,21,38,0.15)",
    fontSize: "15px",
    backgroundColor: "white",
    color: "var(--midnight-ink)",
    outline: "none",
  };

  return (
    <main>
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--warm-cream)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--liquid-gold)" }}>
            BOOK A CALL
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-2xl leading-tight" style={{ color: "var(--midnight-ink)" }}>
            Tell us about the problem. We'll tell you if we're the right fit.
          </h1>
          <p className="text-lg max-w-xl leading-relaxed mb-16" style={{ color: "rgba(15,21,38,0.65)" }}>
            We respond within 24 hours with an honest answer: whether we can help, what we'd propose, and what a Discovery Sprint would look like for your specific situation.
          </p>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Trust signals + what happens next */}
            <div>
              <div className="mb-10">
                <h2 className="font-bold mb-4" style={{ color: "var(--midnight-ink)" }}>Before you submit</h2>
                <ul className="space-y-3">
                  {[
                    "No NDAs in the first call",
                    "No vague roadmaps — plain English next steps",
                    "Response within 24 hours (business days)",
                    "We'll tell you honestly if we're not the right fit",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-base" style={{ color: "rgba(15,21,38,0.7)" }}>
                      <span style={{ color: "var(--liquid-gold)", fontWeight: "bold" }}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="font-bold mb-6" style={{ color: "var(--midnight-ink)" }}>What happens after you submit</h2>
                <div className="space-y-6">
                  {nextSteps.map((s, i) => (
                    <div key={i} className="flex gap-4">
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: "var(--midnight-ink)", color: "var(--warm-cream)" }}
                      >
                        {s.step}
                      </div>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: "var(--midnight-ink)" }}>{s.label}</p>
                        <p className="text-sm leading-relaxed" style={{ color: "rgba(15,21,38,0.65)" }}>{s.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              {submitted ? (
                <div
                  className="p-10 rounded-3xl"
                  style={{ backgroundColor: "var(--midnight-ink)" }}
                >
                  <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--warm-cream)" }}>
                    Got it. We'll be in touch within 24 hours.
                  </h2>
                  <p className="text-base mb-8" style={{ color: "rgba(245,240,232,0.65)" }}>
                    Thanks for reaching out. Craig and Darryn will read this today and come back to you with an honest assessment. In the meantime —
                  </p>
                  <div className="space-y-4">
                    <a href="/work" className="block text-sm font-semibold underline" style={{ color: "var(--liquid-gold)" }}>
                      See our case studies → real outcomes from recent engagements
                    </a>
                    <a href="/process" className="block text-sm font-semibold underline" style={{ color: "var(--liquid-gold)" }}>
                      Read how our process works → what a Discovery Sprint actually looks like
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {status.type === "error" && (
                    <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: "rgba(220,53,69,0.1)", color: "#dc3545", border: "1px solid rgba(220,53,69,0.3)" }}>
                      {status.message}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(15,21,38,0.6)" }}>
                      Your name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(15,21,38,0.6)" }}>
                      Email address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@company.com.au"
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(15,21,38,0.6)" }}>
                      Company name *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your company"
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(15,21,38,0.6)" }}>
                      Tell us about the problem you're trying to solve *
                    </label>
                    <textarea
                      name="problem"
                      value={formData.problem}
                      onChange={handleChange}
                      placeholder="What's the specific operational challenge? What have you tried so far?"
                      rows={5}
                      style={{ ...inputStyle, resize: "vertical" }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(15,21,38,0.6)" }}>
                      Budget range <span style={{ color: "rgba(15,21,38,0.4)" }}>(optional — helps us propose the right phase)</span>
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      style={{ ...inputStyle, cursor: "pointer" }}
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
                    className="w-full py-4 rounded-full font-semibold text-base transition-all hover:opacity-90"
                    style={{
                      backgroundColor: submitting ? "rgba(201,168,76,0.6)" : "var(--liquid-gold)",
                      color: "var(--midnight-ink)",
                      cursor: submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {submitting ? "Sending..." : "Start the conversation →"}
                  </button>
                </form>
              )}

              {/* Alt contact */}
              {!submitted && (
                <div className="mt-8 pt-8 border-t" style={{ borderColor: "rgba(15,21,38,0.1)" }}>
                  <p className="text-sm" style={{ color: "rgba(15,21,38,0.5)" }}>
                    Prefer email?{" "}
                    <a href="mailto:hello@creative-milk.com.au" className="underline" style={{ color: "var(--midnight-ink)" }}>
                      hello@creative-milk.com.au
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
