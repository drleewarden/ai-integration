"use client";

/**
 * Shared login/signup form. Three methods, magic link primary:
 *   - magic link (signInWithOtp)
 *   - email + password (signInWithPassword / signUp)
 *   - Google OAuth (signInWithOAuth)
 * The `next` param is threaded through every flow so members land back on
 * the page that sent them to login.
 */
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

// Only ever redirect within our own site.
function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/members";
}

export default function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next: string | null;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [status, setStatus] = useState<
    | { state: "idle" }
    | { state: "sending" }
    | { state: "sent" }
    | { state: "error"; message: string }
  >({ state: "idle" });

  const target = safeNext(next);
  const callback = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ state: "sending" });
    const supabase = getBrowserSupabase();

    if (!usePassword) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callback() },
      });
      if (error) {
        setStatus({
          state: "error",
          message: "Could not send the sign-in link. Please try again.",
        });
        return;
      }
      setStatus({ state: "sent" });
      return;
    }

    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: callback() },
          })
        : await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus({
        state: "error",
        message:
          mode === "signup"
            ? "Could not create your account. Please try again."
            : "Email or password did not match.",
      });
      return;
    }
    if (mode === "signup") {
      setStatus({ state: "sent" }); // confirmation email path
      return;
    }
    window.location.assign(target);
  }

  async function google() {
    const supabase = getBrowserSupabase();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback() },
    });
  }

  if (status.state === "sent") {
    return (
      <p role="status" style={{ color: "var(--warm-cream)" }}>
        Check your inbox — we've sent you a link to{" "}
        {usePassword && mode === "signup" ? "confirm your account" : "sign in"}
        .
      </p>
    );
  }

  return (
    <form onSubmit={submit} aria-label={mode === "login" ? "Sign in" : "Create account"}>
      <button
        type="button"
        onClick={google}
        className="cta"
        style={{ width: "100%", marginBottom: "1rem", minHeight: 44 }}
      >
        Continue with Google
      </button>

      <label htmlFor="auth-email">Email</label>
      <input
        id="auth-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", minHeight: 44 }}
      />

      {usePassword && (
        <>
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", minHeight: 44 }}
          />
        </>
      )}

      {status.state === "error" && (
        <p role="alert" style={{ color: "#c0392b" }}>
          {status.message}
        </p>
      )}

      <button
        type="submit"
        className="cta"
        disabled={status.state === "sending"}
        style={{ width: "100%", marginTop: "1rem", minHeight: 44 }}
      >
        {status.state === "sending"
          ? "One moment…"
          : usePassword
            ? mode === "signup"
              ? "Create account"
              : "Sign in"
            : "Email me a sign-in link"}
      </button>

      <button
        type="button"
        onClick={() => setUsePassword((v) => !v)}
        style={{ marginTop: "0.75rem", minHeight: 44, background: "none", textDecoration: "underline" }}
      >
        {usePassword ? "Use a magic link instead" : "Use a password instead"}
      </button>
    </form>
  );
}
