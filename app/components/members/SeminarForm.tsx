"use client";

/**
 * Seminar QR sign-up form. Two steps on submit:
 *   1. POST /api/seminar/register  (stores name, email, consent server-side)
 *   2. signInWithOtp magic link    (lands on /seminar/welcome once clicked)
 * Then a thank-you pop-up counts down and sends them to the Google review
 * page. The review is optional ("Not now" cancels it) and access never
 * depends on it (Google review policy bans incentivised reviews).
 * Name and consent never go in a URL; they live in seminar_signups only.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import {
  GOOGLE_REVIEW_URL,
  SEMINAR_CONSENT_TEXT,
  SEMINAR_REVIEW_REDIRECT_SECONDS,
  SEMINAR_THANKS_TEXT,
} from "@/lib/members/seminar-copy";

function ThanksDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [secondsLeft, setSecondsLeft] = useState(SEMINAR_REVIEW_REDIRECT_SECONDS);

  // Native modal dialog: focus trap, Escape and backdrop come for free.
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      window.location.assign(GOOGLE_REVIEW_URL);
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [secondsLeft]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="seminar-thanks-title"
      onClose={onClose}
      className="seminar-thanks"
      style={{
        maxWidth: 480,
        margin: "auto",
        width: "calc(100% - 2rem)",
        padding: "2rem",
        border: "none",
        background: "var(--warm-cream)",
        color: "var(--midnight-ink)",
      }}
    >
      <p className="eyebrow no-rule" id="seminar-thanks-title" style={{ marginBottom: "1rem" }}>
        Thank you
      </p>
      <p style={{ fontSize: "1.0625rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        {SEMINAR_THANKS_TEXT}
      </p>
      <a
        href={GOOGLE_REVIEW_URL}
        className="cta cta-gold"
        style={{ width: "100%", justifyContent: "center" }}
      >
        Leave a Google review
      </a>
      <p
        aria-live="polite"
        style={{ marginTop: "1rem", fontSize: "0.875rem", color: "var(--slate-mid)", textAlign: "center" }}
      >
        Taking you there in {secondsLeft}s.
      </p>
      <button
        type="button"
        onClick={() => ref.current?.close()}
        style={{
          display: "block",
          margin: "0.5rem auto 0",
          minHeight: 44,
          padding: "0 1rem",
          background: "transparent",
          border: "none",
          color: "var(--slate-mid)",
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        Not now
      </button>
    </dialog>
  );
}

export default function SeminarForm({ code }: { code: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const startedAt = useRef(Date.now());
  const [status, setStatus] = useState<
    | { state: "idle" }
    | { state: "sending" }
    | { state: "sent" }
    | { state: "error"; message: string }
  >({ state: "idle" });
  const [showThanks, setShowThanks] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ state: "sending" });

    const res = await fetch("/api/seminar/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        name,
        email,
        marketingOptIn: optIn,
        website,
        formStartedAt: startedAt.current,
      }),
    }).catch(() => null);

    if (!res || !res.ok) {
      const data = res ? await res.json().catch(() => null) : null;
      setStatus({
        state: "error",
        message: data?.error ?? "Something went wrong. Please try again.",
      });
      return;
    }

    const supabase = getBrowserSupabase();
    const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/seminar/welcome")}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callback, data: { full_name: name.trim() } },
    });
    if (error) {
      setStatus({
        state: "error",
        message: "Could not send your sign-in link. Please try again.",
      });
      return;
    }
    setStatus({ state: "sent" });
    setShowThanks(true);
  }

  if (status.state === "sent") {
    return (
      <div role="status" className="animate-fadeInUp">
        <p style={{ fontSize: "1.125rem", color: "var(--midnight-ink)" }}>
          Nearly there. Check your inbox for a link from us and tap it to
          unlock your premium pack.
        </p>
        <p style={{ color: "var(--slate-mid)" }}>
          Can&rsquo;t see it? Check your spam or promotions folder.
        </p>
        {showThanks && <ThanksDialog onClose={() => setShowThanks(false)} />}
      </div>
    );
  }

  return (
    <form onSubmit={submit} aria-label="Seminar sign-up">
      <label htmlFor="seminar-name" style={{ display: "block", marginBottom: "0.4rem" }}>
        Name
      </label>
      <input
        id="seminar-name"
        type="text"
        required
        maxLength={200}
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input-light"
      />

      <label
        htmlFor="seminar-email"
        style={{ display: "block", margin: "1rem 0 0.4rem" }}
      >
        Email
      </label>
      <input
        id="seminar-email"
        type="email"
        required
        maxLength={320}
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-light"
      />

      {/* Honeypot: hidden from people and screen readers, bots fill it. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
      />

      <label
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start",
          marginTop: "1.25rem",
          minHeight: 44,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          style={{ marginTop: "0.3rem", width: 18, height: 18, flexShrink: 0 }}
        />
        <span>{SEMINAR_CONSENT_TEXT}</span>
      </label>

      {status.state === "error" && (
        <p role="alert" className="animate-slideDown" style={{ color: "#c0392b" }}>
          {status.message}
        </p>
      )}

      <button
        type="submit"
        className={`cta cta-gold${status.state === "sending" ? " btn-busy" : ""}`}
        disabled={status.state === "sending"}
        style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center" }}
      >
        {status.state === "sending" ? "One moment…" : "Unlock my premium pack"}
      </button>

      <p style={{ marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--slate-mid)" }}>
        We collect your name and email to create your free members account
        and give you the premium pack. We only send marketing emails if you
        tick the box. See our <Link href="/privacy">privacy policy</Link>.
      </p>
    </form>
  );
}
