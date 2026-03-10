import { createHash } from "crypto";

/** Hash a 4-digit pin with SHA-256 */
export function hashPin(pin: string): string {
  return createHash("sha256").update(pin).digest("hex");
}

/** Verify a pin against its hash */
export function verifyPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash;
}

/** Validate pin is exactly 4 digits */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}
