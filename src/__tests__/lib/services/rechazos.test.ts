import { describe, it, expect } from "vitest";
import {
  getRechazosFiltered,
  getRechazoById,
  getRechazoStats,
  reprocesarRechazo,
  descartarRechazo,
} from "@/lib/services/rechazos";

describe("rechazos service (demo mode)", () => {
  describe("getRechazosFiltered", () => {
    it("returns all rechazos without filter", async () => {
      const items = await getRechazosFiltered();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it("each rechazo has required properties", async () => {
      const items = await getRechazosFiltered();
      for (const r of items) {
        expect(r).toHaveProperty("id");
        expect(r).toHaveProperty("motivo");
        expect(r).toHaveProperty("monto");
        expect(r).toHaveProperty("estado");
        expect(r).toHaveProperty("financiador");
        expect(typeof r.reprocesable).toBe("boolean");
      }
    });

    it("filters by financiador", async () => {
      const all = await getRechazosFiltered();
      if (all.length === 0) return;
      const target = all[0].financiador;
      const filtered = await getRechazosFiltered({ financiador: target });
      expect(filtered.every((r) => r.financiador === target)).toBe(true);
    });

    it("'Todos' financiador returns all", async () => {
      const all = await getRechazosFiltered();
      const withTodos = await getRechazosFiltered({ financiador: "Todos" });
      expect(withTodos.length).toBe(all.length);
    });

    it("filters by estado", async () => {
      const all = await getRechazosFiltered();
      if (all.length === 0) return;
      const target = all[0].estado;
      const filtered = await getRechazosFiltered({ estado: target });
      expect(filtered.every((r) => r.estado === target)).toBe(true);
    });

    it("filters by motivo", async () => {
      const all = await getRechazosFiltered();
      if (all.length === 0) return;
      const target = all[0].motivo;
      const filtered = await getRechazosFiltered({ motivo: target });
      expect(filtered.every((r) => r.motivo === target)).toBe(true);
    });
  });

  describe("getRechazoById", () => {
    it("returns rechazo for valid id", async () => {
      const all = await getRechazosFiltered();
      if (all.length === 0) return;
      const found = await getRechazoById(all[0].id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(all[0].id);
    });

    it("returns null for unknown id", async () => {
      const result = await getRechazoById("nonexistent-rechazo-xyz");
      expect(result).toBeNull();
    });
  });

  describe("getRechazoStats", () => {
    it("returns all stat fields", async () => {
      const stats = await getRechazoStats();
      expect(stats).toHaveProperty("totalRechazado");
      expect(stats).toHaveProperty("pendientes");
      expect(stats).toHaveProperty("reprocesados");
      expect(stats).toHaveProperty("reprocesables");
      expect(stats).toHaveProperty("tasaRecupero");
      expect(stats).toHaveProperty("motivoCounts");
    });

    it("stats values are numeric", async () => {
      const stats = await getRechazoStats();
      expect(typeof stats.totalRechazado).toBe("number");
      expect(typeof stats.pendientes).toBe("number");
      expect(typeof stats.tasaRecupero).toBe("number");
    });

    it("motivoCounts is an object", async () => {
      const stats = await getRechazoStats();
      expect(typeof stats.motivoCounts).toBe("object");
      expect(Object.keys(stats.motivoCounts).length).toBeGreaterThan(0);
    });
  });

  describe("write operations throw in demo mode", () => {
    it("reprocesarRechazo throws", async () => {
      await expect(reprocesarRechazo({ rechazoId: "test" })).rejects.toThrow("demo mode");
    });

    it("descartarRechazo throws", async () => {
      await expect(descartarRechazo("test")).rejects.toThrow("demo mode");
    });
  });
});
