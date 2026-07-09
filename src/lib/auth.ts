import { NextRequest } from "next/server";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "iqfit_admin_session";
const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || "fallback-secret-key-47-iqfits-2026-very-secure";

/**
 * Generates a cryptographically signed session token.
 * Contains user identifier and expiration date, signed via HMAC-SHA256.
 */
export function createSessionToken(): string {
  const expiresAt = Date.now() + 60 * 60 * 24 * 7 * 1000; // 7 days
  const payload = JSON.stringify({ user: "admin", expiresAt });
  const base64Payload = Buffer.from(payload).toString("base64");
  
  const hmac = crypto.createHmac("sha256", SECRET_KEY);
  hmac.update(base64Payload);
  const signature = hmac.digest("base64url");
  
  return `${base64Payload}.${signature}`;
}

/**
 * Verifies a signed session token.
 * Ensures the signature is valid and the token hasn't expired.
 */
export function verifySessionToken(token: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  
  const [base64Payload, signature] = parts;
  
  try {
    // Recompute signature to verify integrity
    const hmac = crypto.createHmac("sha256", SECRET_KEY);
    hmac.update(base64Payload);
    const expectedSignature = hmac.digest("base64url");
    
    if (signature !== expectedSignature) {
      return false; // Signature mismatch (tampered!)
    }
    
    const payloadJson = Buffer.from(base64Payload, "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);
    
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return false; // Token expired
    }
    
    return payload.user === "admin";
  } catch (err) {
    return false;
  }
}

/**
 * Helper to check administrative authentication directly from the request cookies.
 */
export function checkAdminAuth(req: NextRequest): boolean {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return false;
  return verifySessionToken(cookie.value);
}
