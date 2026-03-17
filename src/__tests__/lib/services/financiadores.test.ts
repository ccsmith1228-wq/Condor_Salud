import { describe, it, expect } from "vitest";
import {
  getFinanciadoresExtended,
  getFinanciadorById,
  getFinanciadorStats,
  updateFinanciador,
} from "@/lib/services/financiadores";

describe("financiadores service (demo mode)", () => {
  describe("getFinanciadoresExtended", () => {
    it("returns all financiadores without filter", async () => {
      const items = await getFinanciadoresExtended();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it("each financiador has required properties", async () => {
      const items = await getFinanciadoresExtended();
      for (const f of items) {
        expect(f).toHaveProperty("id");
        expect(f).toHaveProperty("name");
        expect(f).toHaveProperty("type");
        expect(f).toHaveProperty("facturado");
        expect(f).toHaveProperty("cobrado");
        expect(f).toHaveProperty("tasaRechazo");
        expect(f).toHaveProperty("diasPromedioPago");
        expect(f).toHaveProperty("contacto");
        expect(f).toHaveProperty("ultimaLiquidacion");
      }
    });

    it("filters by type", async () => {
      const prepagas = await getFinanciadoresExtended({ type: "prepaga" });
      expect(prepagas.every((f) => f.type === "prepaga")).toBe(true);
      expect(prepagas.length).toBeGreaterThan(0);
    });

    it("filters by search", async () => {
      const items = await getFinanciadoresExtended({ search: "PAMI" });
      expect(items.length).toBe(1);
      expect(items[0].name).toBe("PAMI");
    });

    it("search is case-insensitive", async () => {
      const items = await getFinanciadoresExtended({ search: "pami" });
      expect(items.length).toBe(1);
    });

    it("empty search returns all", async () => {
      const all = await getFinanciadoresExtended();
      const withSearch = await getFinanciadoresExtended({ search: "" });
      expect(withSearch.length).toBe(all.length);
    });
  });

  describe("getFinanciadorById", () => {
    it("returns financiador for valid id", async () => {
      const found = await getFinanciadorById("1");
      expect(found).not.toBeNull();
      expect(found?.name).toBe("PAMI");
    });

    it("returns null for unknown id", async () => {
      const result = await getFinanciadorById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("getFinanciadorStats", () => {
    it("returns all stat fields", async () => {
      const stats = await getFinanciadorStats();
      expect(stats).toHaveProperty("totalFacturado");
      expect(stats).toHaveProperty("totalCobrado");
      expect(stats).toHaveProperty("totalPendiente");
      expect(stats).toHaveProperty("diasPromedioGlobal");
      expect(stats).toHaveProperty("tasaRechazoGlobal");
    });

    it("stats values are numeric and positive", async () => {
      const stats = await getFinanciadorStats();
      expect(stats.totalFacturado).toBeGreaterThan(0);
      expect(stats.totalCobrado).toBeGreaterThan(0);
      expect(stats.totalPendiente).toBeGreaterThan(0);
      expect(stats.diasPromedioGlobal).toBeGreaterThan(0);
    });

    it("totalPendiente = totalFacturado - totalCobrado", async () => {
      const stats = await getFinanciadorStats();
      expect(stats.totalPendiente).toBe(stats.totalFacturado - stats.totalCobrado);
    });
  });

  describe("write operations throw in demo mode", () => {
    it("updateFinanciador throws", async () => {
      await expect(updateFinanciador("1", { contacto: "test@test.com" })).rejects.toThrow(
        "demo mode",
      );
    });
  });
});
