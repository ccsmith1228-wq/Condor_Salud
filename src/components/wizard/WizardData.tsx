"use client";

import { useState, useCallback, createContext, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Building2, UserCircle, Settings, CreditCard, CheckCircle2 } from "lucide-react";
import type { PlanTier } from "@/lib/types";

// ─── Icon map ────────────────────────────────────────────────

export const WIZARD_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  clinica: Building2,
  profesional: UserCircle,
  configuracion: Settings,
  plan: CreditCard,
  confirmacion: CheckCircle2,
};

// ─── Step definition ─────────────────────────────────────────

export interface SetupStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  requiredFields?: string[];
}

export const WIZARD_STEPS: SetupStep[] = [
  {
    id: "clinica",
    icon: "clinica",
    title: "Datos de la clínica",
    subtitle: "Paso 1 de 5",
    requiredFields: ["nombre"],
  },
  {
    id: "profesional",
    icon: "profesional",
    title: "Perfil profesional",
    subtitle: "Paso 2 de 5",
    requiredFields: ["doctorNombre", "doctorMatricula"],
  },
  {
    id: "configuracion",
    icon: "configuracion",
    title: "Especialidades y cobertura",
    subtitle: "Paso 3 de 5",
  },
  {
    id: "plan",
    icon: "plan",
    title: "Elegí tu plan",
    subtitle: "Paso 4 de 5",
    requiredFields: ["planTier"],
  },
  {
    id: "confirmacion",
    icon: "confirmacion",
    title: "Confirmar y activar",
    subtitle: "Paso 5 de 5",
  },
];

// ─── Clinic plan tiers (from BRANDKIT §11) ───────────────────

export interface ClinicPlanOption {
  id: PlanTier;
  name: string;
  price: string; // Display string (Argentine format)
  priceNum: number; // Numeric (ARS/mes)
  description: string;
  features: string[];
  highlighted?: boolean; // Growth is the featured tier
}

export const CLINIC_PLAN_OPTIONS: ClinicPlanOption[] = [
  {
    id: "basic",
    name: "Consultorio",
    price: "$50 USD",
    priceNum: 60_000,
    description: "Para consultorios individuales.",
    features: ["1 profesional incluido", "Agenda de turnos", "Gestión de pacientes", "1 sede"],
  },
  {
    id: "plus",
    name: "Multi Consultorio",
    price: "$120 USD",
    priceNum: 144_000,
    description: "Para clínicas con múltiples especialidades.",
    features: [
      "Hasta 5 profesionales incluidos",
      "Facturación electrónica",
      "Verificación de cobertura",
      "Hasta 3 sedes",
      "Reportes avanzados",
      "Telemedicina integrada",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Centro Médico",
    price: "$180 USD",
    priceNum: 216_000,
    description: "Para centros médicos grandes y policlínicos.",
    features: [
      "Hasta 20 profesionales incluidos",
      "Todo de Multi Consultorio",
      "Multi-sucursal consolidado",
      "Integraciones a medida",
      "SLA garantizado",
      "Customer Success dedicado",
    ],
  },
];

// ─── Form Data ───────────────────────────────────────────────

export interface OnboardingFormData {
  // Step 1: Clinic
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  // Step 2: Doctor profile
  doctorNombre: string;
  doctorMatricula: string;
  doctorEspecialidad: string;
  // Step 3: Configuration
  especialidades: string[];
  financiadores: string[];
  // Step 4: Plan
  planTier: PlanTier | "";
}

const DEFAULT_FORM: OnboardingFormData = {
  nombre: "",
  direccion: "",
  telefono: "",
  email: "",
  doctorNombre: "",
  doctorMatricula: "",
  doctorEspecialidad: "",
  especialidades: [],
  financiadores: [],
  planTier: "",
};

// ─── Options ─────────────────────────────────────────────────

export const ESPECIALIDADES_OPTIONS = [
  "Cardiología",
  "Clínica médica",
  "Dermatología",
  "Endocrinología",
  "Gastroenterología",
  "Ginecología",
  "Neurología",
  "Oftalmología",
  "Pediatría",
  "Traumatología",
  "Urología",
  "Cirugía general",
  "Kinesiología",
  "Nutrición",
  "Psicología",
  "Psiquiatría",
];

export const FINANCIADORES_OPTIONS = [
  "PAMI",
  "OSDE",
  "Swiss Medical",
  "IOMA",
  "Galeno",
  "Medifé",
  "Sancor Salud",
  "Unión Personal",
  "OSECAC",
  "OSPIP",
  "Particular",
];

// ─── Context ─────────────────────────────────────────────────

interface WizardContextType {
  currentStep: number;
  totalSteps: number;
  step: SetupStep;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  canNext: boolean;
  canPrev: boolean;
  progress: number;
  completedSteps: Set<number>;
  formData: OnboardingFormData;
  updateForm: (patch: Partial<OnboardingFormData>) => void;
  completeSetup: () => Promise<void>;
  isSubmitting: boolean;
  setupError: string | null;
  validationError: string | null;
  validateCurrentStep: () => boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<OnboardingFormData>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();

  const totalSteps = WIZARD_STEPS.length;
  const step = WIZARD_STEPS[currentStep] ?? WIZARD_STEPS[0]!;
  const canNext = currentStep < totalSteps - 1;
  const canPrev = currentStep > 0;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateForm = useCallback((patch: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    setValidationError(null);
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    const s = WIZARD_STEPS[currentStep];
    if (!s?.requiredFields?.length) return true;

    for (const field of s.requiredFields) {
      const val = formData[field as keyof OnboardingFormData];
      if (!val || (typeof val === "string" && !val.trim())) {
        const labels: Record<string, string> = {
          nombre: "nombre de la clínica",
          doctorNombre: "nombre del profesional",
          doctorMatricula: "número de matrícula",
          planTier: "plan",
        };
        setValidationError(`Completá el campo "${labels[field] || field}" para continuar.`);
        return false;
      }
    }
    setValidationError(null);
    return true;
  }, [currentStep, formData]);

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSteps) {
        if (index > currentStep && !validateCurrentStep()) return;
        setCompletedSteps((prev) => new Set([...Array.from(prev), currentStep]));
        setCurrentStep(index);
      }
    },
    [currentStep, totalSteps, validateCurrentStep],
  );

  const next = useCallback(() => {
    if (!canNext || !validateCurrentStep()) return;
    setCompletedSteps((prev) => new Set([...Array.from(prev), currentStep]));
    setCurrentStep((s) => s + 1);

    // Save progress (non-blocking)
    import("@/lib/services/onboarding").then(({ saveOnboardingProgress }) =>
      saveOnboardingProgress(currentStep + 1).catch(() => {}),
    );
  }, [canNext, currentStep, validateCurrentStep]);

  const prev = useCallback(() => {
    if (canPrev) {
      setValidationError(null);
      setCurrentStep((s) => s - 1);
    }
  }, [canPrev]);

  const completeSetup = useCallback(async () => {
    setIsSubmitting(true);
    setSetupError(null);
    try {
      const { completeOnboarding } = await import("@/lib/services/onboarding");
      const result = await completeOnboarding({
        nombre: formData.nombre,
        direccion: formData.direccion || undefined,
        telefono: formData.telefono || undefined,
        email: formData.email || undefined,
        doctorNombre: formData.doctorNombre,
        doctorMatricula: formData.doctorMatricula,
        doctorEspecialidad: formData.doctorEspecialidad || undefined,
        especialidades: formData.especialidades.length ? formData.especialidades : undefined,
        financiadores: formData.financiadores.length ? formData.financiadores : undefined,
        planTier: (formData.planTier as "basic" | "plus" | "enterprise") || "basic",
      });

      if (!result.success) {
        setSetupError(result.error ?? "Error al completar el onboarding");
        return;
      }

      setCompletedSteps(new Set(Array.from({ length: totalSteps }, (_, i) => i)));
      router.push("/dashboard");
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, totalSteps, router]);

  const value = useMemo(
    () => ({
      currentStep,
      totalSteps,
      step,
      goTo,
      next,
      prev,
      canNext,
      canPrev,
      progress,
      completedSteps,
      formData,
      updateForm,
      completeSetup,
      isSubmitting,
      setupError,
      validationError,
      validateCurrentStep,
    }),
    [
      currentStep,
      totalSteps,
      step,
      goTo,
      next,
      prev,
      canNext,
      canPrev,
      progress,
      completedSteps,
      formData,
      updateForm,
      completeSetup,
      isSubmitting,
      setupError,
      validationError,
      validateCurrentStep,
    ],
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}
