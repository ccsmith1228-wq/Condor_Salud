/**
 * AES-256-GCM encryption / decryption for sensitive tokens.
 * Used to encrypt Google OAuth tokens before storing in httpOnly cookies.
 */
import crypto from "crypto";

const ENCRYPTION_KEY =
  process.env.SESSION_ENCRYPTION_KEY ||
  (() => {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SESSION_ENCRYPTION_KEY is required in production. " +
          "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
      );
    }
    // Dev-only fallback — stable per process but NOT across restarts
    return crypto.randomBytes(32).toString("hex");
  })();
const ALGORITHM = "aes-256-gcm";

/** Encrypt a plaintext string → "iv:tag:ciphertext" (hex) */
export function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${tag}:${encrypted}`;
}

/** Decrypt an "iv:tag:ciphertext" string back to plaintext */
export function decrypt(encoded: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), "hex");
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
