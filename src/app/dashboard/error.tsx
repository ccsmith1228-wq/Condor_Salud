"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/Button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: "dashboard" },
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4" aria-hidden="true">
          <svg
            className="w-12 h-12 text-gold"
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
        <h2 className="text-xl font-bold text-ink mb-2">Error en el módulo</h2>
        <p className="text-sm text-ink-muted mb-6">
          Ocurrió un error al cargar esta sección. Podés intentar de nuevo o volver al dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} variant="primary" size="sm">
            Reintentar
          </Button>
          <Button onClick={() => (window.location.href = "/dashboard")} variant="outline" size="sm">
            Ir al dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
