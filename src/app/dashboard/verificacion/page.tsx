"use client";
import { useState } from "react";

type Result = {
  status: "activo" | "inactivo" | null;
  nombre?: string;
  financiador?: string;
  plan?: string;
  vigencia?: string;
  grupo?: string;
};

export default function VerificacionPage() {
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni) return;
    setLoading(true);

    // TODO: Replace with real PAMI/Swiss Medical API call
    await new Promise((r) => setTimeout(r, 800));
    setResult({
      status: "activo",
      nombre: "María González",
      financiador: "PAMI",
      plan: "Jubilados y Pensionados",
      vigencia: "01/2026 – 12/2026",
      grupo: "Titular + 1 familiar",
    });
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">Verificación de Cobertura</h1>
        <p className="text-sm text-ink-muted mt-1">
          Consultá cobertura en tiempo real por DNI o CUIL
        </p>
      </div>

      {/* Search */}
      <div className="bg-white border border-border rounded-lg p-6">
        <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
          <input
            type="text"
            placeholder="DNI o CUIL del paciente"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="flex-1 px-4 py-3 border border-border rounded-[4px] text-sm focus:outline-none focus:border-celeste-dark"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-celeste-dark text-white text-sm font-semibold rounded-[4px] hover:bg-celeste transition disabled:opacity-50"
          >
            {loading ? "Consultando..." : "Verificar"}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`border rounded-lg p-6 ${
            result.status === "activo" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                result.status === "activo" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {result.status === "activo" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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
            <div>
              <div className="font-bold text-ink">{result.nombre}</div>
              <div
                className={`text-sm font-semibold ${
                  result.status === "activo" ? "text-green-700" : "text-red-700"
                }`}
              >
                {result.status === "activo" ? "Cobertura activa" : "Sin cobertura"}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <div className="text-xs text-ink-muted">Financiador</div>
              <div className="text-sm font-semibold text-ink">{result.financiador}</div>
            </div>
            <div>
              <div className="text-xs text-ink-muted">Plan</div>
              <div className="text-sm font-semibold text-ink">{result.plan}</div>
            </div>
            <div>
              <div className="text-xs text-ink-muted">Vigencia</div>
              <div className="text-sm font-semibold text-ink">{result.vigencia}</div>
            </div>
            <div>
              <div className="text-xs text-ink-muted">Grupo familiar</div>
              <div className="text-sm font-semibold text-ink">{result.grupo}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent verifications */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="text-xs text-ink-muted">Últimas verificaciones</div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              <th className="text-left px-5 py-2.5">Paciente</th>
              <th className="text-left px-5 py-2.5">DNI</th>
              <th className="text-left px-5 py-2.5">Financiador</th>
              <th className="text-left px-5 py-2.5">Estado</th>
              <th className="text-right px-5 py-2.5">Hora</th>
            </tr>
          </thead>
          <tbody>
            {[
              { n: "Carlos Pérez", d: "28.456.789", f: "OSDE", s: "activo", t: "14:23" },
              { n: "Ana Rodríguez", d: "35.123.456", f: "Swiss Medical", s: "activo", t: "13:45" },
              { n: "Jorge Martínez", d: "22.789.012", f: "PAMI", s: "activo", t: "12:10" },
              { n: "Laura Gómez", d: "40.567.890", f: "IOMA", s: "inactivo", t: "11:30" },
            ].map((v) => (
              <tr key={v.d} className="border-t border-border-light">
                <td className="px-5 py-3 font-semibold text-ink">{v.n}</td>
                <td className="px-5 py-3 text-ink-light">{v.d}</td>
                <td className="px-5 py-3 text-ink-light">{v.f}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      v.s === "activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {v.s}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-ink-muted">{v.t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
