// ─── Nubix Cloud API Client ──────────────────────────────────
// Low-level HTTP client for communicating with the Nubix Cloud
// REST API. Handles auth, retries, and error mapping.
//
// Nubix uses a standard REST API with Bearer token authentication.
// Base URL: https://api.nubix.cloud/v1 (or custom on-premise URL)

import { logger } from "@/lib/logger";
import type { NubixApiError, NubixPaginatedResponse } from "./types";

// ─── Configuration ───────────────────────────────────────────

interface NubixClientConfig {
  baseUrl: string;
  apiKey: string;
  tenantId: string;
  timeoutMs?: number;
}

let _config: NubixClientConfig | null = null;

/** Initialize the Nubix client. Call once at app startup. */
export function configureNubixClient(config: NubixClientConfig): void {
  _config = config;
}

/** Check if the Nubix integration is configured */
export function isNubixConfigured(): boolean {
  if (_config) return true;

  // Lazy-check environment variables
  const baseUrl = process.env.NUBIX_API_URL;
  const apiKey = process.env.NUBIX_API_KEY;
  const tenantId = process.env.NUBIX_TENANT_ID;

  if (baseUrl && apiKey && tenantId) {
    _config = { baseUrl, apiKey, tenantId };
    return true;
  }

  return false;
}

function getConfig(): NubixClientConfig {
  if (!_config) {
    // Attempt lazy initialization from env
    const baseUrl = process.env.NUBIX_API_URL;
    const apiKey = process.env.NUBIX_API_KEY;
    const tenantId = process.env.NUBIX_TENANT_ID;

    if (baseUrl && apiKey && tenantId) {
      _config = { baseUrl, apiKey, tenantId };
    } else {
      throw new Error(
        "Nubix client not configured. Set NUBIX_API_URL, NUBIX_API_KEY, and NUBIX_TENANT_ID.",
      );
    }
  }
  return _config;
}

// ─── Error Handling ──────────────────────────────────────────

export class NubixError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "NubixError";
  }
}

// ─── HTTP Methods ────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  options?: {
    body?: unknown;
    params?: Record<string, string | number | undefined>;
    signal?: AbortSignal;
  },
): Promise<T> {
  const config = getConfig();
  const url = new URL(`${config.baseUrl}${path}`);

  // Append query params (skip undefined values)
  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const timeoutMs = config.timeoutMs ?? 15_000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "X-Tenant-ID": config.tenantId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: options?.signal ?? controller.signal,
    });

    if (!response.ok) {
      let apiError: NubixApiError | null = null;
      try {
        apiError = (await response.json()) as NubixApiError;
      } catch {
        // Response body is not JSON
      }

      const errMsg =
        apiError?.message ?? `Nubix API error: ${response.status} ${response.statusText}`;
      logger.error(
        { status: response.status, path, code: apiError?.code },
        `Nubix API error: ${errMsg}`,
      );

      throw new NubixError(response.status, apiError?.code ?? "UNKNOWN", errMsg, apiError?.details);
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof NubixError) throw err;

    if (err instanceof DOMException && err.name === "AbortError") {
      logger.error({ path, timeoutMs }, "Nubix API request timed out");
      throw new NubixError(408, "TIMEOUT", `Request to ${path} timed out after ${timeoutMs}ms`);
    }

    logger.error({ err, path }, "Nubix API network error");
    throw new NubixError(
      0,
      "NETWORK_ERROR",
      `Failed to connect to Nubix API: ${(err as Error).message}`,
    );
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Public API ──────────────────────────────────────────────

export async function nubixGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  return request<T>("GET", path, { params });
}

export async function nubixPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>("POST", path, { body });
}

export async function nubixPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>("PUT", path, { body });
}

export async function nubixDelete(path: string): Promise<void> {
  return request<void>("DELETE", path);
}

// ─── Pagination Helper ──────────────────────────────────────

export async function nubixGetPaginated<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<NubixPaginatedResponse<T>> {
  return request<NubixPaginatedResponse<T>>("GET", path, { params });
}
