/**
 * AES-256-GCM encryption / decryption for sensitive tokens.
 * Used to encrypt Google OAuth tokens before storing in httpOnly cookies.
 */
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

/** Dev fallback key — generated once per process, lost on restart */
let _devFallback: string | undefined;

/** Resolve the encryption key lazily (not at module load / build time) */
function getKey(): Buffer {
  const envKey = process.env.SESSION_ENCRYPTION_KEY;
  if (envKey) return Buffer.from(envKey.slice(0, 64), "hex");

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_ENCRYPTION_KEY is required in production. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }

  // Dev-only: stable per process but NOT across restarts
  if (!_devFallback) _devFallback = crypto.randomBytes(32).toString("hex");
  return Buffer.from(_devFallback, "hex");
}

/** Encrypt a plaintext string → "iv:tag:ciphertext" (hex) */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${tag}:${encrypted}`;
}

/** Decrypt an "iv:tag:ciphertext" string back to plaintext */
export function decrypt(encoded: string): string {
  const key = getKey();
  const [ivHex, tagHex, ciphertext] = encoded.split(":");
  if (!ivHex || !tagHex || !ciphertext) throw new Error("Invalid encrypted token format");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
