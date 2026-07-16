/**
 * GET /api/members/download/[slug]
 *
 * Gated file downloads. Auth via the cookie session; tier checked against
 * the registry via canAccess; on success responds 302 to a 60-second signed
 * URL from the private member-files bucket (service role mints it -- the
 * bucket has no client policies at all).
 *
 *   401 no session | 403 tier too low | 404 unknown or non-download slug
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { itemBySlug } from "@/lib/members/items";
import { canAccess } from "@/lib/members/access";
import { getMemberProfile } from "@/lib/supabase/auth-server";
import { getServiceSupabase } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

const SIGNED_URL_TTL_SECONDS = 60;
const SLUG_RE = /^[a-z0-9-]{1,80}$/;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const limited = checkRateLimit("members-download", req, {
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { slug } = await params;
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const item = itemBySlug(slug);
  if (!item || item.type !== "download") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const member = await getMemberProfile();
  if (!member) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!canAccess(item.tier, member.profile.tier)) {
    return NextResponse.json(
      { error: "Pro subscription required" },
      { status: 403 },
    );
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase.storage
    .from("member-files")
    .createSignedUrl(item.storagePath, SIGNED_URL_TTL_SECONDS, {
      download: item.fileName,
    });

  if (error || !data?.signedUrl) {
    console.error("[members/download] signing failed:", error);
    return NextResponse.json(
      { error: "Download unavailable. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.redirect(data.signedUrl, 302);
}
