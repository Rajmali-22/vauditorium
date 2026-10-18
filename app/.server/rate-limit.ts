// Identifying an anonymous sender just well enough to rate-limit them.
//
// The IP is never stored. It is reduced to an HMAC under a server secret, so
// the database holds a value that matches the same sender again but cannot be
// turned back into an address, and is useless without the secret.

import { createHmac } from "node:crypto";

function secret(): string {
  const value = process.env.SENDER_HASH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SENDER_HASH_SECRET is not set (see .env.example)");
  }
  return "development-only-secret";
}

/** The client's IP as the platform reports it. Vercel sets x-forwarded-for. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function senderHash(request: Request): string {
  return createHmac("sha256", secret()).update(clientIp(request)).digest("hex");
}
