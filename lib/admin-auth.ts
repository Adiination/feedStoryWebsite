import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Single-owner password auth.
 *
 * There's one account and no registration, so this is deliberately small: check
 * the password against an env var, then hand out an HMAC-signed cookie. No user
 * table, no password reset flow, nothing to leak.
 */

const COOKIE_NAME = "mv_admin";
const SESSION_DAYS = 7;

const password = process.env.ADMIN_PASSWORD ?? "";

/**
 * Signing key. Falls back to a key derived from the password so the admin still
 * works with only ADMIN_PASSWORD set — but then changing the password
 * invalidates every existing session, which is the safe direction.
 */
const secret =
  process.env.ADMIN_SESSION_SECRET ||
  (password ? `derived:${password}` : randomBytes(32).toString("hex"));

export const isAdminConfigured = password.length > 0;

/** Rejects a too-short password rather than pretending it's secure. */
export const adminPasswordTooShort = isAdminConfigured && password.length < 12;

function sign(value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual throws on length mismatch, so compare lengths separately —
  // still constant-time with respect to the *content*.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyPassword(candidate: string): boolean {
  if (!isAdminConfigured) return false;
  // Hash both sides first so the comparison length never reveals the real
  // password's length.
  return safeEqual(sign(`pw:${candidate}`), sign(`pw:${password}`));
}

function buildToken(): string {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return `${expires}.${sign(String(expires))}`;
}

function tokenIsValid(token: string | undefined): boolean {
  if (!token) return false;
  const [expiresRaw, signature] = token.split(".");
  if (!expiresRaw || !signature) return false;

  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;

  return safeEqual(signature, sign(expiresRaw));
}

export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, buildToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return tokenIsValid(store.get(COOKIE_NAME)?.value);
}

/* --------------------------- login rate limiting -------------------------- */

/**
 * In-process throttle. Good enough for a single-owner admin on one instance;
 * if you scale to several instances, move this to the database or a proxy rule.
 */
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function registerFailedAttempt(key: string): void {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now - record.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now });
    return;
  }
  record.count += 1;
}

export function isRateLimited(key: string): boolean {
  const record = attempts.get(key);
  if (!record) return false;
  if (Date.now() - record.firstAt > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}
