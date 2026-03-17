import { describe, it, expect } from "vitest";
import {
  completeOnboarding,
  saveOnboardingProgress,
  getOnboardingStatus,
} from "@/lib/services/onboarding";

describe("onboarding service (demo mode)", () => {
  describe("completeOnboarding", () => {
    it("returns success in demo mode", async () => {
      const result = await completeOnboarding({
        nombre: "Clínica San Martín",
        email: "admin@clinica.com",
      });
      expect(result.success).toBe(true);
      expect(result.clinicId).toBe("demo-clinic-001");
      expect(result.error).toBeUndefined();
    });

    it("works with minimal input", async () => {
      const result = await completeOnboarding({ nombre: "Test" });
      expect(result.success).toBe(true);
    });

    it("works with full input", async () => {
      const result = await completeOnboarding({
        nombre: "Clínica Completa",
        direccion: "Av. Corrientes 1234",
        telefono: "+5411555555",
        email: "info@clinica.com",
        especialidades: ["Cardiología", "Pediatría"],
        cantidadProfesionales: 5,
        sistemaAnterior: "Excel",
        logoUrl: "https://example.com/logo.png",
        plan: "profesional",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("saveOnboardingProgress", () => {
    it("does not throw in demo mode", async () => {
      await expect(saveOnboardingProgress(2)).resolves.toBeUndefined();
    });

    it("handles step 0", async () => {
      await expect(saveOnboardingProgress(0)).resolves.toBeUndefined();
    });
  });

  describe("getOnboardingStatus", () => {
    it("returns not completed in demo mode", async () => {
      const status = await getOnboardingStatus();
      expect(status).toEqual({ completed: false, step: 0 });
    });

    it("step is a number", async () => {
      const status = await getOnboardingStatus();
      expect(typeof status.step).toBe("number");
    });
  });
});
