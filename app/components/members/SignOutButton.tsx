"use client";

import { getBrowserSupabase } from "@/lib/supabase/browser";

export default function SignOutButton() {
  async function signOut() {
    await getBrowserSupabase().auth.signOut();
    window.location.assign("/");
  }
  return (
    <button type="button" onClick={signOut} className="cta" style={{ minHeight: 44 }}>
      Sign out
    </button>
  );
}
