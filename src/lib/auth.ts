/**
 * Single shared password, signed cookie. No user table, no provider framework.
 *
 * IMPORTANT: middleware is not the security boundary. A server action is a
 * POST to whatever route the browser is currently on, dispatched by an action
 * id that ships in the client bundle — so an attacker can invoke one from a
 * path the middleware matcher never sees. Middleware only provides the clean
 * redirect. Every action and every mutating route handler must start with
 * `await requireAdmin()`.
 *
 * Everything here uses Web Crypto rather than node:crypto so the identical
 * code runs in Edge middleware, server actions and route handlers.
 */

const COOKIE_NAME = "mc_admin";
const SESSION_DAYS = 30;
const VERSION = "v1";

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = 60 * 60 * 24 * SESSION_DAYS;

const encoder = new TextEncoder();

const toBase64Url = (bytes: ArrayBuffer): string =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

/** Constant-time string compare, so a signature cannot be guessed byte by byte. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return secret;
}

/**
 * The cookie carries an expiry and nothing else — there is one principal, so
 * there is no identity to encode. The expiry is inside the signed payload, not
 * merely in the cookie's Max-Age, which a client can edit.
 */
export async function createSessionValue(): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${VERSION}.${expiresAt}`;
  return `${payload}.${await hmac(payload, sessionSecret())}`;
}

export async function isValidSession(value: string | undefined): Promise<boolean> {
  if (!value) return false;

  const parts = value.split(".");
  if (parts.length !== 3) return false;

  const [version, expiresAt, signature] = parts;
  if (version !== VERSION) return false;

  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;

  try {
    const expected = await hmac(`${version}.${expiresAt}`, sessionSecret());
    return safeEqual(signature, expected);
  } catch {
    return false;
  }
}

/**
 * Compares hashes rather than the raw strings so the comparison is
 * fixed-length and leaks nothing about the password's length.
 */
export async function isCorrectPassword(submitted: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD is not set");

  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(submitted)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  return safeEqual(toBase64Url(a), toBase64Url(b));
}
