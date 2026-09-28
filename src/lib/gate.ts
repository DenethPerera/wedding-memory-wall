// Lightweight signed-cookie gate for the couple's admin dashboard. No user
// accounts: whoever knows the admin code gets the same signed token.
// Verification uses Web Crypto so it works in both the Edge proxy runtime
// and Node route handlers.

export const ADMIN_COOKIE = "wmw_admin_gate";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days, covers the whole wedding week

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toBase64Url(new Uint8Array(sig));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createGateToken(role: "admin", secret: string) {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = `${role}.${expires}`;
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifyGateToken(
  token: string | undefined,
  role: "admin",
  secret: string,
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenRole, expiresStr, sig] = parts;
  if (tokenRole !== role) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  const expected = await hmac(secret, `${tokenRole}.${expiresStr}`);
  return timingSafeEqual(expected, sig);
}
