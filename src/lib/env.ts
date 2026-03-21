import { z } from "zod";

// ─── Server-side Environment Variables ───────────────────────
// These are only available on the server (Node.js runtime).

/** I-05: Reject known placeholder values that would silently break production */
const notPlaceholder = (field: string) =>
  z
    .string()
    .refine(
      (val) =>
        !val.includes("your-project") &&
        !val.includes("placeholder") &&
        !val.includes("xxxx") &&
        !val.includes("YOUR_"),
      { message: `${field} contains a placeholder value — set a real credential` },
    );

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // ── Supabase ────────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL")
    .pipe(notPlaceholder("NEXT_PUBLIC_SUPABASE_URL"))
    .optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
    .pipe(notPlaceholder("NEXT_PUBLIC_SUPABASE_ANON_KEY"))
    .optional(),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1)
    .pipe(notPlaceholder("SUPABASE_SERVICE_ROLE_KEY"))
    .optional(),

  // ── Sentry ──────────────────────────────────────────────────
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // ── PAMI API ────────────────────────────────────────────────
  PAMI_API_URL: z.string().url().optional(),
  PAMI_API_TOKEN: z.string().optional(),

  // ── AFIP WSFEV1 ─────────────────────────────────────────────
  AFIP_CERT_PATH: z.string().optional(),
  AFIP_KEY_PATH: z.string().optional(),
  AFIP_CUIT: z.string().optional(),

  // ── Swiss Medical ───────────────────────────────────────────
  SWISS_MEDICAL_CLIENT_ID: z.string().optional(),
  SWISS_MEDICAL_CLIENT_SECRET: z.string().optional(),

  // ── Twilio (WhatsApp) ───────────────────────────────────────
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),

  // ── Daily.co (Video) ───────────────────────────────────────
  DAILY_API_KEY: z.string().optional(),

  // ── MercadoPago ─────────────────────────────────────────────
  MP_ACCESS_TOKEN: z.string().optional(),
  NEXT_PUBLIC_MP_PUBLIC_KEY: z.string().optional(),

  // ── Resend (Email) ──────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),

  // ── SendGrid (Email — v3) ──────────────────────────────────
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_FROM_NAME: z.string().optional(),
  SG_TPL_BOOKING_CONFIRMATION: z.string().optional(),
  SG_TPL_BOOKING_REMINDER: z.string().optional(),
  SG_TPL_BOOKING_CANCELLED: z.string().optional(),
  SG_TPL_BOOKING_CONFIRMED: z.string().optional(),
  SG_TPL_WELCOME_PATIENT: z.string().optional(),
  SG_TPL_WELCOME_DOCTOR: z.string().optional(),
  SG_TPL_RESET_PASSWORD: z.string().optional(),
  SG_TPL_NEW_REVIEW: z.string().optional(),

  // ── Firebase (Firestore + Storage — v3) ────────────────────
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),

  // ── JWT (Patient/Doctor auth — v3) ─────────────────────────
  JWT_SECRET: z.string().optional(),

  // ── Admin panel (v3) ───────────────────────────────────────
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),

  // ── MercadoPago Webhook (v3) ───────────────────────────────
  MP_WEBHOOK_SECRET: z.string().optional(),

  // ── PostHog (Analytics) ─────────────────────────────────────
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),

  // ── Upstash Redis ───────────────────────────────────────────
  UPSTASH_REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_TOKEN: z.string().optional(),

  // ── Nubix Cloud (RIS/PACS) ─────────────────────────────────
  NUBIX_API_URL: z.string().url().optional(),
  NUBIX_API_KEY: z.string().optional(),
  NUBIX_TENANT_ID: z.string().optional(),

  // ── Anthropic (Claude AI for Cora chatbot) ─────────────────
  ANTHROPIC_API_KEY: z.string().optional(),

  // ── Rides (Uber — v0.17.0) ─────────────────────────────────
  UBER_CLIENT_ID: z.string().optional(),
  UBER_SERVER_TOKEN: z.string().optional(),

  // ── Google OAuth ────────────────────────────────────────────
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z
    .string()
    .pipe(notPlaceholder("NEXT_PUBLIC_GOOGLE_CLIENT_ID"))
    .optional(),
  GOOGLE_CLIENT_SECRET: z.string().pipe(notPlaceholder("GOOGLE_CLIENT_SECRET")).optional(),

  // ── Supabase JWT (for API route auth) ──────────────────────
  SUPABASE_JWT_SECRET: z.string().pipe(notPlaceholder("SUPABASE_JWT_SECRET")).optional(),

  // ── Session Encryption (for Google OAuth tokens) ───────────
  SESSION_ENCRYPTION_KEY: z
    .string()
    .length(64, "SESSION_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)")
    .optional(),

  // ── Doctoraliar / Docplanner (Directorio Médico) ────────────
  DOCTORALIAR_CLIENT_ID: z.string().optional(),
  DOCTORALIAR_CLIENT_SECRET: z.string().optional(),

  // ── Google Maps (server-side proxy) ────────────────────────
  GOOGLE_MAPS_API_KEY: z.string().optional(),

  // ── App ─────────────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_DEMO_MODE: z.string().optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

// ─── Client-side Environment Variables ───────────────────────
// Only NEXT_PUBLIC_* variables are available in the browser.
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url()
    .pipe(notPlaceholder("NEXT_PUBLIC_SUPABASE_URL"))
    .optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1)
    .pipe(notPlaceholder("NEXT_PUBLIC_SUPABASE_ANON_KEY"))
    .optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_MP_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_DEMO_MODE: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

// ─── Type exports ────────────────────────────────────────────
export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

// ─── Validation Functions ────────────────────────────────────

/** Validate and return server environment. Call this in server-only code. */
function validateServerEnv(): ServerEnv {
  const result = serverSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  [x] ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(`\n[ERROR] Invalid server environment variables:\n${formatted}\n`);

    // In production, fail hard. In development, warn but continue.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid server environment variables. See logs above.");
    }
  }

  return (result.success ? result.data : serverSchema.parse({})) as ServerEnv;
}

/** Validate and return client environment. Safe to call in browser code. */
function validateClientEnv(): ClientEnv {
  const clientVars: Record<string, string | undefined> = {};

  // Only expose NEXT_PUBLIC_ vars
  if (typeof window !== "undefined") {
    // In browser: access env vars embedded by Next.js at build time
    clientVars.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    clientVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    clientVars.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;
    clientVars.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
    clientVars.NEXT_PUBLIC_MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    clientVars.NEXT_PUBLIC_GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    clientVars.NEXT_PUBLIC_GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    clientVars.NEXT_PUBLIC_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE;
    clientVars.NEXT_PUBLIC_SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
    clientVars.NEXT_PUBLIC_POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    clientVars.NEXT_PUBLIC_POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  } else {
    // On server: can read directly
    clientVars.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    clientVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    clientVars.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;
    clientVars.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
    clientVars.NEXT_PUBLIC_MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    clientVars.NEXT_PUBLIC_GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    clientVars.NEXT_PUBLIC_GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    clientVars.NEXT_PUBLIC_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE;
    clientVars.NEXT_PUBLIC_SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
    clientVars.NEXT_PUBLIC_POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    clientVars.NEXT_PUBLIC_POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  }

  const result = clientSchema.safeParse(clientVars);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  [x] ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(`\n[ERROR] Invalid client environment variables:\n${formatted}\n`);
  }

  return (result.success ? result.data : clientSchema.parse({})) as ClientEnv;
}

// ─── Singleton exports ───────────────────────────────────────
// Validated lazily on first access so that `next build` page-data
// collection doesn't crash when env vars are absent at build time.

let _serverEnv: ServerEnv | null = null;

/** Server environment — use in API routes, server components, middleware */
export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: string) {
    if (typeof window !== "undefined") return undefined;
    if (!_serverEnv) _serverEnv = validateServerEnv();
    return _serverEnv[prop as keyof ServerEnv];
  },
});

/** Client environment — safe to use anywhere */
export const clientEnv: ClientEnv = validateClientEnv();

// ─── Helper: Check if Supabase is configured ────────────────
export function isSupabaseConfigured(): boolean {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes("placeholder") && !url.includes("your-project");
}

// ─── Helper: Check if Sentry is configured ──────────────────
export function isSentryConfigured(): boolean {
  if (typeof window !== "undefined") return false; // Can't check server env in browser
  return !!serverEnv.SENTRY_DSN;
}
