import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GUEST_COOKIE, createGateToken } from "@/lib/gate";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`guest:${ip}`)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  const secret = process.env.GATE_SECRET;
  const eventPin = process.env.EVENT_PIN;
  if (!secret || !eventPin) {
    return NextResponse.json(
      { error: "Server misconfigured." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";
  if (!pin || pin !== eventPin) {
    return NextResponse.json({ error: "Incorrect code." }, { status: 401 });
  }

  const token = await createGateToken("guest", secret);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(GUEST_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}
