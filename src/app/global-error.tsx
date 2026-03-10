"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Next.js requires a `global-error.tsx` at the app root to catch errors
 * in the root layout. Sentry uses this to capture unhandled errors.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            padding: "2rem",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
              <svg
                style={{ width: "3rem", height: "3rem", color: "#F6B40E" }}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Algo salió mal
            </h1>
            <p style={{ color: "#666", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Ocurrió un error inesperado. Si el problema persiste, contactá a soporte.
            </p>
            {error.digest && (
              <p
                style={{
                  color: "#999",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  marginBottom: "1rem",
                }}
              >
                Código: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                background: "#75AADB",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
