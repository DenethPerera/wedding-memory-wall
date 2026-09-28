import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, GUEST_COOKIE, verifyGateToken } from "@/lib/gate";

// Next.js 16 renamed Middleware to Proxy (same runtime/behavior). This is an
// optimistic, low-latency check only: it verifies the signed cookie's HMAC
// and expiry so unauthenticated visitors are redirected before any page
// renders. It intentionally does not touch the database.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const eventSecret = process.env.GATE_SECRET;
  if (!eventSecret) {
    // Misconfigured deployment: fail closed rather than leaking the site.
    return new NextResponse("Server misconfigured: GATE_SECRET is not set.", {
      status: 500,
    });
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/enter") return NextResponse.next();
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const valid = await verifyGateToken(token, "admin", eventSecret);
    if (!valid) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/enter";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === "/enter") return NextResponse.next();
  const token = request.cookies.get(GUEST_COOKIE)?.value;
  const valid = await verifyGateToken(token, "guest", eventSecret);
  if (!valid) {
    const url = request.nextUrl.clone();
    url.pathname = "/enter";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/gate|api/admin-gate|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)",
  ],
};
