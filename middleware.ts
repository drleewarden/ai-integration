/**
 * Members-area session middleware.
 *
 * Two jobs:
 *   1. Refresh the Supabase session cookie (so Server Components always see
 *      a live session without being able to write cookies themselves).
 *   2. Redirect unauthenticated visitors of /members/* to /login (except
 *      the public /members/upgrade pitch page).
 *
 * Matcher is scoped to /members only -- the rest of the marketing site pays
 * zero middleware cost.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { membersRedirectPath } from "@/lib/members/route-guard";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fail closed when Supabase isn't configured. Without a URL + anon key,
  // createServerClient() throws and 500s every /members request. We can't
  // authenticate anyone in that state, so treat visitors as logged out and
  // let membersRedirectPath() bounce gated paths to /login (public pages,
  // e.g. /members/upgrade, still resolve). Surfaces the misconfiguration
  // in the server logs instead of an opaque crash.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[members] Supabase env missing (NEXT_PUBLIC_SUPABASE_URL / " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY). Treating /members visitors as " +
        "unauthenticated.",
    );
    const redirectTo = membersRedirectPath(request.nextUrl.pathname, false);
    return redirectTo
      ? NextResponse.redirect(new URL(redirectTo, request.url))
      : NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = membersRedirectPath(
    request.nextUrl.pathname,
    user !== null,
  );
  if (redirectTo) {
    // Known trade-off: cookies refreshed by setAll() above were applied to
    // `response`, but we discard it here and build a brand-new redirect
    // response instead, so those refreshed cookies are not re-applied to it
    // (this mirrors the Supabase ssr reference pattern). Worst case, a
    // session-invalidation event leaves stale cookies on the client until
    // the next request re-runs this middleware -- not an auth bypass, since
    // getUser() above already re-validated the session for this request.
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/members/:path*", "/members"],
};
