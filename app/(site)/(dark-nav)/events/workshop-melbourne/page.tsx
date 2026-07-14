"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, AlertCircle, Check, X, Shield } from "lucide-react";
import { EVENTS, pushEvent } from "@/app/lib/gtm";
import FAQ from "@/app/components/FAQ";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Early-bird deadline drives the countdown label + urgency copy.
const EARLY_BIRD_ENDS = new Date("2026-07-27T23:59:59+10:00");

const OUTCOMES = [
  "One working AI email-reply system that sounds like you",
  "A repeatable pattern for spotting the next workflow to automate",
  "A 12-week measurement plan so you know it's actually saving you time",
];

const FOR_YOU_IF = [
  "You run a solo, small, or agency business and do repetitive work by hand",
  "You've tried ChatGPT but haven't figured out how to plug it into your business",
  "You want a working example, not a theory lecture",
];

const NOT_FOR_YOU_IF = [
  "You already ship LLM apps for a living",
  "You want a hands-off, done-for-you service (that's what Creative Milk consulting is for)",
];

const FAQ_ITEMS = [
  {
    q: "Do I need to be technical or bring anything?",
    a: "No. Bring a laptop and one repetitive task from your week. That's it. Every tool used in the workshop has a free tier and we'll walk through setup together.",
  },
  {
    q: "What if I can't make it on the day?",
    a: "Email us before 5 August and we'll refund you or transfer your seat to the next cohort. After that, seats are non-refundable but you can transfer to a colleague.",
  },
  {
    q: "Is this a sales pitch for Creative Milk services?",
    a: "No. You'll leave with a working workflow you built yourself. Some people go on to work with us on bigger builds -- most don't, and that's fine.",
  },
  {
    q: "Will there be a recording?",
    a: "This is an in-person session -- part of the value is the room, the questions, and the live-build. No recording. Seats are capped at 24 so everyone gets attention.",
  },
];

type Status =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success" }
  | { type: "error"; message: string };

export default function WorkshopMelbourne() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [honeypot, setHoneypot] = useState("");
  const formStartedAt = useRef<number>(Date.now());
  const hasStartedRef = useRef(false);

  // Hydration-safe countdown: server renders static "Ends 27 July";
  // client swaps in a "· X days left" tail after mount.
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  useEffect(() => {
    const ms = EARLY_BIRD_ENDS.getTime() - Date.now();
    setDaysLeft(Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24))));
  }, []);
  const earlyBirdLabel =
    daysLeft === null
      ? "Ends 27 July"
      : daysLeft > 0
        ? `Ends 27 July · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
        : "Early bird has ended";

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      pushEvent(EVENTS.WORKSHOP_SIGNUP_START, {
        form_id: "workshop-melbourne",
        first_field: name,
      });
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setStatus({ type: "error", message: "Please add your name and email." });
      pushEvent(EVENTS.WORKSHOP_SIGNUP_ERROR, {
        form_id: "workshop-melbourne",
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
        form_id: "workshop-melbourne",
        reason: "invalid_email",
      });
      return;
    }

    setStatus({ type: "submitting" });

    try {
      const res = await fetch("/api/workshop-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          // Kept for API compatibility -- v2 form removed the fields to reduce friction.
          businessType: "-",
          workflows: "",
          website: honeypot,
          formStartedAt: formStartedAt.current,
        }),
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
          form_id: "workshop-melbourne",
          reason: "api",
        });
        return;
      }
      setStatus({ type: "success" });
      pushEvent(EVENTS.WORKSHOP_SIGNUP_SUBMIT, {
        form_id: "workshop-melbourne",
        variant: "melbourne-cro",
      });
    } catch {
      setStatus({
        type: "error",
        message: "Network error. Check your connection and try again.",
      });
      pushEvent(EVENTS.WORKSHOP_SIGNUP_ERROR, {
        form_id: "workshop-melbourne",
        reason: "network",
      });
    }
  };

  const isSubmitting = status.type === "submitting";
  const isDone = status.type === "success";

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Hero + primary conversion                                           */}
      {/* ------------------------------------------------------------------ */}
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
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(15,21,38,0.72) 0%, rgba(15,21,38,0.45) 45%, rgba(15,21,38,0.25) 100%), linear-gradient(180deg, rgba(15,21,38,0.15) 0%, rgba(15,21,38,0.55) 100%)",
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
          className="container workshop-hero-grid"
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gap: "clamp(2.5rem, 6vw, 6rem)",
            alignItems: "start",
          }}
        >
          {/* Left: copy */}
          <div>
            <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>
              -- Workshop · 7 Aug 2026 · Melbourne
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
                color: "rgba(245,240,232,0.75)",
                maxWidth: "48ch",
                marginBottom: "1.75rem",
              }}
            >
              A 2-hour, in-person workshop for Melbourne small business owners.
              In plain English, no jargon. You'll build one working AI-assisted
              workflow, live, and leave with the pattern to build the next one
              yourself.
            </p>

            {/* Outcome bullets -- what you actually walk out with */}
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 2rem",
                display: "grid",
                gap: "0.75rem",
                maxWidth: "52ch",
              }}
            >
              {OUTCOMES.map((line) => (
                <li
                  key={line}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "0.75rem",
                    alignItems: "start",
                    color: "rgba(245,240,232,0.9)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.95rem",
                    lineHeight: 1.5,
                  }}
                >
                  <Check
                    size={18}
                    aria-hidden="true"
                    style={{
                      color: "var(--liquid-gold)",
                      marginTop: "0.2rem",
                      flexShrink: 0,
                    }}
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

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
                { label: "Date", value: "Fri 7 Aug 2026" },
                { label: "Time", value: "3:00 – 5:00 PM" },
                { label: "Format", value: "In person, Melbourne" },
                {
                  label: "Location",
                  value: "Elwood + St Kilda Neighbourhood Learning Centre",
                },
                { label: "Price", value: "$25 early bird · $39 after" },
                { label: "Seats", value: "24 only · founding cohort" },
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
            id="reserve"
            className="workshop-signup-panel"
            style={{
              border: "1px solid rgba(245,240,232,0.18)",
              scrollMarginTop: "5rem",
              padding: "clamp(2rem, 3.5vw, 3rem)",
              background: "rgba(15,21,38,0.9)",
              backdropFilter: "blur(14px) saturate(140%)",
              WebkitBackdropFilter: "blur(14px) saturate(140%)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
            }}
          >
            {isDone ? (
              <div>
                <CheckCircle2
                  size={32}
                  style={{
                    color: "var(--liquid-gold)",
                    marginBottom: "1rem",
                  }}
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
                  You're in.
                </h2>
                <p
                  className="body-copy"
                  style={{
                    color: "rgba(245,240,232,0.7)",
                    marginBottom: 0,
                  }}
                >
                  Check your inbox for confirmation and joining details. If
                  you don't see it within an hour, check spam or email us at{" "}
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
                {/* Price + deadline callout -- makes the urgency unmissable */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: "1rem",
                    padding: "0.85rem 1rem",
                    marginBottom: "1.5rem",
                    background: "rgba(201,168,76,0.12)",
                    border: "1px solid rgba(201,168,76,0.35)",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.75rem",
                        fontWeight: 400,
                        color: "var(--liquid-gold)",
                        lineHeight: 1,
                      }}
                    >
                      $25
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "rgba(245,240,232,0.55)",
                        marginTop: "0.3rem",
                      }}
                    >
                      Early bird · then $39
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      letterSpacing: "0.08em",
                      color: "var(--liquid-gold)",
                      textAlign: "right",
                    }}
                  >
                    {earlyBirdLabel}
                  </div>
                </div>

                <span
                  className="eyebrow"
                  style={{
                    marginBottom: "0.75rem",
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
                    marginBottom: "1.5rem",
                  }}
                >
                  Name + email. That's it.
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
                  {/* Honeypot -- hidden from humans/screen readers */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      height: 0,
                      overflow: "hidden",
                    }}
                  >
                    <label htmlFor="workshop-website">
                      Website
                      <input
                        id="workshop-website"
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </label>
                  </div>

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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cta cta-gold"
                    style={{
                      justifyContent: "center",
                      marginTop: "0.25rem",
                      opacity: isSubmitting ? 0.6 : 1,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      // Long label clips on narrow phones if it can't wrap
                      whiteSpace: "normal",
                      textAlign: "center",
                    }}
                  >
                    {isSubmitting
                      ? "Reserving…"
                      : "Reserve my seat — $25 early bird"}
                    {!isSubmitting && (
                      <ArrowRight size={14} aria-hidden="true" />
                    )}
                  </button>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "start",
                      gap: "0.6rem",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.06em",
                      color: "rgba(245,240,232,0.55)",
                      lineHeight: 1.6,
                    }}
                  >
                    <Shield
                      size={13}
                      aria-hidden="true"
                      style={{
                        color: "var(--liquid-gold)",
                        marginTop: "0.15rem",
                        flexShrink: 0,
                      }}
                    />
                    <span>
                      Not useful in the first 30 minutes? Full refund on the
                      spot, no questions.
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.08em",
                      color: "rgba(245,240,232,0.35)",
                      margin: 0,
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

      {/* ------------------------------------------------------------------ */}
      {/* Meet your instructor                                                */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="section"
        style={{
          background: "var(--warm-cream)",
          color: "var(--midnight-ink)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div
          className="container workshop-instructor-grid"
          style={{
            display: "grid",
            gap: "clamp(2rem, 5vw, 4rem)",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              aspectRatio: "1 / 1",
              overflow: "hidden",
              borderRadius: "4px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            }}
          >
            <Image
              src="/images/darryn.webp"
              alt="Darryn Lee-Warden"
              fill
              sizes="(max-width: 700px) 60vw, 260px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div>
            <span className="eyebrow" style={{ marginBottom: "1rem" }}>
              -- Your instructor
            </span>
            <h2
              className="h-display"
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                margin: "0.75rem 0 1.25rem",
              }}
            >
              Darryn Lee-Warden
            </h2>
            <p
              className="body-copy"
              style={{
                maxWidth: "56ch",
                marginBottom: "1rem",
              }}
            >
              I run Creative Milk, where I build AI systems for small
              businesses. This workshop is the exact pattern I use with them,
              condensed into two hours.
            </p>
            <p
              className="body-copy"
              style={{
                maxWidth: "56ch",
                color: "var(--slate-mid, #5a5a5a)",
                marginBottom: "1.5rem",
              }}
            >
              You'll get the same thinking, the same tools, and a working
              example you built with your own hands — for a fraction of what a
              consulting engagement costs.
            </p>
            <a
              href="https://www.linkedin.com/in/darryn-lee-warden-35359b43/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--midnight-ink)",
                borderBottom: "1px solid var(--midnight-ink)",
                paddingBottom: "2px",
              }}
            >
              LinkedIn →
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Who this is / isn't for                                             */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="section"
        style={{
          background: "var(--warm-cream)",
          color: "var(--midnight-ink)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div className="container">
          <div style={{ maxWidth: "64ch", marginBottom: "clamp(2.5rem, 5vw, 4rem)" }}>
            <span className="eyebrow">-- Who this is for</span>
            <h2
              className="h-display"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                margin: "1rem 0 1.25rem",
              }}
            >
              Built for <em className="gold">the room</em> — not the internet.
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
              gap: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--liquid-gold)",
                  marginBottom: "1.25rem",
                }}
              >
                Come along if…
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.85rem" }}>
                {FOR_YOU_IF.map((line) => (
                  <li
                    key={line}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      gap: "0.75rem",
                      alignItems: "start",
                      fontFamily: "var(--font-sans)",
                      fontSize: "1rem",
                      lineHeight: 1.55,
                    }}
                  >
                    <Check
                      size={18}
                      aria-hidden="true"
                      style={{
                        color: "var(--liquid-gold)",
                        marginTop: "0.2rem",
                        flexShrink: 0,
                      }}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--slate-mid, #5a5a5a)",
                  marginBottom: "1.25rem",
                }}
              >
                Skip it if…
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.85rem" }}>
                {NOT_FOR_YOU_IF.map((line) => (
                  <li
                    key={line}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      gap: "0.75rem",
                      alignItems: "start",
                      fontFamily: "var(--font-sans)",
                      fontSize: "1rem",
                      lineHeight: 1.55,
                      color: "var(--slate-mid, #5a5a5a)",
                    }}
                  >
                    <X
                      size={18}
                      aria-hidden="true"
                      style={{
                        color: "var(--slate-mid, #5a5a5a)",
                        marginTop: "0.2rem",
                        flexShrink: 0,
                        opacity: 0.6,
                      }}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Agenda                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="section"
        style={{
          background: "var(--warm-cream)",
          color: "var(--midnight-ink)",
          borderBottom: "1px solid var(--rule)",
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
                time: "3:00 – 3:10",
                title: "Welcome + why now",
                body: "The state of AI for small business in 2026 — what's hype, and what's actually moving the needle.",
              },
              {
                time: "3:10 – 3:35",
                title: "AI fundamentals, no jargon",
                body: "What LLMs really do, where they fall over, and the three things you need to understand before putting them in your business.",
              },
              {
                time: "3:35 – 4:05",
                title: "Finding the wins in your workflow",
                body: "How to spot the repetitive, low-judgment tasks AI handles best. Live exercise — you'll map your own week.",
              },
              {
                time: "4:05 – 4:15",
                title: "Break",
                body: "Tea, coffee, and a chance to compare notes with the room.",
              },
              {
                time: "4:15 – 4:45",
                title: "Build your first workflow, live",
                body: "A real, working AI-assisted workflow built from scratch in front of you. We pick the example on the day based on what the room needs most.",
              },
              {
                time: "4:45 – 4:55",
                title: "Measuring impact",
                body: "What to track in week 1, week 4, and week 12 so you actually know AI is saving time and making money.",
              },
              {
                time: "4:55 – 5:00",
                title: "Q&A + what to do tomorrow",
                body: "Your questions, and a single concrete next step to take when you walk out the door.",
              },
            ].map((row) => (
              <li
                key={row.time}
                className="workshop-agenda-row"
                style={{
                  display: "grid",
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

      {/* ------------------------------------------------------------------ */}
      {/* Guarantee                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="section"
        style={{
          background: "var(--midnight-ink)",
          color: "var(--warm-cream)",
        }}
      >
        <div
          className="container workshop-guarantee-grid"
          style={{
            display: "grid",
            gap: "clamp(2rem, 4vw, 3rem)",
            alignItems: "center",
            maxWidth: "820px",
          }}
        >
          <Shield
            size={64}
            aria-hidden="true"
            style={{ color: "var(--liquid-gold)", flexShrink: 0 }}
          />
          <div>
            <span
              className="eyebrow"
              style={{ color: "var(--liquid-gold)", marginBottom: "1rem" }}
            >
              -- The 30-minute promise
            </span>
            <h2
              className="h-display"
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                color: "var(--warm-cream)",
                margin: "0.75rem 0 1rem",
              }}
            >
              If it's not useful in the first 30 minutes, walk out — full
              refund on the spot.
            </h2>
            <p
              className="body-copy"
              style={{
                color: "rgba(245,240,232,0.7)",
                maxWidth: "56ch",
              }}
            >
              This is workshop #1 — the founding cohort. If it doesn't earn
              your $25 in the first half hour, you don't pay for it. That's
              the deal.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <FAQ eyebrow="-- Common questions" title="Before you book" items={FAQ_ITEMS} />

      {/* ------------------------------------------------------------------ */}
      {/* Secondary CTA -- for people who read the full page                  */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="section"
        style={{
          background: "var(--warm-cream)",
          color: "var(--midnight-ink)",
          textAlign: "center",
        }}
      >
        <div className="container" style={{ maxWidth: "620px" }}>
          <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>
            -- Ready?
          </span>
          <h2
            className="h-display"
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              margin: "1rem 0 1.25rem",
            }}
          >
            24 seats. <em className="gold">$25 until 27 July.</em>
          </h2>
          <p className="body-copy" style={{ marginBottom: "2rem" }}>
            Founding cohort pricing ends when the early bird does. Two hours,
            in person, one working workflow you built yourself.
          </p>
          <a
            href="#reserve"
            className="cta cta-dark"
            style={{
              display: "inline-flex",
              justifyContent: "center",
              whiteSpace: "normal",
              textAlign: "center",
            }}
          >
            Reserve my seat — $25 early bird
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Sticky mobile CTA -- only visible on small viewports, hidden once   */}
      {/* the user has converted                                              */}
      {/* ------------------------------------------------------------------ */}
      {!isDone && (
        <a
          href="#reserve"
          className="workshop-sticky-cta"
          aria-label="Reserve my seat"
        >
          <span>
            <strong style={{ color: "var(--liquid-gold)" }}>$25</strong>
            <span style={{ opacity: 0.7, marginLeft: "0.5rem" }}>
              early bird · {earlyBirdLabel.replace("Ends 27 July · ", "").replace("Ends 27 July", "ends 27 July")}
            </span>
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--liquid-gold)",
              fontWeight: 600,
            }}
          >
            Reserve <ArrowRight size={14} aria-hidden="true" />
          </span>
        </a>
      )}

      {/* Sticky CTA styles -- scoped, mobile-only. Plain <style> tag avoids
          the styled-jsx dependency, which isn't wired into this Next 15 setup. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .workshop-sticky-cta { display: none; }
            @media (max-width: 700px) {
              .workshop-sticky-cta {
                display: flex;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 40;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
                padding: 0.85rem 1.25rem;
                background: rgba(15, 21, 38, 0.96);
                backdrop-filter: blur(12px) saturate(140%);
                -webkit-backdrop-filter: blur(12px) saturate(140%);
                border-top: 1px solid rgba(201, 168, 76, 0.3);
                color: var(--warm-cream);
                font-family: var(--font-sans);
                font-size: 0.85rem;
                text-decoration: none;
                box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.2);
              }
              /* Give the page bottom padding so content isn't hidden under the sticky bar */
              body { padding-bottom: 4.5rem; }
            }
          `,
        }}
      />
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
