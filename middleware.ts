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
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/members/:path*", "/members"],
};
