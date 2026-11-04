import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "skyr_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari (detik)

function sign(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/**
 * Buat token sesi: "<userId>.<expiresAt>.<signature>".
 * Token tidak berisi SESSION_SECRET dan kedaluwarsa otomatis.
 */
export function createSessionToken(userId) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET belum diset");
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

function verifySessionToken(token) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [userId, expiresAt, signature] = parts;
  if (!userId || Number(expiresAt) < Date.now() / 1000) return false;
  const expected = Buffer.from(sign(`${userId}.${expiresAt}`, secret));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function isAuthenticated() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
