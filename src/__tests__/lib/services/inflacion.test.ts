import { describe, it, expect } from "vitest";
import {
  getInflacionMensual,
  getFinanciadoresInflacion,
  getInflacionStats,
} from "@/lib/services/inflacion";

describe("inflacion service (demo mode)", () => {
  describe("getInflacionMensual", () => {
    it("returns 6 months by default", async () => {
      const items = await getInflacionMensual();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(6);
    });

    it("returns 3 months with 3m filter", async () => {
      const items = await getInflacionMensual({ period: "3m" });
      expect(items.length).toBe(3);
    });

    it("each month has required properties", async () => {
      const items = await getInflacionMensual();
      for (const m of items) {
        expect(m).toHaveProperty("mes");
        expect(m).toHaveProperty("ipc");
        expect(m).toHaveProperty("facturado");
        expect(m).toHaveProperty("cobrado");
        expect(m).toHaveProperty("diasDemora");
        expect(m).toHaveProperty("perdidaReal");
        expect(m).toHaveProperty("perdidaPorcentaje");
      }
    });

    it("ipc values are positive", async () => {
      const items = await getInflacionMensual();
      for (const m of items) {
        expect(m.ipc).toBeGreaterThan(0);
      }
    });

    it("facturado > cobrado for each month", async () => {
      const items = await getInflacionMensual();
      for (const m of items) {
        expect(m.facturado).toBeGreaterThan(m.cobrado);
      }
    });
  });

  describe("getFinanciadoresInflacion", () => {
    it("returns all financiadores without filter", async () => {
      const items = await getFinanciadoresInflacion();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it("each entry has required properties", async () => {
      const items = await getFinanciadoresInflacion();
      for (const f of items) {
        expect(f).toHaveProperty("name");
        expect(f).toHaveProperty("diasPromedio");
        expect(f).toHaveProperty("perdidaPorDia");
        expect(f).toHaveProperty("perdidaTotal");
        expect(f).toHaveProperty("montoAfectado");
      }
    });

    it("filters by financiador name", async () => {
      const items = await getFinanciadoresInflacion("PAMI");
      expect(items.length).toBe(1);
      expect(items[0].name).toBe("PAMI");
    });

    it("'Todos' returns all", async () => {
      const all = await getFinanciadoresInflacion();
      const withTodos = await getFinanciadoresInflacion("Todos");
      expect(withTodos.length).toBe(all.length);
    });
  });

  describe("getInflacionStats", () => {
    it("returns all stat fields", async () => {
      const stats = await getInflacionStats();
      expect(stats).toHaveProperty("perdidaAcumulada");
      expect(stats).toHaveProperty("ipcPromedio");
      expect(stats).toHaveProperty("diasDemoraPromedio");
      expect(stats).toHaveProperty("tendencia");
    });

    it("tendencia is a valid value", async () => {
      const stats = await getInflacionStats();
      expect(["mejorando", "empeorando", "estable"]).toContain(stats.tendencia);
    });

    it("numeric values are positive", async () => {
      const stats = await getInflacionStats();
      expect(stats.perdidaAcumulada).toBeGreaterThan(0);
      expect(stats.ipcPromedio).toBeGreaterThan(0);
      expect(stats.diasDemoraPromedio).toBeGreaterThan(0);
    });
  });
});
