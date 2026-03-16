// ─── PDF Generation Service ──────────────────────────────────
// Server-side PDF templates using @react-pdf/renderer.
// Templates: Invoice (Factura), Rechazo Summary, KPI Dashboard.
//
// Usage (API route):
//   import { renderFacturaPDF } from "@/lib/services/pdf";
//   const stream = await renderFacturaPDF(facturas, meta);
//   return new Response(stream, { headers: { "Content-Type": "application/pdf" } });

import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToStream, Font } from "@react-pdf/renderer";
import type { Factura, Rechazo, KPI } from "@/lib/types";

// ─── Brand Colors ────────────────────────────────────────────
const COLORS = {
  celeste: "#75AADB",
  celesteDark: "#4A90C4",
  gold: "#F6B40E",
  ink: "#1A1A1A",
  inkLight: "#6B7280",
  surface: "#F8FAFB",
  border: "#D4E4F0",
  white: "#FFFFFF",
  red: "#DC2626",
  green: "#16A34A",
};

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLORS.ink,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: `2px solid ${COLORS.celeste}`,
  },
  brandName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: COLORS.celesteDark,
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 8,
    color: COLORS.inkLight,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerDate: {
    fontSize: 9,
    color: COLORS.inkLight,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginTop: 2,
  },
  // Meta info
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
  },
  metaLabel: {
    fontSize: 8,
    color: COLORS.inkLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
  },
  // Tables
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.celesteDark,
    padding: 8,
    borderRadius: 2,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: COLORS.surface,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.ink,
  },
  tableCellMuted: {
    fontSize: 9,
    color: COLORS.inkLight,
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
  },
  // KPI cards
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    width: "48%",
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    border: `1px solid ${COLORS.border}`,
  },
  kpiLabel: {
    fontSize: 8,
    color: COLORS.inkLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
  },
  kpiChange: {
    fontSize: 9,
    marginTop: 3,
  },
  // Summary
  summaryBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    border: `1px solid ${COLORS.border}`,
  },
  summaryTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.inkLight,
  },
  // Section title
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginBottom: 10,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
});

// ─── Helpers ─────────────────────────────────────────────────
function fmtARS(n: number): string {
  return (
    "$ " +
    n.toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

function today(): string {
  return new Date().toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface ReportMeta {
  clinicName: string;
  periodo: string;
  cuit?: string;
}

// ─── Shared Header ───────────────────────────────────────────
function ReportHeader({ title, meta }: { title: string; meta: ReportMeta }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brandName}>Cóndor Salud</Text>
        <Text style={styles.brandSub}>Sistema de Gestión en Salud</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerDate}>{today()}</Text>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={{ ...styles.headerDate, marginTop: 2 }}>
          {meta.clinicName} — {meta.periodo}
        </Text>
      </View>
    </View>
  );
}

function ReportFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Cóndor Salud — condorsalud.com — Generado el {today()}</Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      />
    </View>
  );
}

// ─── 1. Facturación PDF ──────────────────────────────────────
function FacturaPDFDocument({
  facturas,
  meta,
  kpis,
}: {
  facturas: Factura[];
  meta: ReportMeta;
  kpis?: KPI[];
}) {
  const total = facturas.reduce((s, f) => s + f.monto, 0);
  const cobrado = facturas.filter((f) => f.estado === "cobrada").reduce((s, f) => s + f.monto, 0);
  const pendiente = facturas
    .filter((f) => f.estado === "pendiente" || f.estado === "presentada")
    .reduce((s, f) => s + f.monto, 0);
  const rechazado = facturas
    .filter((f) => f.estado === "rechazada")
    .reduce((s, f) => s + f.monto, 0);

  return (
    <Document title={`Facturación — ${meta.periodo}`} author="Cóndor Salud">
      <Page size="A4" style={styles.page}>
        <ReportHeader title="Reporte de Facturación" meta={meta} />

        {/* Summary */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Total Facturado</Text>
            <Text style={styles.metaValue}>{fmtARS(total)}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Cobrado</Text>
            <Text style={{ ...styles.metaValue, color: COLORS.green }}>{fmtARS(cobrado)}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Pendiente</Text>
            <Text style={{ ...styles.metaValue, color: COLORS.gold }}>{fmtARS(pendiente)}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Rechazado</Text>
            <Text style={{ ...styles.metaValue, color: COLORS.red }}>{fmtARS(rechazado)}</Text>
          </View>
        </View>

        {/* KPIs if provided */}
        {kpis && kpis.length > 0 && (
          <View style={styles.kpiGrid}>
            {kpis.map((k, i) => (
              <View key={i} style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>{k.label}</Text>
                <Text style={styles.kpiValue}>{k.value}</Text>
                <Text
                  style={{
                    ...styles.kpiChange,
                    color: k.up ? COLORS.green : COLORS.red,
                  }}
                >
                  {k.up ? "▲" : "▼"} {k.change}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Invoice table */}
        <Text style={styles.sectionTitle}>Detalle de Facturas ({facturas.length})</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderCell, width: "12%" }}>Número</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "10%" }}>Fecha</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "16%" }}>Financiador</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "16%" }}>Paciente</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "22%" }}>Prestación</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "12%", textAlign: "right" }}>
              Monto
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "12%", textAlign: "center" }}>
              Estado
            </Text>
          </View>
          {facturas.map((f, i) => (
            <View key={f.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={{ ...styles.tableCellBold, width: "12%" }}>{f.numero}</Text>
              <Text style={{ ...styles.tableCellMuted, width: "10%" }}>{f.fecha}</Text>
              <Text style={{ ...styles.tableCell, width: "16%" }}>{f.financiador}</Text>
              <Text style={{ ...styles.tableCell, width: "16%" }}>{f.paciente}</Text>
              <Text style={{ ...styles.tableCellMuted, width: "22%" }}>{f.prestacion}</Text>
              <Text style={{ ...styles.tableCellBold, width: "12%", textAlign: "right" }}>
                {fmtARS(f.monto)}
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  width: "12%",
                  textAlign: "center",
                  color:
                    f.estado === "cobrada"
                      ? COLORS.green
                      : f.estado === "rechazada"
                        ? COLORS.red
                        : COLORS.gold,
                }}
              >
                {f.estado.charAt(0).toUpperCase() + f.estado.slice(1)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Resumen</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.tableCell}>Total de facturas</Text>
            <Text style={styles.tableCellBold}>{facturas.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.tableCell}>Total facturado</Text>
            <Text style={styles.tableCellBold}>{fmtARS(total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.tableCell}>Tasa de cobro</Text>
            <Text style={styles.tableCellBold}>
              {total > 0 ? ((cobrado / total) * 100).toFixed(1) : 0}%
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.tableCell}>Tasa de rechazo</Text>
            <Text style={{ ...styles.tableCellBold, color: COLORS.red }}>
              {total > 0 ? ((rechazado / total) * 100).toFixed(1) : 0}%
            </Text>
          </View>
        </View>

        <ReportFooter />
      </Page>
    </Document>
  );
}

// ─── 2. Rechazos PDF ─────────────────────────────────────────
function RechazosPDFDocument({
  rechazos,
  meta,
  kpis,
}: {
  rechazos: Rechazo[];
  meta: ReportMeta;
  kpis?: KPI[];
}) {
  const totalMonto = rechazos.reduce((s, r) => s + r.monto, 0);
  const pendientes = rechazos.filter((r) => r.estado === "pendiente");
  const reprocesables = rechazos.filter((r) => r.reprocesable);

  // Group by motivo
  const byMotivo = rechazos.reduce(
    (acc, r) => {
      acc[r.motivo] = (acc[r.motivo] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Group by financiador
  const byFinanciador = rechazos.reduce(
    (acc, r) => {
      acc[r.financiador] = (acc[r.financiador] || 0) + r.monto;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <Document title={`Rechazos — ${meta.periodo}`} author="Cóndor Salud">
      <Page size="A4" style={styles.page}>
        <ReportHeader title="Análisis de Rechazos" meta={meta} />

        {/* Summary */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Total Rechazado</Text>
            <Text style={{ ...styles.metaValue, color: COLORS.red }}>{fmtARS(totalMonto)}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Rechazos</Text>
            <Text style={styles.metaValue}>{rechazos.length}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Pendientes</Text>
            <Text style={{ ...styles.metaValue, color: COLORS.gold }}>{pendientes.length}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Reprocesables</Text>
            <Text style={{ ...styles.metaValue, color: COLORS.green }}>{reprocesables.length}</Text>
          </View>
        </View>

        {kpis && kpis.length > 0 && (
          <View style={styles.kpiGrid}>
            {kpis.map((k, i) => (
              <View key={i} style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>{k.label}</Text>
                <Text style={styles.kpiValue}>{k.value}</Text>
                <Text
                  style={{
                    ...styles.kpiChange,
                    color: k.up ? COLORS.green : COLORS.red,
                  }}
                >
                  {k.up ? "▲" : "▼"} {k.change}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* By motivo */}
        <Text style={styles.sectionTitle}>Desglose por Motivo</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderCell, width: "60%" }}>Motivo</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "20%", textAlign: "center" }}>
              Cantidad
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "20%", textAlign: "right" }}>
              % del Total
            </Text>
          </View>
          {Object.entries(byMotivo)
            .sort((a, b) => b[1] - a[1])
            .map(([motivo, count], i) => (
              <View key={motivo} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={{ ...styles.tableCell, width: "60%" }}>
                  {motivo.replace(/_/g, " ")}
                </Text>
                <Text style={{ ...styles.tableCellBold, width: "20%", textAlign: "center" }}>
                  {count}
                </Text>
                <Text style={{ ...styles.tableCellMuted, width: "20%", textAlign: "right" }}>
                  {((count / rechazos.length) * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
        </View>

        {/* By financiador */}
        <Text style={styles.sectionTitle}>Desglose por Financiador</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderCell, width: "50%" }}>Financiador</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "25%", textAlign: "right" }}>
              Monto
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "25%", textAlign: "right" }}>
              % del Total
            </Text>
          </View>
          {Object.entries(byFinanciador)
            .sort((a, b) => b[1] - a[1])
            .map(([fin, monto], i) => (
              <View key={fin} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={{ ...styles.tableCell, width: "50%" }}>{fin}</Text>
                <Text style={{ ...styles.tableCellBold, width: "25%", textAlign: "right" }}>
                  {fmtARS(monto)}
                </Text>
                <Text style={{ ...styles.tableCellMuted, width: "25%", textAlign: "right" }}>
                  {totalMonto > 0 ? ((monto / totalMonto) * 100).toFixed(1) : 0}%
                </Text>
              </View>
            ))}
        </View>

        {/* Detail table */}
        <Text style={styles.sectionTitle}>Detalle de Rechazos ({rechazos.length})</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderCell, width: "12%" }}>Factura</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "15%" }}>Financiador</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "15%" }}>Paciente</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "20%" }}>Motivo</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "12%", textAlign: "right" }}>
              Monto
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "13%", textAlign: "center" }}>
              Reproc.
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "13%", textAlign: "center" }}>
              Estado
            </Text>
          </View>
          {rechazos.map((r, i) => (
            <View key={r.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={{ ...styles.tableCellBold, width: "12%" }}>{r.facturaNumero}</Text>
              <Text style={{ ...styles.tableCell, width: "15%" }}>{r.financiador}</Text>
              <Text style={{ ...styles.tableCell, width: "15%" }}>{r.paciente}</Text>
              <Text style={{ ...styles.tableCellMuted, width: "20%" }}>
                {r.motivo.replace(/_/g, " ")}
              </Text>
              <Text style={{ ...styles.tableCellBold, width: "12%", textAlign: "right" }}>
                {fmtARS(r.monto)}
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  width: "13%",
                  textAlign: "center",
                  color: r.reprocesable ? COLORS.green : COLORS.red,
                }}
              >
                {r.reprocesable ? "Sí" : "No"}
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  width: "13%",
                  textAlign: "center",
                  color:
                    r.estado === "reprocesado"
                      ? COLORS.green
                      : r.estado === "pendiente"
                        ? COLORS.gold
                        : COLORS.inkLight,
                }}
              >
                {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
              </Text>
            </View>
          ))}
        </View>

        <ReportFooter />
      </Page>
    </Document>
  );
}

// ─── 3. KPI Dashboard PDF ────────────────────────────────────
function KPIDashboardPDFDocument({
  sections,
  meta,
}: {
  sections: { title: string; kpis: KPI[] }[];
  meta: ReportMeta;
}) {
  return (
    <Document title={`KPI Ejecutivo — ${meta.periodo}`} author="Cóndor Salud">
      <Page size="A4" style={styles.page}>
        <ReportHeader title="Indicadores KPI Ejecutivo" meta={meta} />

        {sections.map((section, si) => (
          <View key={si} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.kpiGrid}>
              {section.kpis.map((k, ki) => (
                <View key={ki} style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>{k.label}</Text>
                  <Text style={styles.kpiValue}>{k.value}</Text>
                  <Text
                    style={{
                      ...styles.kpiChange,
                      color: k.up ? COLORS.green : COLORS.red,
                    }}
                  >
                    {k.up ? "▲" : "▼"} {k.change}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Nota</Text>
          <Text style={{ ...styles.tableCell, lineHeight: 1.6 }}>
            Este reporte fue generado automáticamente por Cóndor Salud. Los indicadores reflejan el
            período {meta.periodo} y se calculan en base a los datos registrados en el sistema. Para
            mayor detalle, acceda a cada módulo desde el panel de control.
          </Text>
        </View>

        <ReportFooter />
      </Page>
    </Document>
  );
}

// ─── Render Functions (called from API routes) ───────────────

export async function renderFacturaPDF(
  facturas: Factura[],
  meta: ReportMeta,
  kpis?: KPI[],
): Promise<NodeJS.ReadableStream> {
  return renderToStream(<FacturaPDFDocument facturas={facturas} meta={meta} kpis={kpis} />);
}

export async function renderRechazosPDF(
  rechazos: Rechazo[],
  meta: ReportMeta,
  kpis?: KPI[],
): Promise<NodeJS.ReadableStream> {
  return renderToStream(<RechazosPDFDocument rechazos={rechazos} meta={meta} kpis={kpis} />);
}

export async function renderKPIDashboardPDF(
  sections: { title: string; kpis: KPI[] }[],
  meta: ReportMeta,
): Promise<NodeJS.ReadableStream> {
  return renderToStream(<KPIDashboardPDFDocument sections={sections} meta={meta} />);
}

// ─── Export types for API routes ─────────────────────────────
export type { ReportMeta };
