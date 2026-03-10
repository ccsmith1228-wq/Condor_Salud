// ─── SWR Configuration ───────────────────────────────────────
// Global SWR settings for the application.
// Provides consistent caching, revalidation, and error handling.

"use client";

import { SWRConfig } from "swr";
import type { ReactNode } from "react";

/** Default SWR fetcher — works with both API routes and service functions */
export async function fetcher<T>(key: string): Promise<T> {
  // If key starts with "/api/", fetch from API route
  if (key.startsWith("/api/")) {
    const res = await fetch(key);
    if (!res.ok) {
      const error = new Error("An error occurred while fetching data.");
      throw error;
    }
    return res.json();
  }

  // Otherwise, dynamically import from data service
  const { default: dataService } = await import("@/lib/services/data-client");
  const fn = dataService[key as keyof typeof dataService];
  if (typeof fn === "function") {
    return fn() as Promise<T>;
  }

  throw new Error(`Unknown SWR key: ${key}`);
}

/** Global SWR configuration */
const swrConfig = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  dedupingInterval: 5000,
  focusThrottleInterval: 5000,
};

/** Provider component — wrap your app or layout with this */
export function SWRProvider({ children }: { children: ReactNode }) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}

export { swrConfig };
