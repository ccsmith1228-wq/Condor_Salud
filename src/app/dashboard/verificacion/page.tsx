"use client";
import { useState, useCallback, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";

type CoverageStatus = "activo" | "inactivo" | "no_encontrado";
type CoverageSource = "sisa" | "pami" | "sssalud" | "clinic_db" | "cache" | "demo" | "not_found";

type Result = {
  status: CoverageStatus;
  nombre?: string;
  financiador?: string;
  plan?: string;
  vigencia?: string;
  grupo?: string;
  rnos?: string;
  source?: CoverageSource;
  cachedAt?: string;
};

type HistoryEntry = {
  nombre: string;
  dni: string;
  financiador: string;
  status: CoverageStatus;
  source: CoverageSource;
  hora: string;
};

type ProviderInfo = {
  sisa: { configured: boolean; healthy: boolean };
  pami: { configured: boolean; healthy: boolean };
  supabase: { configured: boolean };
};

const SOURCE_LABELS: Record<CoverageSource, { label: string; color: string }> = {
  sisa: { label: "SISA/PUCO", color: "bg-blue-100 text-blue-700" },
  pami: { label: "PAMI", color: "bg-sky-100 text-sky-700" },
  sssalud: { label: "SSSalud", color: "bg-indigo-100 text-indigo-700" },
  clinic_db: { label: "Base clínica", color: "bg-emerald-100 text-emerald-700" },
  cache: { label: "Caché", color: "bg-slate-100 text-slate-600" },
  demo: { label: "Demo", color: "bg-amber-100 text-amber-700" },
  not_found: { label: "No encontrado", color: "bg-gray-100 text-gray-500" },
};

export default function VerificacionPage() {
  const { t } = useLocale();
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [providers, setProviders] = useState<ProviderInfo | null>(null);

  // Fetch provider status on mount
  useEffect(() => {
    fetch("/api/verificacion?status=providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.providers && setProviders(data.providers))
      .catch(() => {});
  }, []);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const clean = dni.replace(/[.\-\s]/g, "");
      if (!clean || clean.length < 6) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/verificacion?dni=${encodeURIComponent(clean)}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || t("verification.errorQuery"));
        }
        const data = await res.json();
        const r: Result = data.result ?? data;
        setResult(r);

        // Prepend to local history (skip "not found" entries)
        if (r.status !== "no_encontrado") {
          const now = new Date();
          const hora =
            now.getHours().toString().padStart(2, "0") +
            ":" +
            now.getMinutes().toString().padStart(2, "0");
          setHistory((prev) => [
            {
              nombre: r.nombre ?? "—",
              dni:
                clean.length === 11
                  ? clean.replace(/(\d{2})(\d{8})(\d{1})/, "$1-$2-$3")
                  : clean.replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3"),
              financiador: r.financiador ?? "—",
              status: r.status ?? "inactivo",
              source: r.source ?? "not_found",
              hora,
            },
            ...prev.slice(0, 9),
          ]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("verification.errorRetry"));
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    [dni, t],
  );

  const isNotFound = result?.status === "no_encontrado";
  const isActive = result?.status === "activo";
  const isInactive = result?.status === "inactivo";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t("verification.title")}</h1>
        <p className="text-sm text-ink-muted mt-1">{t("verification.subtitle")}</p>
      </div>

      {/* Provider Status Bar */}
      {providers && (
        <div className="flex flex-wrap gap-2">
          <ProviderBadge name="SISA/PUCO" {...providers.sisa} />
          <ProviderBadge name="PAMI" {...providers.pami} />
          <ProviderBadge
            name="Base de datos"
            configured={providers.supabase.configured}
            healthy={providers.supabase.configured}
          />
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-border rounded-lg p-6">
        <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
          <input
            type="text"
            placeholder="DNI (ej: 30.123.456) o CUIL (ej: 20-30123456-9)"
            aria-label={t("verification.placeholder")}
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/[^\d.-]/g, ""))}
            className="flex-1 px-4 py-3 border border-border rounded-[4px] text-sm focus:outline-none focus:border-celeste-dark"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-celeste-dark text-white text-sm font-semibold rounded-[4px] hover:bg-celeste transition disabled:opacity-50"
          >
            {loading ? t("verification.checking") : t("verification.verify")}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`border rounded-lg p-6 ${
            isActive
              ? "bg-green-50 border-green-200"
              : isNotFound
                ? "bg-amber-50 border-amber-200"
                : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {/* Status icon */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                isActive ? "bg-green-500" : isNotFound ? "bg-amber-500" : "bg-red-500"
              }`}
            >
              {isActive ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : isNotFound ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            <div className="flex-1">
              <div className="font-bold text-ink">{result.nombre ?? "—"}</div>
              <div
                className={`text-sm font-semibold ${
                  isActive ? "text-green-700" : isNotFound ? "text-amber-700" : "text-red-700"
                }`}
              >
                {isActive
                  ? t("verification.activeCoverage")
                  : isNotFound
                    ? "Sin registros encontrados"
                    : t("verification.noCoverage")}
              </div>
            </div>

            {/* Source badge */}
            {result.source && <SourceBadge source={result.source} cachedAt={result.cachedAt} />}
          </div>

          {/* Details grid – only show if we have data */}
          {!isNotFound && (
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-xs text-ink-muted">{t("verification.financiador")}</div>
                <div className="text-sm font-semibold text-ink">{result.financiador ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-ink-muted">{t("verification.plan")}</div>
                <div className="text-sm font-semibold text-ink">{result.plan ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-ink-muted">{t("verification.validity")}</div>
                <div className="text-sm font-semibold text-ink">{result.vigencia ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-ink-muted">{t("verification.familyGroup")}</div>
                <div className="text-sm font-semibold text-ink">{result.grupo ?? "—"}</div>
              </div>
              {result.rnos && (
                <div>
                  <div className="text-xs text-ink-muted">RNOS</div>
                  <div className="text-sm font-semibold text-ink">{result.rnos}</div>
                </div>
              )}
            </div>
          )}

          {isNotFound && (
            <p className="text-sm text-amber-700 mt-2">
              No se encontraron registros de cobertura en las fuentes consultadas.
              {!providers?.sisa.configured &&
                " Configure las credenciales de SISA para ampliar la búsqueda."}
            </p>
          )}
        </div>
      )}

      {/* Recent verifications */}
      {history.length > 0 && (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <div className="text-xs text-ink-muted">{t("verification.recentChecks")}</div>
          </div>
          <table className="w-full text-sm" aria-label="Verificaciones recientes">
            <thead>
              <tr className="bg-surface text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th scope="col" className="text-left px-5 py-2.5">
                  {t("verification.patient")}
                </th>
                <th scope="col" className="text-left px-5 py-2.5">
                  {t("verification.dni")}
                </th>
                <th scope="col" className="text-left px-5 py-2.5">
                  {t("verification.financiador")}
                </th>
                <th scope="col" className="text-left px-5 py-2.5">
                  {t("verification.status")}
                </th>
                <th scope="col" className="text-left px-5 py-2.5">
                  Fuente
                </th>
                <th scope="col" className="text-right px-5 py-2.5">
                  {t("verification.time")}
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((v, i) => (
                <tr key={`${v.dni}-${i}`} className="border-t border-border-light">
                  <td className="px-5 py-3 font-semibold text-ink">{v.nombre}</td>
                  <td className="px-5 py-3 text-ink-light">{v.dni}</td>
                  <td className="px-5 py-3 text-ink-light">{v.financiador}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        v.status === "activo"
                          ? "bg-green-100 text-green-700"
                          : v.status === "no_encontrado"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {v.status === "no_encontrado" ? "no encontrado" : v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <SourceBadge source={v.source} small />
                  </td>
                  <td className="px-5 py-3 text-right text-ink-muted">{v.hora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Helper components ─── */

function ProviderBadge({
  name,
  configured,
  healthy,
}: {
  name: string;
  configured: boolean;
  healthy: boolean;
}) {
  const dot = !configured ? "bg-gray-300" : healthy ? "bg-green-500" : "bg-red-500";
  const label = !configured ? "No configurado" : healthy ? "Conectado" : "Error";
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-border rounded text-xs text-ink-muted">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {name}: {label}
    </span>
  );
}

function SourceBadge({
  source,
  cachedAt,
  small,
}: {
  source: CoverageSource;
  cachedAt?: string;
  small?: boolean;
}) {
  const info = SOURCE_LABELS[source] ?? SOURCE_LABELS.not_found;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-semibold ${info.color} ${
        small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1"
      }`}
      title={cachedAt ? `En caché desde ${new Date(cachedAt).toLocaleString("es-AR")}` : undefined}
    >
      {info.label}
    </span>
  );
}
