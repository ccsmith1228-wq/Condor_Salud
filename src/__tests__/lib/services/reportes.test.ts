import { describe, it, expect } from "vitest";
import {
  getReportesList,
  getReporteById,
  getReportesStats,
  getReportesCategorias,
  markReporteGenerated,
} from "@/lib/services/reportes";

describe("reportes service (demo mode)", () => {
  describe("getReportesList", () => {
    it("returns all reportes without filter", async () => {
      const items = await getReportesList();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it("each reporte has required properties", async () => {
      const items = await getReportesList();
      for (const r of items) {
        expect(r).toHaveProperty("id");
        expect(r).toHaveProperty("nombre");
        expect(r).toHaveProperty("categoria");
        expect(r).toHaveProperty("descripcion");
        expect(r).toHaveProperty("frecuencia");
        expect(r).toHaveProperty("formato");
        expect(r).toHaveProperty("ultimaGeneracion");
      }
    });

    it("filters by categoria", async () => {
      const items = await getReportesList({ categoria: "Finanzas" });
      expect(items.length).toBeGreaterThan(0);
      expect(items.every((r) => r.categoria === "Finanzas")).toBe(true);
    });

    it("'Todos' returns all", async () => {
      const all = await getReportesList();
      const withTodos = await getReportesList({ categoria: "Todos" });
      expect(withTodos.length).toBe(all.length);
    });

    it("filters by search (nombre)", async () => {
      const items = await getReportesList({ search: "Facturación" });
      expect(items.length).toBeGreaterThan(0);
    });

    it("filters by search (descripcion)", async () => {
      const items = await getReportesList({ search: "rechaz" });
      expect(items.length).toBeGreaterThan(0);
    });

    it("search is case-insensitive", async () => {
      const items = await getReportesList({ search: "facturación" });
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe("getReporteById", () => {
    it("returns reporte for valid id", async () => {
      const found = await getReporteById("R01");
      expect(found).not.toBeNull();
      expect(found?.nombre).toContain("Facturación");
    });

    it("returns null for unknown id", async () => {
      const result = await getReporteById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("getReportesStats", () => {
    it("returns all stat fields", async () => {
      const stats = await getReportesStats();
      expect(stats).toHaveProperty("totalReportes");
      expect(stats).toHaveProperty("categorias");
      expect(stats).toHaveProperty("generadosEsteMes");
    });

    it("totalReportes matches list", async () => {
      const stats = await getReportesStats();
      const items = await getReportesList();
      expect(stats.totalReportes).toBe(items.length);
    });

    it("categorias is positive", async () => {
      const stats = await getReportesStats();
      expect(stats.categorias).toBeGreaterThan(0);
    });
  });

  describe("getReportesCategorias", () => {
    it("returns sorted unique categories", async () => {
      const cats = await getReportesCategorias();
      expect(Array.isArray(cats)).toBe(true);
      expect(cats.length).toBeGreaterThan(0);
      for (let i = 1; i < cats.length; i++) {
        expect(cats[i] >= cats[i - 1]).toBe(true);
      }
    });

    it("contains known categories", async () => {
      const cats = await getReportesCategorias();
      expect(cats).toContain("Finanzas");
      expect(cats).toContain("Operativo");
    });
  });

  describe("write operations throw in demo mode", () => {
    it("markReporteGenerated throws", async () => {
      await expect(markReporteGenerated("R01")).rejects.toThrow("demo mode");
    });
  });
});
