"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";
import { EVENTS, pushEvent } from "../../../lib/gtm";

const businessTypes = [
  "Solo / freelance",
  "Startup (1–10)",
  "Small business (11–50)",
  "Mid-market (51–250)",
  "Enterprise (250+)",
  "Agency / consultancy",
  "Non-profit / government",
  "Other",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success" }
  | { type: "error"; message: string };

export default function WorkshopSignup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    businessType: "",
  });
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.businessType) {
      setStatus({
        type: "error",
        message: "Please fill in all fields.",
      });
      pushEvent(EVENTS.WORKSHOP_SIGNUP_ERROR, {
        form_id: "workshop",
        reason: "validation",
      });
      return;
    }
    if (!EMAIL_RE.test(form.email)) {
      setStatus({
        type: "error",
        message: "That email address doesn't look right -- try again?",
      });
      pushEvent(EVENTS.WORKSHOP_SIGNUP_ERROR, {
        form_id: "workshop",
        reason: "invalid_email",
      });
      return;
    }

    setStatus({ type: "submitting" });

    try {
      const res = await fetch("/api/workshop-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({
          type: "error",
          message:
            data?.error ||
            "Couldn't save your signup. Please try again or email us directly.",
        });
        pushEvent(EVENTS.WORKSHOP_SIGNUP_ERROR, {
          form_id: "workshop",
          reason: "api",
        });
        return;
      }
      setStatus({ type: "success" });
      pushEvent(EVENTS.WORKSHOP_SIGNUP_SUBMIT, {
        form_id: "workshop",
        business_type: form.businessType,
      });
    } catch {
      setStatus({
        type: "error",
        message: "Network error. Check your connection and try again.",
      });
      pushEvent(EVENTS.WORKSHOP_SIGNUP_ERROR, {
        form_id: "workshop",
        reason: "network",
      });
    }
  };

  const isSubmitting = status.type === "submitting";

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav forceDark />
      <main id="main">
        <section
          style={{
            background: "var(--midnight-ink)",
            color: "var(--warm-cream)",
            minHeight: "100vh",
            paddingTop: "clamp(6rem, 12vw, 9rem)",
            paddingBottom: "clamp(4rem, 8vw, 6rem)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Full-bleed background image */}
          <Image
            src="/images/workshop-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            aria-hidden="true"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              transform: "scaleX(-1)",
              zIndex: 0,
            }}
          />
          {/* Dark overlay for readability */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(15,21,38,0.65) 0%, rgba(15,21,38,0.4) 45%, rgba(15,21,38,0.2) 100%), linear-gradient(180deg, rgba(15,21,38,0.15) 0%, rgba(15,21,38,0.5) 100%)",
              zIndex: 0,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-20%",
              right: "-10%",
              width: 700,
              height: 700,
              background:
                "radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 65%)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div
            className="container"
            style={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)",
              gap: "clamp(2.5rem, 6vw, 6rem)",
              alignItems: "start",
            }}
          >
            {/* Left: copy + image */}
            <div>
              <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>
                -- Workshop · 12 Aug 2026
              </span>
              <h1
                className="h-display"
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  color: "var(--warm-cream)",
                  margin: "1rem 0 1.5rem",
                  maxWidth: "16ch",
                }}
              >
                Automate your business —{" "}
                <em className="gold">put time back in your pocket.</em>
              </h1>
              <p
                className="body-copy"
                style={{
                  color: "rgba(245,240,232,0.7)",
                  maxWidth: "48ch",
                  marginBottom: "2rem",
                }}
              >
                In two hours you'll get the fundamentals of AI in plain
                English and build one working skill: an automated email reply
                system that handles customer enquiries in your own voice. From
                those fundamentals, you'll walk out with the pattern you need
                to spot, design, and build the next workflow yourself.
              </p>

              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "1.25rem 2rem",
                  margin: 0,
                  paddingTop: "1.5rem",
                  borderTop: "1px solid var(--rule-cream)",
                }}
              >
                {[
                  { label: "Date", value: "Wed 12 Aug 2026" },
                  { label: "Time", value: "2:00 PM" },
                  { label: "Format", value: "In person" },
                  { label: "Location", value: "Elwood + St Kilda Neighbourhood Learning Centre (ESNLC)" },
                  { label: "Price", value: "Free — first 24 seats" },
                  { label: "Seats", value: "24 only" },
                ].map((item) => (
                  <div key={item.label}>
                    <dt
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "rgba(245,240,232,0.45)",
                        marginBottom: "0.4rem",
                      }}
                    >
                      {item.label}
                    </dt>
                    <dd
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.95rem",
                        color: "var(--warm-cream)",
                        margin: 0,
                      }}
                    >
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right: signup form */}
            <div
              style={{
                position: "sticky",
                top: "clamp(5.5rem, 9vw, 7rem)",
                border: "1px solid rgba(245,240,232,0.18)",
                padding: "clamp(2rem, 3.5vw, 3rem)",
                background: "rgba(15,21,38,0.88)",
                backdropFilter: "blur(14px) saturate(140%)",
                WebkitBackdropFilter: "blur(14px) saturate(140%)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              }}
            >
              {status.type === "success" ? (
                <div>
                  <CheckCircle2
                    size={32}
                    style={{ color: "var(--liquid-gold)", marginBottom: "1rem" }}
                    aria-hidden="true"
                  />
                  <h2
                    className="h-section"
                    style={{
                      color: "var(--warm-cream)",
                      fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                      marginBottom: "1rem",
                    }}
                  >
                    You're on the list.
                  </h2>
                  <p
                    className="body-copy"
                    style={{
                      color: "rgba(245,240,232,0.65)",
                      marginBottom: 0,
                    }}
                  >
                    We'll email you confirmation and joining details shortly.
                    If you don't see it within an hour, check your spam folder
                    or email us at{" "}
                    <a
                      href="mailto:contact@creative-milk.com.au"
                      style={{
                        color: "var(--liquid-gold)",
                        borderBottom: "1px solid rgba(201,168,76,0.45)",
                      }}
                    >
                      contact@creative-milk.com.au
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <>
                  <span
                    className="eyebrow"
                    style={{
                      marginBottom: "1rem",
                      color: "var(--liquid-gold)",
                    }}
                  >
                    -- Reserve your seat
                  </span>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 300,
                      fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                      color: "var(--warm-cream)",
                      lineHeight: 1.15,
                      marginBottom: "1.75rem",
                    }}
                  >
                    Sign up for the workshop
                  </h2>

                  <form
                    onSubmit={onSubmit}
                    noValidate
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.25rem",
                    }}
                  >
                    {status.type === "error" && (
                      <div
                        role="alert"
                        style={{
                          padding: "0.85rem 1rem",
                          background: "rgba(192,64,64,0.16)",
                          border: "1px solid rgba(224,112,112,0.45)",
                          color: "#E89090",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.85rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                        }}
                      >
                        <AlertCircle size={16} aria-hidden="true" />
                        <span>{status.message}</span>
                      </div>
                    )}

                    <Field
                      label="Your name"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      autoComplete="name"
                      required
                    />
                    <Field
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      autoComplete="email"
                      required
                    />

                    <label
                      htmlFor="businessType"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "rgba(245,240,232,0.5)",
                        }}
                      >
                        Type of business
                        <span
                          style={{
                            color: "var(--liquid-gold)",
                            marginLeft: "0.25rem",
                          }}
                        >
                          *
                        </span>
                      </span>
                      <select
                        id="businessType"
                        name="businessType"
                        value={form.businessType}
                        onChange={onChange}
                        required
                        className="input-dark"
                        style={{ cursor: "pointer" }}
                      >
                        <option value="">Select one...</option>
                        {businessTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="cta cta-gold"
                      style={{
                        justifyContent: "center",
                        marginTop: "0.5rem",
                        opacity: isSubmitting ? 0.6 : 1,
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                      }}
                    >
                      {isSubmitting ? "Reserving…" : "Reserve my seat"}
                      {!isSubmitting && (
                        <ArrowRight size={14} aria-hidden="true" />
                      )}
                    </button>

                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.08em",
                        color: "rgba(245,240,232,0.4)",
                        marginTop: "0.25rem",
                        lineHeight: 1.6,
                      }}
                    >
                      No spam. We'll only use your details for this workshop.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

        <section
          className="section"
          style={{
            background: "var(--warm-cream)",
            color: "var(--midnight-ink)",
          }}
        >
          <div className="container">
            <div style={{ maxWidth: "64ch", marginBottom: "clamp(3rem, 5vw, 4.5rem)" }}>
              <span className="eyebrow">-- Agenda · 2 hours</span>
              <h2
                className="h-display"
                style={{
                  fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                  margin: "1rem 0 1.25rem",
                }}
              >
                Two hours. <em className="gold">One clear plan.</em>
              </h2>
              <p className="body-copy" style={{ maxWidth: "52ch" }}>
                A practical walk-through of where AI actually helps a small
                business right now — no jargon, no hype, and a working example
                built live so you leave with something you can use the next day.
              </p>
            </div>

            <ol
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                borderTop: "1px solid var(--rule)",
              }}
            >
              {[
                {
                  time: "2:00 – 2:10",
                  title: "Welcome + why now",
                  body: "The state of AI for small business in 2026 — what's hype, and what's actually moving the needle.",
                },
                {
                  time: "2:10 – 2:35",
                  title: "AI fundamentals, no jargon",
                  body: "What LLMs really do, where they fall over, and the three things you need to understand before putting them in your business.",
                },
                {
                  time: "2:35 – 3:05",
                  title: "Finding the wins in your workflow",
                  body: "How to spot the repetitive, low-judgment tasks AI handles best. Live exercise — you'll map your own week.",
                },
                {
                  time: "3:05 – 3:15",
                  title: "Break",
                  body: "Tea, coffee, and a chance to compare notes with the room.",
                },
                {
                  time: "3:15 – 3:45",
                  title: "Build your first workflow, live",
                  body: "A real, working AI-assisted workflow built from scratch in front of you. We pick the example on the day based on what the room needs most.",
                },
                {
                  time: "3:45 – 3:55",
                  title: "Measuring impact",
                  body: "What to track in week 1, week 4, and week 12 so you actually know AI is saving time and making money.",
                },
                {
                  time: "3:55 – 4:00",
                  title: "Q&A + what to do tomorrow",
                  body: "Your questions, and a single concrete next step to take when you walk out the door.",
                },
              ].map((row) => (
                <li
                  key={row.time}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(120px, 160px) 1fr",
                    gap: "clamp(1.5rem, 4vw, 3rem)",
                    padding: "clamp(1.5rem, 2.5vw, 2rem) 0",
                    borderBottom: "1px solid var(--rule)",
                    alignItems: "baseline",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.78rem",
                      letterSpacing: "0.1em",
                      color: "var(--liquid-gold)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.time}
                  </span>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 400,
                        fontSize: "clamp(1.25rem, 2vw, 1.75rem)",
                        lineHeight: 1.2,
                        margin: "0 0 0.5rem",
                        color: "var(--midnight-ink)",
                      }}
                    >
                      {row.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        color: "var(--slate-mid, #5a5a5a)",
                        margin: 0,
                        maxWidth: "62ch",
                      }}
                    >
                      {row.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  autoComplete,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const id = `field-${name}`;
  return (
    <label
      htmlFor={id}
      style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(245,240,232,0.5)",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--liquid-gold)", marginLeft: "0.25rem" }}>
            *
          </span>
        )}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className="input-dark"
      />
    </label>
  );
}
