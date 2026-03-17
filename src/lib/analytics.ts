// ─── Analytics — wired to PostHog ────────────────────────────
// Thin wrapper that delegates to PostHog for tracking + identity.
// Falls back to console logging in dev when PostHog is not configured.

import { createClientLogger } from "@/lib/logger";

const log = createClientLogger("analytics");

type EventName =
  | "page_view"
  | "login"
  | "logout"
  | "register"
  | "factura_created"
  | "paciente_created"
  | "turno_created"
  | "rechazo_reprocesado"
  | "verificacion_checked"
  | "reporte_exported"
  | "config_updated"
  | "search_performed"
  | "filter_applied"
  | "chatbot_message_sent"
  | "chatbot_response"
  | "chatbot_emergency"
  | "chatbot_voice_input";

interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, string | number | boolean>;
  timestamp?: number;
}

/** Lazy-load posthog-js only on the client */
function getPostHog() {
  if (typeof window === "undefined") return null;
  try {
    // Dynamic require for client-side PostHog
    const ph = require("posthog-js").default;
    if (ph && typeof ph.capture === "function") return ph;
  } catch {
    // PostHog not available — no-op
  }
  return null;
}

class Analytics {
  private enabled: boolean;

  constructor() {
    this.enabled = typeof window !== "undefined" && process.env.NODE_ENV === "production";
  }

  track(name: EventName, properties?: Record<string, string | number | boolean>) {
    const event: AnalyticsEvent = { name, properties, timestamp: Date.now() };

    if (process.env.NODE_ENV === "development") {
      log.debug({ event: name, ...properties }, "Track event");
    }

    const ph = getPostHog();
    if (ph) {
      ph.capture(name, properties);
    }
  }

  identify(userId: string, traits?: Record<string, string>) {
    if (process.env.NODE_ENV === "development") {
      log.debug({ userId, ...traits }, "Identify user");
    }

    const ph = getPostHog();
    if (ph) {
      ph.identify(userId, traits);
    }
  }

  reset() {
    const ph = getPostHog();
    if (ph) {
      ph.reset();
    }
  }
}

export const analytics = new Analytics();
