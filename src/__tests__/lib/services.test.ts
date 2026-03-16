import { describe, it, expect } from "vitest";
import {
  getPacientes,
  getFacturas,
  getRechazos,
  getFinanciadores,
  getInflacion,
  getAlertas,
  getTurnos,
  getInventario,
  getNomenclador,
  getReportes,
  getAuditoria,
  getDashboardKPIs,
  getFacturacionKPIs,
  getRechazosKPIs,
  getPacientesKPIs,
  getAgendaKPIs,
  getInventarioKPIs,
} from "@/lib/services/data";

describe("Data service functions", () => {
  it("getPacientes returns array of patients", async () => {
    const result = await getPacientes();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("nombre");
    expect(result[0]).toHaveProperty("dni");
    expect(result[0]).toHaveProperty("financiador");
    expect(result[0]).toHaveProperty("estado");
  });

  it("getFacturas returns array of invoices", async () => {
    const result = await getFacturas();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("numero");
    expect(result[0]).toHaveProperty("monto");
    expect(result[0]).toHaveProperty("estado");
  });

  it("getRechazos returns array of rejections", async () => {
    const result = await getRechazos();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("motivo");
    expect(result[0]).toHaveProperty("reprocesable");
  });

  it("getFinanciadores returns array of financiadores", async () => {
    const result = await getFinanciadores();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("facturado");
    expect(result[0]).toHaveProperty("tasaRechazo");
  });

  it("getInflacion returns monthly data", async () => {
    const result = await getInflacion();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("mes");
    expect(result[0]).toHaveProperty("ipc");
    expect(result[0]).toHaveProperty("perdidaReal");
  });

  it("getAlertas returns array of alerts", async () => {
    const result = await getAlertas();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("titulo");
    expect(result[0]).toHaveProperty("tipo");
  });

  it("getTurnos returns array of appointments", async () => {
    const result = await getTurnos();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("hora");
    expect(result[0]).toHaveProperty("paciente");
    expect(result[0]).toHaveProperty("estado");
  });

  it("getInventario returns array of items", async () => {
    const result = await getInventario();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("nombre");
    expect(result[0]).toHaveProperty("stock");
    expect(result[0]).toHaveProperty("minimo");
  });

  it("getNomenclador returns array of codes", async () => {
    const result = await getNomenclador();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("codigo");
    expect(result[0]).toHaveProperty("descripcion");
  });

  it("getReportes returns array of reports", async () => {
    const result = await getReportes();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("nombre");
    expect(result[0]).toHaveProperty("categoria");
  });

  it("getAuditoria returns array of audit items", async () => {
    const result = await getAuditoria();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("severidad");
    expect(result[0]).toHaveProperty("estado");
  });

  it("getPaciente returns single patient by id", async () => {
    const { getPaciente } = await import("@/lib/services/data");
    const result = await getPaciente("p1");
    expect(result).not.toBeNull();
    expect(result?.nombre).toBe("María García");
  });

  it("getPaciente returns null for unknown id", async () => {
    const { getPaciente } = await import("@/lib/services/data");
    const result = await getPaciente("unknown");
    expect(result).toBeNull();
  });
});

describe("KPI builder functions", () => {
  it("getDashboardKPIs returns 4 KPIs", async () => {
    const kpis = await getDashboardKPIs();
    expect(kpis).toHaveLength(4);
    kpis.forEach((kpi) => {
      expect(kpi).toHaveProperty("label");
      expect(kpi).toHaveProperty("value");
      expect(kpi).toHaveProperty("change");
      expect(typeof kpi.up).toBe("boolean");
    });
  });

  it("getFacturacionKPIs returns 4 KPIs", async () => {
    expect(await getFacturacionKPIs()).toHaveLength(4);
  });

  it("getRechazosKPIs returns 4 KPIs", async () => {
    expect(await getRechazosKPIs()).toHaveLength(4);
  });

  it("getPacientesKPIs returns 4 KPIs", async () => {
    expect(await getPacientesKPIs()).toHaveLength(4);
  });

  it("getAgendaKPIs returns 4 KPIs", async () => {
    expect(await getAgendaKPIs()).toHaveLength(4);
  });

  it("getInventarioKPIs returns 4 KPIs", async () => {
    expect(await getInventarioKPIs()).toHaveLength(4);
  });
});
