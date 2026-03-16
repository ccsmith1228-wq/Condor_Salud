// ─── Client-Side Export Helpers ──────────────────────────────
// Trigger PDF/Excel downloads from the browser by calling API routes.
//
// Usage:
//   import { downloadPDF, downloadExcel } from "@/lib/services/export";
//   <button onClick={() => downloadPDF("facturacion")}>Descargar PDF</button>

"use client";

export type PDFReportType = "facturacion" | "rechazos" | "kpi";
export type ExcelReportType =
  | "facturacion"
  | "rechazos"
  | "nomenclador"
  | "inventario"
  | "pacientes";

interface ExportMeta {
  clinicName?: string;
  periodo?: string;
}

/**
 * Trigger a PDF download for the given report type.
 * Calls POST /api/reportes/pdf and downloads the resulting file.
 */
export async function downloadPDF(type: PDFReportType, meta?: ExportMeta): Promise<void> {
  const res = await fetch("/api/reportes/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      meta: {
        clinicName: meta?.clinicName || "Clínica Demo",
        periodo: meta?.periodo || getCurrentPeriodo(),
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(err.error || "Error generando PDF");
  }

  const blob = await res.blob();
  triggerDownload(blob, getFilename(type, "pdf", meta?.periodo));
}

/**
 * Trigger an Excel download for the given report type.
 * Calls POST /api/reportes/excel and downloads the resulting file.
 */
export async function downloadExcel(type: ExcelReportType, meta?: ExportMeta): Promise<void> {
  const res = await fetch("/api/reportes/excel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      meta: {
        clinicName: meta?.clinicName || "Clínica Demo",
        periodo: meta?.periodo || getCurrentPeriodo(),
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error desconocido" }));
    throw new Error(err.error || "Error generando Excel");
  }

  const blob = await res.blob();
  triggerDownload(blob, getFilename(type, "xlsx", meta?.periodo));
}

// ─── Helpers ─────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getCurrentPeriodo(): string {
  const now = new Date();
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

function getFilename(type: string, ext: string, periodo?: string): string {
  const slug = (periodo || getCurrentPeriodo()).toLowerCase().replace(/\s/g, "-");
  return `${type}-${slug}.${ext}`;
}

// ─── Hook for loading state ──────────────────────────────────
import { useState, useCallback } from "react";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportPDF = useCallback(async (type: PDFReportType, meta?: ExportMeta) => {
    setIsExporting(true);
    setExportError(null);
    try {
      await downloadPDF(type, meta);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportExcel = useCallback(async (type: ExcelReportType, meta?: ExportMeta) => {
    setIsExporting(true);
    setExportError(null);
    try {
      await downloadExcel(type, meta);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { isExporting, exportError, exportPDF, exportExcel };
}
