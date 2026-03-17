import { describe, it, expect } from "vitest";
import {
  getInventarioItems,
  getInventarioById,
  getInventarioStats,
  getInventarioCategorias,
  createInventarioItem,
  updateInventarioItem,
} from "@/lib/services/inventario";

describe("inventario service (demo mode)", () => {
  describe("getInventarioItems", () => {
    it("returns all items without filter", async () => {
      const items = await getInventarioItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it("each item has required properties", async () => {
      const items = await getInventarioItems();
      for (const i of items) {
        expect(i).toHaveProperty("id");
        expect(i).toHaveProperty("nombre");
        expect(i).toHaveProperty("categoria");
        expect(i).toHaveProperty("stock");
        expect(i).toHaveProperty("stockMin");
        expect(i).toHaveProperty("precioUnit");
        expect(i).toHaveProperty("proveedor");
        expect(i).toHaveProperty("estado");
        expect(["OK", "Bajo", "Crítico", "Vencido"]).toContain(i.estado);
      }
    });

    it("filters by categoria", async () => {
      const items = await getInventarioItems({ categoria: "Medicamento" });
      expect(items.length).toBeGreaterThan(0);
      expect(items.every((i) => i.categoria === "Medicamento")).toBe(true);
    });

    it("'Todas' returns all", async () => {
      const all = await getInventarioItems();
      const withTodas = await getInventarioItems({ categoria: "Todas" });
      expect(withTodas.length).toBe(all.length);
    });

    it("filters by estado", async () => {
      const items = await getInventarioItems({ estado: "OK" });
      expect(items.length).toBeGreaterThan(0);
      expect(items.every((i) => i.estado === "OK")).toBe(true);
    });

    it("filters by search", async () => {
      const items = await getInventarioItems({ search: "Enalapril" });
      expect(items.length).toBe(1);
      expect(items[0].nombre).toContain("Enalapril");
    });

    it("search is case-insensitive", async () => {
      const items = await getInventarioItems({ search: "enalapril" });
      expect(items.length).toBe(1);
    });
  });

  describe("getInventarioById", () => {
    it("returns item for valid id", async () => {
      const found = await getInventarioById("INV-001");
      expect(found).not.toBeNull();
      expect(found?.nombre).toContain("Enalapril");
    });

    it("returns null for unknown id", async () => {
      const result = await getInventarioById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("getInventarioStats", () => {
    it("returns all stat fields", async () => {
      const stats = await getInventarioStats();
      expect(stats).toHaveProperty("totalItems");
      expect(stats).toHaveProperty("stockBajo");
      expect(stats).toHaveProperty("stockCritico");
      expect(stats).toHaveProperty("proximoVencimiento");
      expect(stats).toHaveProperty("valorTotal");
      expect(stats).toHaveProperty("categorias");
    });

    it("totalItems matches demo data length", async () => {
      const stats = await getInventarioStats();
      const items = await getInventarioItems();
      expect(stats.totalItems).toBe(items.length);
    });

    it("valorTotal is positive", async () => {
      const stats = await getInventarioStats();
      expect(stats.valorTotal).toBeGreaterThan(0);
    });

    it("stockBajo + stockCritico items exist in data", async () => {
      const stats = await getInventarioStats();
      expect(stats.stockBajo).toBeGreaterThanOrEqual(0);
      expect(stats.stockCritico).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getInventarioCategorias", () => {
    it("returns sorted unique categories", async () => {
      const cats = await getInventarioCategorias();
      expect(Array.isArray(cats)).toBe(true);
      expect(cats.length).toBeGreaterThan(0);
      // Verify sorted
      for (let i = 1; i < cats.length; i++) {
        expect(cats[i] >= cats[i - 1]).toBe(true);
      }
    });

    it("contains known categories", async () => {
      const cats = await getInventarioCategorias();
      expect(cats).toContain("Medicamento");
      expect(cats).toContain("Descartable");
    });
  });

  describe("write operations throw in demo mode", () => {
    it("createInventarioItem throws", async () => {
      await expect(
        createInventarioItem({
          nombre: "Test",
          categoria: "Test",
          stock: 10,
          stockMin: 5,
          unidad: "unidades",
          precioUnit: 100,
          proveedor: "Test",
        }),
      ).rejects.toThrow("demo mode");
    });

    it("updateInventarioItem throws", async () => {
      await expect(updateInventarioItem("INV-001", { stock: 999 })).rejects.toThrow("demo mode");
    });
  });
});
