"use client";

import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { EVENTS, pushEvent } from "../lib/gtm";

type FormState = {
  name: string;
  email: string;
  company: string;
  message: string;
};

type Status =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact({ variant = "dark" }: { variant?: "dark" | "cream" }) {
  const isCream = variant === "cream";
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>({ type: "idle" });
  // Anti-spam: hidden honeypot field + time-to-submit, checked server-side.
  const [honeypot, setHoneypot] = useState("");
  const formStartedAt = useRef<number>(Date.now());

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: "submitting" });

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({
        type: "error",
        message: "Name, email, and a short message are required.",
      });
      return;
    }
    if (!EMAIL_RE.test(form.email)) {
      setStatus({
        type: "error",
        message: "That email address doesn't look right -- try again?",
      });
      return;
    }

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          website: honeypot,
          formStartedAt: formStartedAt.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushEvent(EVENTS.CONTACT_FORM_ERROR, {
          form_id: "contact",
          reason: "api",
        });
        setStatus({
          type: "error",
          message:
            data?.error ||
            "Couldn't send the message. Try again, or email us directly.",
        });
        return;
      }
      pushEvent(EVENTS.CONTACT_FORM_SUBMIT, {
        form_id: "contact",
        has_company: Boolean(form.company.trim()),
      });
      setStatus({
        type: "success",
        message: "Message received. We'll be in touch within 24 hours.",
      });
      setForm({ name: "", email: "", company: "", message: "" });
    } catch {
      pushEvent(EVENTS.CONTACT_FORM_ERROR, {
        form_id: "contact",
        reason: "network",
      });
      setStatus({
        type: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  };

  const isSubmitting = status.type === "submitting";

  return (
    <section
      id="contact"
      className="section"
      style={{
        background: isCream ? "var(--warm-cream)" : "var(--midnight-ink)",
        color: isCream ? "var(--midnight-ink)" : "var(--warm-cream)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-30%",
          right: "-10%",
          width: 700,
          height: 700,
          background: isCream
            ? "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-10%",
          width: 500,
          height: 500,
          background: isCream
            ? "radial-gradient(circle, rgba(61,122,95,0.06) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(61,122,95,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
          gap: "clamp(2rem, 6vw, 6rem)",
          alignItems: "start",
        }}
      >
        <div>
          <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>
            05 -- Start a project
          </span>
          <h2
            className="h-display"
            style={{
              fontSize: "clamp(2.75rem, 6vw, 5rem)",
              color: isCream ? "var(--midnight-ink)" : "var(--warm-cream)",
              margin: "1rem 0 1.5rem",
              maxWidth: "14ch",
            }}
          >
            Ready to build
            <br />
            <em className="gold">something real?</em>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              color: isCream ? "rgba(15,21,38,0.6)" : "rgba(245,240,232,0.55)",
              maxWidth: "40ch",
              marginBottom: "2.5rem",
            }}
          >
            Tell us about the problem you&apos;re trying to solve. We&apos;ll
            respond within 24 hours with whether we&apos;re the right fit, and
            what we&apos;d propose next.
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              color: isCream ? "rgba(15,21,38,0.6)" : "rgba(245,240,232,0.6)",
            }}
          >
            <li>→ No NDAs in the first call</li>
            <li>→ Honest timelines, not optimistic ones</li>
            <li>→ Plain-English next steps within 48 hours</li>
          </ul>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {status.type !== "idle" &&
            status.type !== "submitting" &&
            status.message && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  padding: "1rem 1.25rem",
                  background:
                    status.type === "success"
                      ? "rgba(61,122,95,0.18)"
                      : "rgba(192,64,64,0.16)",
                  border: `1px solid ${
                    status.type === "success"
                      ? "rgba(91,175,137,0.45)"
                      : "rgba(224,112,112,0.45)"
                  }`,
                  color:
                    status.type === "success"
                      ? "var(--forest-light)"
                      : "#E89090",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  {status.type === "success" ? (
                    <CheckCircle2 size={18} aria-hidden="true" />
                  ) : (
                    <AlertCircle size={18} aria-hidden="true" />
                  )}
                  <span>{status.message}</span>
                </div>
                {status.type === "error" && (
                  <div
                    style={{
                      paddingLeft: "1.65rem",
                      fontSize: "0.8rem",
                      color: "rgba(245,240,232,0.7)",
                    }}
                  >
                    Or email us directly at{" "}
                    <a
                      href="mailto:contact@creative-milk.com.au?subject=Project%20enquiry"
                      style={{
                        color: "var(--liquid-gold)",
                        borderBottom: "1px solid rgba(201,168,76,0.45)",
                      }}
                    >
                      contact@creative-milk.com.au
                    </a>
                    .
                  </div>
                )}
              </div>
            )}

          {/* Honeypot -- visually hidden from humans, invisible to screen
              readers, but present in the DOM for naive bots to fill. */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
            <label htmlFor="contact-website">
              Website
              <input
                id="contact-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </label>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            <Field
              label="Your name"
              name="name"
              value={form.name}
              onChange={onChange}
              required
              autoComplete="name"
              inputClass={isCream ? "input-light" : "input-dark"}
              labelColor={isCream ? "rgba(15,21,38,0.5)" : "rgba(245,240,232,0.5)"}
            />
            <Field
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
              autoComplete="email"
              inputClass={isCream ? "input-light" : "input-dark"}
              labelColor={isCream ? "rgba(15,21,38,0.5)" : "rgba(245,240,232,0.5)"}
            />
          </div>
          <Field
            label="Company"
            name="company"
            value={form.company}
            onChange={onChange}
            autoComplete="organization"
            inputClass={isCream ? "input-light" : "input-dark"}
            labelColor={isCream ? "rgba(15,21,38,0.5)" : "rgba(245,240,232,0.5)"}
          />
          <Field
            label="Tell us about your project"
            name="message"
            value={form.message}
            onChange={onChange}
            required
            multiline
            inputClass={isCream ? "input-light" : "input-dark"}
            labelColor={isCream ? "rgba(15,21,38,0.5)" : "rgba(245,240,232,0.5)"}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="cta cta-gold"
            style={{
              alignSelf: "flex-start",
              minWidth: 220,
              justifyContent: "center",
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              marginTop: "0.75rem",
            }}
          >
            {isSubmitting ? "Sending…" : "Send message"}
            {!isSubmitting && <ArrowRight size={14} aria-hidden="true" />}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  multiline = false,
  autoComplete,
  inputClass = "input-dark",
  labelColor = "rgba(245,240,232,0.5)",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  autoComplete?: string;
  inputClass?: string;
  labelColor?: string;
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
          color: labelColor,
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--liquid-gold)", marginLeft: "0.25rem" }}>
            *
          </span>
        )}
      </span>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          rows={5}
          className={inputClass}
          placeholder="A few sentences is plenty."
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          className={inputClass}
        />
      )}
    </label>
  );
}
