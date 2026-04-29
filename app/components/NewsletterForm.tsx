"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="text-sm" style={{ color: "rgba(245,240,232,0.7)" }}>
        You're subscribed. We'll be in touch when we publish.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="flex-1 px-5 py-3 rounded-full text-sm focus:outline-none"
        style={{
          backgroundColor: "rgba(245,240,232,0.1)",
          border: "1px solid rgba(245,240,232,0.2)",
          color: "var(--warm-cream)",
        }}
        required
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
        style={{ backgroundColor: "var(--liquid-gold)", color: "var(--midnight-ink)" }}
      >
        Subscribe →
      </button>
    </form>
  );
}
