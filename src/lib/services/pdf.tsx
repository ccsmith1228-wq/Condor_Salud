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

// ─── Register Brand Font (DM Sans) ──────────────────────────
Font.register({
  family: "DM Sans",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/dmsans/v15/rP2Yp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAkpFhRQ.ttf",
    },
    {
      src: "https://fonts.gstatic.com/s/dmsans/v15/rP2Yp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop5hRQ.ttf",
      fontWeight: "bold",
    },
  ],
});

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
    fontFamily: "DM Sans",
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
    fontFamily: "DM Sans",
    fontWeight: "bold",
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
    fontFamily: "DM Sans",
    fontWeight: "bold",
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
    fontFamily: "DM Sans",
    fontWeight: "bold",
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
    fontFamily: "DM Sans",
    fontWeight: "bold",
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
    fontFamily: "DM Sans",
    fontWeight: "bold",
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
    fontFamily: "DM Sans",
    fontWeight: "bold",
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
    fontFamily: "DM Sans",
    fontWeight: "bold",
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
    fontFamily: "DM Sans",
    fontWeight: "bold",
    color: COLORS.ink,
    marginBottom: 10,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
    fontFamily: "DM Sans",
    fontWeight: "bold",
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

// ─── 4. Financiadores PDF ────────────────────────────────────
function FinanciadoresPDFDocument({
  financiadores,
  meta,
}: {
  financiadores: {
    name: string;
    type: string;
    facturado: number;
    cobrado: number;
    tasaRechazo: number;
    diasPromedioPago: number;
    facturasPendientes: number;
  }[];
  meta: ReportMeta;
}) {
  const totalFacturado = financiadores.reduce((s, f) => s + f.facturado, 0);
  const totalCobrado = financiadores.reduce((s, f) => s + f.cobrado, 0);
  const promedioRechazo =
    financiadores.length > 0
      ? Math.round(
          (financiadores.reduce((s, f) => s + f.tasaRechazo, 0) / financiadores.length) * 10,
        ) / 10
      : 0;
  const promedioDias =
    financiadores.length > 0
      ? Math.round(financiadores.reduce((s, f) => s + f.diasPromedioPago, 0) / financiadores.length)
      : 0;

  return (
    <Document title={`Financiadores — ${meta.periodo}`} author="Cóndor Salud">
      <Page size="A4" style={styles.page}>
        <ReportHeader title="Análisis de Financiadores" meta={meta} />

        {/* Summary KPIs */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Facturado</Text>
            <Text style={styles.kpiValue}>{fmtARS(totalFacturado)}</Text>
            <Text style={{ ...styles.kpiChange, color: COLORS.inkLight }}>
              {financiadores.length} financiadores
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Cobrado</Text>
            <Text style={{ ...styles.kpiValue, color: COLORS.green }}>{fmtARS(totalCobrado)}</Text>
            <Text style={{ ...styles.kpiChange, color: COLORS.green }}>
              {totalFacturado > 0 ? ((totalCobrado / totalFacturado) * 100).toFixed(1) : 0}% del
              facturado
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Rechazo Promedio</Text>
            <Text
              style={{ ...styles.kpiValue, color: promedioRechazo > 10 ? COLORS.red : COLORS.ink }}
            >
              {promedioRechazo}%
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Días Pago Promedio</Text>
            <Text
              style={{ ...styles.kpiValue, color: promedioDias > 60 ? COLORS.red : COLORS.ink }}
            >
              {promedioDias}
            </Text>
          </View>
        </View>

        {/* Detail table */}
        <Text style={styles.sectionTitle}>Detalle por Financiador ({financiadores.length})</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderCell, width: "22%" }}>Financiador</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "10%", textAlign: "center" }}>
              Tipo
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "15%", textAlign: "right" }}>
              Facturado
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "15%", textAlign: "right" }}>
              Cobrado
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "10%", textAlign: "center" }}>
              Cobro %
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "10%", textAlign: "center" }}>
              Rechazo
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "10%", textAlign: "center" }}>
              Días Pago
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "8%", textAlign: "center" }}>
              Pend.
            </Text>
          </View>
          {financiadores.map((f, i) => {
            const cobro = f.facturado > 0 ? ((f.cobrado / f.facturado) * 100).toFixed(1) : "0";
            return (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={{ ...styles.tableCellBold, width: "22%" }}>{f.name}</Text>
                <Text style={{ ...styles.tableCellMuted, width: "10%", textAlign: "center" }}>
                  {f.type}
                </Text>
                <Text style={{ ...styles.tableCellBold, width: "15%", textAlign: "right" }}>
                  {fmtARS(f.facturado)}
                </Text>
                <Text
                  style={{
                    ...styles.tableCell,
                    width: "15%",
                    textAlign: "right",
                    color: COLORS.green,
                  }}
                >
                  {fmtARS(f.cobrado)}
                </Text>
                <Text style={{ ...styles.tableCellBold, width: "10%", textAlign: "center" }}>
                  {cobro}%
                </Text>
                <Text
                  style={{
                    ...styles.tableCell,
                    width: "10%",
                    textAlign: "center",
                    color:
                      f.tasaRechazo > 10
                        ? COLORS.red
                        : f.tasaRechazo > 5
                          ? COLORS.gold
                          : COLORS.green,
                  }}
                >
                  {f.tasaRechazo}%
                </Text>
                <Text
                  style={{
                    ...styles.tableCell,
                    width: "10%",
                    textAlign: "center",
                    color: f.diasPromedioPago > 60 ? COLORS.red : COLORS.ink,
                  }}
                >
                  {f.diasPromedioPago}
                </Text>
                <Text style={{ ...styles.tableCellMuted, width: "8%", textAlign: "center" }}>
                  {f.facturasPendientes}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Resumen</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.tableCell}>Financiadores activos</Text>
            <Text style={styles.tableCellBold}>{financiadores.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.tableCell}>Total facturado</Text>
            <Text style={styles.tableCellBold}>{fmtARS(totalFacturado)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.tableCell}>Tasa de cobro global</Text>
            <Text style={styles.tableCellBold}>
              {totalFacturado > 0 ? ((totalCobrado / totalFacturado) * 100).toFixed(1) : 0}%
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.tableCell}>Pendiente de cobro</Text>
            <Text style={{ ...styles.tableCellBold, color: COLORS.red }}>
              {fmtARS(totalFacturado - totalCobrado)}
            </Text>
          </View>
        </View>

        <ReportFooter />
      </Page>
    </Document>
  );
}

// ─── 5. Inflación PDF ────────────────────────────────────────
function InflacionPDFDocument({
  meses,
  financiadoresInflacion,
  meta,
}: {
  meses: {
    mes: string;
    ipc: number;
    facturado: number;
    cobrado: number;
    diasDemora: number;
    perdidaReal: number;
    perdidaPorcentaje: number;
  }[];
  financiadoresInflacion: {
    name: string;
    diasPromedio: number;
    perdidaPorDia: number;
    perdidaTotal: number;
    montoAfectado: number;
  }[];
  meta: ReportMeta;
}) {
  const totalPerdida = meses.reduce((s, m) => s + m.perdidaReal, 0);
  const ipcPromedio =
    meses.length > 0
      ? Math.round((meses.reduce((s, m) => s + m.ipc, 0) / meses.length) * 10) / 10
      : 0;
  const diasPromedio =
    meses.length > 0 ? Math.round(meses.reduce((s, m) => s + m.diasDemora, 0) / meses.length) : 0;

  return (
    <Document title={`Inflación — ${meta.periodo}`} author="Cóndor Salud">
      <Page size="A4" style={styles.page}>
        <ReportHeader title="Tracker de Inflación" meta={meta} />

        {/* Summary KPIs */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Pérdida Total</Text>
            <Text style={{ ...styles.kpiValue, color: COLORS.red }}>{fmtARS(totalPerdida)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>IPC Promedio Mensual</Text>
            <Text style={styles.kpiValue}>{ipcPromedio}%</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Días Demora Promedio</Text>
            <Text style={styles.kpiValue}>{diasPromedio}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Pérdida por Día Demora</Text>
            <Text style={styles.kpiValue}>0.11%</Text>
          </View>
        </View>

        {/* Monthly table */}
        <Text style={styles.sectionTitle}>Detalle Mensual ({meses.length} meses)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderCell, width: "15%" }}>Mes</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "10%", textAlign: "right" }}>IPC</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "18%", textAlign: "right" }}>
              Facturado
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "18%", textAlign: "right" }}>
              Cobrado
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "10%", textAlign: "center" }}>
              Días
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "18%", textAlign: "right" }}>
              Pérdida
            </Text>
            <Text style={{ ...styles.tableHeaderCell, width: "11%", textAlign: "right" }}>
              % Pérdida
            </Text>
          </View>
          {meses.map((m, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={{ ...styles.tableCellBold, width: "15%" }}>{m.mes}</Text>
              <Text style={{ ...styles.tableCellMuted, width: "10%", textAlign: "right" }}>
                {m.ipc}%
              </Text>
              <Text style={{ ...styles.tableCell, width: "18%", textAlign: "right" }}>
                {fmtARS(m.facturado)}
              </Text>
              <Text style={{ ...styles.tableCell, width: "18%", textAlign: "right" }}>
                {fmtARS(m.cobrado)}
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  width: "10%",
                  textAlign: "center",
                  color: m.diasDemora > 50 ? COLORS.red : COLORS.ink,
                }}
              >
                {m.diasDemora}
              </Text>
              <Text
                style={{
                  ...styles.tableCellBold,
                  width: "18%",
                  textAlign: "right",
                  color: COLORS.red,
                }}
              >
                {fmtARS(m.perdidaReal)}
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  width: "11%",
                  textAlign: "right",
                  color: m.perdidaPorcentaje > 8 ? COLORS.red : COLORS.ink,
                }}
              >
                {m.perdidaPorcentaje}%
              </Text>
            </View>
          ))}
        </View>

        {/* Per-financiador impact */}
        {financiadoresInflacion.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Impacto por Financiador</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.tableHeaderCell, width: "25%" }}>Financiador</Text>
                <Text style={{ ...styles.tableHeaderCell, width: "15%", textAlign: "center" }}>
                  Días Prom.
                </Text>
                <Text style={{ ...styles.tableHeaderCell, width: "15%", textAlign: "center" }}>
                  Pérd./Día
                </Text>
                <Text style={{ ...styles.tableHeaderCell, width: "15%", textAlign: "center" }}>
                  Pérdida %
                </Text>
                <Text style={{ ...styles.tableHeaderCell, width: "15%", textAlign: "right" }}>
                  Monto Afect.
                </Text>
                <Text style={{ ...styles.tableHeaderCell, width: "15%", textAlign: "right" }}>
                  Pérd. Est.
                </Text>
              </View>
              {financiadoresInflacion.map((f, i) => {
                const perdidaEstimada = Math.round(f.montoAfectado * (f.perdidaTotal / 100));
                return (
                  <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                    <Text style={{ ...styles.tableCellBold, width: "25%" }}>{f.name}</Text>
                    <Text
                      style={{
                        ...styles.tableCell,
                        width: "15%",
                        textAlign: "center",
                        color: f.diasPromedio > 60 ? COLORS.red : COLORS.ink,
                      }}
                    >
                      {f.diasPromedio}
                    </Text>
                    <Text style={{ ...styles.tableCellMuted, width: "15%", textAlign: "center" }}>
                      {f.perdidaPorDia}%
                    </Text>
                    <Text
                      style={{
                        ...styles.tableCell,
                        width: "15%",
                        textAlign: "center",
                        color: f.perdidaTotal > 7 ? COLORS.red : COLORS.ink,
                      }}
                    >
                      {f.perdidaTotal}%
                    </Text>
                    <Text style={{ ...styles.tableCell, width: "15%", textAlign: "right" }}>
                      {fmtARS(f.montoAfectado)}
                    </Text>
                    <Text
                      style={{
                        ...styles.tableCellBold,
                        width: "15%",
                        textAlign: "right",
                        color: COLORS.red,
                      }}
                    >
                      {fmtARS(perdidaEstimada)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Fórmula de Cálculo</Text>
          <Text style={{ ...styles.tableCell, lineHeight: 1.6 }}>
            Pérdida = Monto × (IPC_mensual / 30) × días_demora. La inflación erosiona el valor real
            de los cobros mientras se acumulan días entre presentación y pago efectivo.
          </Text>
        </View>

        <ReportFooter />
      </Page>
    </Document>
  );
}

// ─── 6. Agenda PDF ───────────────────────────────────────────
function AgendaPDFDocument({
  turnos,
  meta,
}: {
  turnos: {
    hora: string;
    paciente: string;
    tipo: string;
    financiador: string;
    profesional: string;
    estado: string;
  }[];
  meta: ReportMeta;
}) {
  const total = turnos.length;
  const confirmados = turnos.filter((t) => t.estado === "confirmado").length;
  const pendientes = turnos.filter((t) => t.estado === "pendiente").length;
  const atendidos = turnos.filter((t) => t.estado === "atendido").length;
  const cancelados = turnos.filter((t) => t.estado === "cancelado").length;

  // Group by profesional
  const byProfesional: Record<string, number> = {};
  turnos.forEach((t) => {
    byProfesional[t.profesional] = (byProfesional[t.profesional] || 0) + 1;
  });

  return (
    <Document title={`Agenda — ${meta.periodo}`} author="Cóndor Salud">
      <Page size="A4" style={styles.page}>
        <ReportHeader title="Reporte de Agenda" meta={meta} />

        {/* Summary KPIs */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Turnos</Text>
            <Text style={styles.kpiValue}>{total}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Confirmados</Text>
            <Text style={{ ...styles.kpiValue, color: COLORS.green }}>{confirmados}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Pendientes</Text>
            <Text style={{ ...styles.kpiValue, color: COLORS.gold }}>{pendientes}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Atendidos</Text>
            <Text style={styles.kpiValue}>{atendidos}</Text>
            <Text style={{ ...styles.kpiChange, color: COLORS.red }}>Cancelados: {cancelados}</Text>
          </View>
        </View>

        {/* By profesional */}
        {Object.keys(byProfesional).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Turnos por Profesional</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.tableHeaderCell, width: "60%" }}>Profesional</Text>
                <Text style={{ ...styles.tableHeaderCell, width: "20%", textAlign: "center" }}>
                  Turnos
                </Text>
                <Text style={{ ...styles.tableHeaderCell, width: "20%", textAlign: "right" }}>
                  % del Total
                </Text>
              </View>
              {Object.entries(byProfesional)
                .sort((a, b) => b[1] - a[1])
                .map(([prof, count], i) => (
                  <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                    <Text style={{ ...styles.tableCellBold, width: "60%" }}>{prof}</Text>
                    <Text style={{ ...styles.tableCellBold, width: "20%", textAlign: "center" }}>
                      {count}
                    </Text>
                    <Text style={{ ...styles.tableCellMuted, width: "20%", textAlign: "right" }}>
                      {total > 0 ? ((count / total) * 100).toFixed(1) : 0}%
                    </Text>
                  </View>
                ))}
            </View>
          </>
        )}

        {/* Detail table */}
        <Text style={styles.sectionTitle}>Detalle de Turnos ({turnos.length})</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderCell, width: "10%" }}>Hora</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "20%" }}>Paciente</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "18%" }}>Tipo</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "15%" }}>Financiador</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "22%" }}>Profesional</Text>
            <Text style={{ ...styles.tableHeaderCell, width: "15%", textAlign: "center" }}>
              Estado
            </Text>
          </View>
          {turnos.map((t, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={{ ...styles.tableCellBold, width: "10%" }}>{t.hora}</Text>
              <Text style={{ ...styles.tableCell, width: "20%" }}>{t.paciente}</Text>
              <Text style={{ ...styles.tableCellMuted, width: "18%" }}>{t.tipo}</Text>
              <Text style={{ ...styles.tableCell, width: "15%" }}>{t.financiador}</Text>
              <Text style={{ ...styles.tableCell, width: "22%" }}>{t.profesional}</Text>
              <Text
                style={{
                  ...styles.tableCell,
                  width: "15%",
                  textAlign: "center",
                  color:
                    t.estado === "confirmado"
                      ? COLORS.green
                      : t.estado === "pendiente"
                        ? COLORS.gold
                        : t.estado === "cancelado"
                          ? COLORS.red
                          : COLORS.inkLight,
                }}
              >
                {t.estado.charAt(0).toUpperCase() + t.estado.slice(1)}
              </Text>
            </View>
          ))}
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

export async function renderFinanciadoresPDF(
  financiadores: {
    name: string;
    type: string;
    facturado: number;
    cobrado: number;
    tasaRechazo: number;
    diasPromedioPago: number;
    facturasPendientes: number;
  }[],
  meta: ReportMeta,
): Promise<NodeJS.ReadableStream> {
  return renderToStream(<FinanciadoresPDFDocument financiadores={financiadores} meta={meta} />);
}

export async function renderInflacionPDF(
  meses: {
    mes: string;
    ipc: number;
    facturado: number;
    cobrado: number;
    diasDemora: number;
    perdidaReal: number;
    perdidaPorcentaje: number;
  }[],
  financiadoresInflacion: {
    name: string;
    diasPromedio: number;
    perdidaPorDia: number;
    perdidaTotal: number;
    montoAfectado: number;
  }[],
  meta: ReportMeta,
): Promise<NodeJS.ReadableStream> {
  return renderToStream(
    <InflacionPDFDocument
      meses={meses}
      financiadoresInflacion={financiadoresInflacion}
      meta={meta}
    />,
  );
}

export async function renderAgendaPDF(
  turnos: {
    hora: string;
    paciente: string;
    tipo: string;
    financiador: string;
    profesional: string;
    estado: string;
  }[],
  meta: ReportMeta,
): Promise<NodeJS.ReadableStream> {
  return renderToStream(<AgendaPDFDocument turnos={turnos} meta={meta} />);
}
