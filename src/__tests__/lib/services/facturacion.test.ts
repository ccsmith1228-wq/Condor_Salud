import { describe, it, expect } from "vitest";
import {
  getFacturasFiltered,
  getFacturaById,
  getFacturacionStats,
  createFactura,
  updateFactura,
} from "@/lib/services/facturacion";

describe("facturacion service (demo mode)", () => {
  describe("getFacturasFiltered", () => {
    it("returns all facturas without filter", async () => {
      const items = await getFacturasFiltered();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it("each factura has required properties", async () => {
      const items = await getFacturasFiltered();
      for (const f of items) {
        expect(f).toHaveProperty("id");
        expect(f).toHaveProperty("numero");
        expect(f).toHaveProperty("fecha");
        expect(f).toHaveProperty("financiador");
        expect(f).toHaveProperty("monto");
        expect(f).toHaveProperty("estado");
      }
    });

    it("filters by financiador", async () => {
      const all = await getFacturasFiltered();
      if (all.length === 0) return;
      const target = all[0].financiador;
      const filtered = await getFacturasFiltered({ financiador: target });
      expect(filtered.every((f) => f.financiador === target)).toBe(true);
    });

    it("'Todos' financiador returns all", async () => {
      const all = await getFacturasFiltered();
      const withTodos = await getFacturasFiltered({ financiador: "Todos" });
      expect(withTodos.length).toBe(all.length);
    });

    it("filters by estado", async () => {
      const all = await getFacturasFiltered();
      if (all.length === 0) return;
      const target = all[0].estado;
      const filtered = await getFacturasFiltered({ estado: target });
      expect(filtered.every((f) => f.estado === target)).toBe(true);
    });
  });

  describe("getFacturaById", () => {
    it("returns a factura for valid id", async () => {
      const all = await getFacturasFiltered();
      if (all.length === 0) return;
      const found = await getFacturaById(all[0].id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(all[0].id);
    });

    it("returns null for unknown id", async () => {
      const result = await getFacturaById("nonexistent-factura-xyz");
      expect(result).toBeNull();
    });
  });

  describe("getFacturacionStats", () => {
    it("returns all stat fields", async () => {
      const stats = await getFacturacionStats();
      expect(stats).toHaveProperty("totalFacturado");
      expect(stats).toHaveProperty("totalCobrado");
      expect(stats).toHaveProperty("totalRechazado");
      expect(stats).toHaveProperty("totalPendiente");
      expect(stats).toHaveProperty("cantidadFacturas");
      expect(stats).toHaveProperty("tasaCobro");
    });

    it("stats values are numeric", async () => {
      const stats = await getFacturacionStats();
      expect(typeof stats.totalFacturado).toBe("number");
      expect(typeof stats.totalCobrado).toBe("number");
      expect(typeof stats.tasaCobro).toBe("number");
      expect(stats.totalFacturado).toBeGreaterThan(0);
    });

    it("tasaCobro is between 0 and 100", async () => {
      const stats = await getFacturacionStats();
      expect(stats.tasaCobro).toBeGreaterThanOrEqual(0);
      expect(stats.tasaCobro).toBeLessThanOrEqual(100);
    });
  });

  describe("write operations throw in demo mode", () => {
    it("createFactura throws", async () => {
      await expect(
        createFactura({
          numero: "F-TEST-001",
          fecha: "2026-03-10",
          financiador: "PAMI",
          paciente: "Test",
          prestacion: "Consulta",
          monto: 1000,
        }),
      ).rejects.toThrow("demo mode");
    });

    it("updateFactura throws", async () => {
      await expect(updateFactura("test-id", { estado: "cobrada" })).rejects.toThrow("demo mode");
    });
  });
});
