import { NextResponse, type NextRequest } from "next/server";

/**
 * Coarse edge gate for the admin area: redirects requests without a session
 * cookie to sign-in. Full role authorization (ADMIN) is enforced server-side
 * by requireAdmin() in each admin page.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin")) {
    if (!req.cookies.get("lions_session")) {
      const url = req.nextUrl.clone();
      url.pathname = "/sign-in";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
