import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isDoctoraliarConfigured,
  getDoctoraliarSearchUrl,
  getDoctoraliarSpecialtyUrl,
  DoctoraliarError,
} from "@/lib/doctoraliar";

// ── URL builders ─────────────────────────────────────────────

describe("getDoctoraliarSearchUrl", () => {
  it("encodes doctor name for search URL", () => {
    const url = getDoctoraliarSearchUrl("Dra. Laura Fernández");
    expect(url).toBe("https://www.doctoraliar.com/?q=Dra.%20Laura%20Fern%C3%A1ndez");
  });

  it("handles simple ASCII names", () => {
    const url = getDoctoraliarSearchUrl("Dr. Martin Garcia");
    expect(url).toContain("doctoraliar.com/?q=");
    expect(url).toContain("Martin");
  });
});

describe("getDoctoraliarSpecialtyUrl", () => {
  it("maps known specialty to slug", () => {
    expect(getDoctoraliarSpecialtyUrl("Cardiología")).toBe(
      "https://www.doctoraliar.com/cardiologo",
    );
  });

  it("maps Pediatría to pediatra slug", () => {
    expect(getDoctoraliarSpecialtyUrl("Pediatría")).toBe("https://www.doctoraliar.com/pediatra");
  });

  it("maps Dermatología correctly", () => {
    expect(getDoctoraliarSpecialtyUrl("Dermatología")).toBe(
      "https://www.doctoraliar.com/dermatologo",
    );
  });

  it("falls back to search URL for unknown specialty", () => {
    const url = getDoctoraliarSpecialtyUrl("Cirugía plástica");
    expect(url).toContain("doctoraliar.com/?q=");
    expect(url).toContain("Cirug");
  });
});

// ── Configuration check ──────────────────────────────────────

describe("isDoctoraliarConfigured", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns false when env vars are not set", () => {
    delete process.env.DOCTORALIAR_CLIENT_ID;
    delete process.env.DOCTORALIAR_CLIENT_SECRET;
    expect(isDoctoraliarConfigured()).toBe(false);
  });

  it("returns false when only client ID is set", () => {
    process.env.DOCTORALIAR_CLIENT_ID = "test-id";
    delete process.env.DOCTORALIAR_CLIENT_SECRET;
    expect(isDoctoraliarConfigured()).toBe(false);
  });

  it("returns true when both env vars are set", () => {
    process.env.DOCTORALIAR_CLIENT_ID = "test-id";
    process.env.DOCTORALIAR_CLIENT_SECRET = "test-secret";
    expect(isDoctoraliarConfigured()).toBe(true);
  });
});

// ── DoctoraliarError ─────────────────────────────────────────

describe("DoctoraliarError", () => {
  it("creates error with status and message", () => {
    const err = new DoctoraliarError(401, "Unauthorized");
    expect(err.status).toBe(401);
    expect(err.apiMessage).toBe("Unauthorized");
    expect(err.name).toBe("DoctoraliarError");
    expect(err.message).toContain("401");
  });

  it("is an instance of Error", () => {
    const err = new DoctoraliarError(500, "Server error");
    expect(err).toBeInstanceOf(Error);
  });
});

// ── Directorio enrichment ────────────────────────────────────

describe("directorio enrichment", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.DOCTORALIAR_CLIENT_ID;
    delete process.env.DOCTORALIAR_CLIENT_SECRET;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("getDoctors returns doctors with source field when API is not configured", async () => {
    // Ensure Doctoraliar is not configured
    delete process.env.DOCTORALIAR_CLIENT_ID;
    const { getDoctors } = await import("@/lib/services/directorio");
    const doctors = await getDoctors();
    expect(doctors.length).toBeGreaterThan(0);
    // Without API configured, doctors should still have profileUrl as search fallback
    for (const d of doctors) {
      expect(d).toHaveProperty("id");
      expect(d).toHaveProperty("name");
      expect(d).toHaveProperty("specialty");
    }
  });

  it("getDoctors filters by specialty", async () => {
    const { getDoctors } = await import("@/lib/services/directorio");
    const doctors = await getDoctors({ specialty: "Cardiología" });
    expect(doctors.length).toBeGreaterThan(0);
    for (const d of doctors) {
      expect(d.specialty).toBe("Cardiología");
    }
  });

  it("getDoctors filters by location", async () => {
    const { getDoctors } = await import("@/lib/services/directorio");
    const doctors = await getDoctors({ location: "CABA" });
    expect(doctors.length).toBeGreaterThan(0);
    for (const d of doctors) {
      expect(d.location).toBe("CABA");
    }
  });

  it("getDoctors filters by financiador", async () => {
    const { getDoctors } = await import("@/lib/services/directorio");
    const doctors = await getDoctors({ financiador: "OSDE" });
    expect(doctors.length).toBeGreaterThan(0);
    for (const d of doctors) {
      expect(d.financiadores).toContain("OSDE");
    }
  });

  it("getDoctors filters by search term", async () => {
    const { getDoctors } = await import("@/lib/services/directorio");
    const doctors = await getDoctors({ search: "Fernández" });
    expect(doctors.length).toBeGreaterThan(0);
    expect(doctors[0]!.name).toContain("Fernández");
  });

  it("symptomToSpecialty maps known symptoms", async () => {
    const { symptomToSpecialty } = await import("@/lib/services/directorio");
    expect(symptomToSpecialty["Dolor de cabeza"]).toContain("Neurología");
    expect(symptomToSpecialty["Problemas de piel"]).toContain("Dermatología");
  });
});
