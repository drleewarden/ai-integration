"use client";

/**
 * Seminar QR sign-up form. Two steps on submit:
 *   1. POST /api/seminar/register  (stores name, email, consent server-side)
 *   2. signInWithOtp magic link    (lands on /seminar/welcome once clicked)
 * Name and consent never go in a URL; they live in seminar_signups only.
 */
import { useRef, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { SEMINAR_CONSENT_TEXT } from "@/lib/members/seminar-copy";

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
