import { describe, it, expect } from "vitest";
import {
  getNomencladorEntries,
  getNomencladorByCodigo,
  getNomencladorStats,
  getNomencladorCapitulos,
  updateNomencladorEntry,
} from "@/lib/services/nomenclador";

describe("nomenclador service (demo mode)", () => {
  describe("getNomencladorEntries", () => {
    it("returns all entries without filter", async () => {
      const items = await getNomencladorEntries();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it("each entry has required properties", async () => {
      const items = await getNomencladorEntries();
      for (const n of items) {
        expect(n).toHaveProperty("id");
        expect(n).toHaveProperty("codigo");
        expect(n).toHaveProperty("descripcion");
        expect(n).toHaveProperty("capitulo");
        expect(n).toHaveProperty("valorSSS");
        expect(n).toHaveProperty("valorPAMI");
        expect(n).toHaveProperty("valorOSDE");
        expect(n).toHaveProperty("vigente");
        expect(typeof n.vigente).toBe("boolean");
      }
    });

    it("filters by capitulo", async () => {
      const items = await getNomencladorEntries({ capitulo: "Consultas" });
      expect(items.length).toBeGreaterThan(0);
      expect(items.every((n) => n.capitulo === "Consultas")).toBe(true);
    });

    it("'Todos' capitulo returns all", async () => {
      const all = await getNomencladorEntries();
      const withTodos = await getNomencladorEntries({ capitulo: "Todos" });
      expect(withTodos.length).toBe(all.length);
    });

    it("filters by vigente", async () => {
      const vigentes = await getNomencladorEntries({ vigente: true });
      expect(vigentes.every((n) => n.vigente === true)).toBe(true);
    });

    it("filters by search (codigo)", async () => {
      const items = await getNomencladorEntries({ search: "420101" });
      expect(items.length).toBe(1);
      expect(items[0].codigo).toBe("420101");
    });

    it("filters by search (descripcion)", async () => {
      const items = await getNomencladorEntries({ search: "hemograma" });
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe("getNomencladorByCodigo", () => {
    it("returns entry for valid codigo", async () => {
      const found = await getNomencladorByCodigo("420101");
      expect(found).not.toBeNull();
      expect(found?.codigo).toBe("420101");
      expect(found?.descripcion).toContain("Consulta");
    });

    it("returns null for unknown codigo", async () => {
      const result = await getNomencladorByCodigo("999999");
      expect(result).toBeNull();
    });
  });

  describe("getNomencladorStats", () => {
    it("returns all stat fields", async () => {
      const stats = await getNomencladorStats();
      expect(stats).toHaveProperty("totalCodigos");
      expect(stats).toHaveProperty("vigentes");
      expect(stats).toHaveProperty("capitulos");
      expect(stats).toHaveProperty("ultimaActualizacion");
    });

    it("totalCodigos matches entries", async () => {
      const stats = await getNomencladorStats();
      const items = await getNomencladorEntries();
      expect(stats.totalCodigos).toBe(items.length);
    });

    it("vigentes count is valid", async () => {
      const stats = await getNomencladorStats();
      expect(stats.vigentes).toBeGreaterThan(0);
      expect(stats.vigentes).toBeLessThanOrEqual(stats.totalCodigos);
    });

    it("capitulos count is positive", async () => {
      const stats = await getNomencladorStats();
      expect(stats.capitulos).toBeGreaterThan(0);
    });
  });

  describe("getNomencladorCapitulos", () => {
    it("returns sorted unique capitulos", async () => {
      const caps = await getNomencladorCapitulos();
      expect(Array.isArray(caps)).toBe(true);
      expect(caps.length).toBeGreaterThan(0);
      // Verify sorted
      for (let i = 1; i < caps.length; i++) {
        expect(caps[i] >= caps[i - 1]).toBe(true);
      }
    });

    it("contains known capitulos", async () => {
      const caps = await getNomencladorCapitulos();
      expect(caps).toContain("Consultas");
      expect(caps).toContain("Laboratorio");
    });
  });

  describe("write operations throw in demo mode", () => {
    it("updateNomencladorEntry throws", async () => {
      await expect(updateNomencladorEntry("n1", { valorSSS: 99999 })).rejects.toThrow("demo mode");
    });
  });
});
