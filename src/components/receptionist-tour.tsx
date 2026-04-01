"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  GuidedTour,
  TourWelcomeModal,
  TourStyles,
  useTourCompleted,
  type TourConfig,
  type TourStep,
} from "@/components/GuidedTour";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RotateCcw,
  X,
  GraduationCap,
} from "lucide-react";

// ─── Tour Definitions ────────────────────────────────────────
// Each page the receptionist visits has its own focused tour.
// Steps reference data-tour attributes already placed in the UI.

const DASHBOARD_OVERVIEW_TOUR: TourConfig = {
  id: "recepcion-overview",
  name: "Conocé tu panel de trabajo",
  showOnce: true,
  steps: [
    {
      target: "nav-pacientes",
      title: "Pacientes",
      description:
        "Acá registrás pacientes nuevos y gestionás los existentes. Las consultas entran como leads y las convertís en pacientes.",
      placement: "right",
    },
    {
      target: "nav-agenda",
      title: "Agenda de turnos",
      description:
        "Tu herramienta principal del día. Acá agendás turnos, ves el calendario semanal/diario y gestionás confirmaciones y cancelaciones.",
      placement: "right",
    },
    {
      target: "nav-disponibilidad",
      title: "Disponibilidad",
      description:
        "Acá ves y modificás los horarios de cada profesional. Las celdas verdes son disponibles, las rojas ya tienen turno.",
      placement: "right",
    },
    {
      target: "nav-turnos-online",
      title: "Turnos Online",
      description:
        "Acá llegan los turnos que los pacientes sacan solos desde la web. Revisalos y confirmalos o cancelalos.",
      placement: "right",
    },
    {
      target: "nav-precios",
      title: "Precios",
      description:
        "Consultá y actualizá los precios de las consultas y prácticas. Útil cuando un paciente pregunta cuánto sale.",
      placement: "right",
    },
    {
      target: "nav-verificacion",
      title: "Verificación de cobertura",
      description:
        "Verificá si la obra social del paciente cubre la práctica antes de agendar. Evita sorpresas.",
      placement: "right",
    },
    {
      target: "nav-inventario",
      title: "Inventario",
      description:
        "Controlá el stock de insumos médicos. Recibirás alertas cuando algo esté por agotarse.",
      placement: "right",
    },
    {
      target: "tour-guide-btn",
      title: "¿Necesitás ayuda?",
      description:
        "Si en algún momento te perdés, hacé clic acá para relanzar esta guía interactiva. También podés ver guías específicas de cada sección.",
      placement: "right",
    },
  ],
};

const PACIENTES_TOUR: TourConfig = {
  id: "recepcion-pacientes",
  name: "Gestión de pacientes",
  showOnce: true,
  steps: [
    {
      target: "new-lead",
      title: "Crear nueva consulta",
      description:
        "Cuando llega un paciente nuevo o llaman por teléfono, hacé clic acá para crear una consulta nueva. Se genera una ficha automáticamente.",
      placement: "bottom",
    },
    {
      target: "leads-tab",
      title: "Pestaña de consultas nuevas",
      description:
        "Acá ves todas las consultas entrantes como un pipeline: Nuevo → Contactado → Interesado → Turno agendado → Convertido.",
      placement: "bottom",
    },
    {
      target: "patients-tab",
      title: "Pestaña de pacientes",
      description:
        'Cuando marcás una consulta como "Convertido", el paciente aparece acá automáticamente con toda su ficha completa.',
      placement: "bottom",
    },
    {
      target: "lead-search",
      title: "Buscar consultas",
      description:
        "Buscá por nombre, teléfono o email para encontrar rápidamente una consulta existente.",
      placement: "bottom",
    },
    {
      target: "leads-pipeline",
      title: "Pipeline de consultas",
      description:
        "Acá ves las consultas organizadas por estado. Hacé clic en cualquiera para ver sus datos y avanzar su estado.",
      placement: "top",
    },
    {
      target: "patient-search",
      title: "Buscar pacientes",
      description:
        "Buscá pacientes por nombre o DNI. Desde acá podés ver su ficha completa, historial de turnos y datos de contacto.",
      placement: "bottom",
    },
  ],
};

const AGENDA_TOUR: TourConfig = {
  id: "recepcion-agenda",
  name: "Agenda de turnos",
  showOnce: true,
  steps: [
    {
      target: "agenda-new",
      title: "Crear un nuevo turno",
      description:
        "Hacé clic acá para agendar un turno. Completá: fecha, hora, paciente, profesional, tipo de consulta y financiador (obra social).",
      placement: "bottom",
    },
    {
      target: "agenda-view-toggle",
      title: "Vista semanal o diaria",
      description:
        "Alterná entre la vista de la semana completa y un solo día. La vista diaria es más cómoda cuando hay muchos turnos.",
      placement: "bottom",
    },
    {
      target: "agenda-kpis",
      title: "Indicadores del día",
      description:
        "De un vistazo ves cuántos turnos hay confirmados, pendientes, atendidos y cancelados. Ideal para organizar tu mañana.",
      placement: "bottom",
    },
    {
      target: "agenda-filters",
      title: "Filtrar por profesional",
      description:
        'Hacé clic en el nombre de un profesional para ver solo sus turnos. Hacé clic en "Todos" para volver a ver todo.',
      placement: "bottom",
    },
    {
      target: "agenda-table",
      title: "Tabla de turnos",
      description:
        "Acá ves todos los turnos. Cada uno tiene botones para Confirmar ✓, Atender 🕐 o Cancelar ✕ según el estado del paciente.",
      placement: "top",
    },
  ],
};

const DISPONIBILIDAD_TOUR: TourConfig = {
  id: "recepcion-disponibilidad",
  name: "Disponibilidad de profesionales",
  showOnce: true,
  steps: [
    {
      target: "disp-doctor",
      title: "Elegir profesional",
      description:
        "Seleccioná el médico cuya disponibilidad querés ver o modificar. La grilla se actualiza automáticamente.",
      placement: "bottom",
    },
    {
      target: "disp-week-nav",
      title: "Navegar entre semanas",
      description:
        'Usá las flechas para moverte entre semanas. El botón "Hoy" te lleva a la semana actual.',
      placement: "bottom",
    },
    {
      target: "disp-grid",
      title: "Grilla de horarios",
      description:
        "⬜ Gris = no disponible · 🟩 Verde = disponible · 🟥 Rojo = ya tiene turno. Hacé clic en las celdas grises para abrir horarios, o en las verdes para cerrarlos.",
      placement: "top",
    },
    {
      target: "disp-save",
      title: "Guardar cambios",
      description:
        "¡Importante! Después de hacer cambios, hacé clic acá para guardarlos. Los cambios se aplican inmediatamente.",
      placement: "bottom",
    },
  ],
};

const TURNOS_ONLINE_TOUR: TourConfig = {
  id: "recepcion-turnos-online",
  name: "Turnos por la web",
  showOnce: true,
  steps: [
    {
      target: "booking-url",
      title: "Link de reserva online",
      description:
        "Este es el link que podés compartir con pacientes por WhatsApp o redes sociales para que saquen turno solos.",
      placement: "bottom",
    },
    {
      target: "booking-filters",
      title: "Filtros",
      description:
        "Filtrá por estado (pendiente, confirmado, etc.), por fecha o por profesional para encontrar rápidamente lo que buscás.",
      placement: "bottom",
    },
    {
      target: "booking-table",
      title: "Tabla de reservas",
      description:
        "Acá ves todos los turnos que llegaron desde la web. Cada uno muestra: paciente, profesional, fecha, tipo y estado.",
      placement: "top",
    },
    {
      target: "booking-actions",
      title: "Confirmar o cancelar",
      description:
        "Revisá los datos y confirmá si todo está bien, o cancelá si hay algún problema. Después de la consulta, marcá como Completado o No asistió.",
      placement: "left",
    },
  ],
};

// ─── All tours indexed by route ──────────────────────────────

interface TourEntry {
  tour: TourConfig;
  route: string;
  label: string;
  emoji: string;
}

const ALL_TOURS: TourEntry[] = [
  {
    tour: DASHBOARD_OVERVIEW_TOUR,
    route: "/dashboard",
    label: "Recorrido general",
    emoji: "🏠",
  },
  {
    tour: PACIENTES_TOUR,
    route: "/dashboard/pacientes",
    label: "Gestión de pacientes",
    emoji: "👥",
  },
  {
    tour: AGENDA_TOUR,
    route: "/dashboard/agenda",
    label: "Agenda de turnos",
    emoji: "📅",
  },
  {
    tour: DISPONIBILIDAD_TOUR,
    route: "/dashboard/disponibilidad",
    label: "Disponibilidad",
    emoji: "⏰",
  },
  {
    tour: TURNOS_ONLINE_TOUR,
    route: "/dashboard/turnos-online",
    label: "Turnos online",
    emoji: "🌐",
  },
];

// ─── Tour Progress Tracker ───────────────────────────────────

function useTourProgress() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const refresh = useCallback(() => {
    const state: Record<string, boolean> = {};
    for (const entry of ALL_TOURS) {
      try {
        state[entry.tour.id] = localStorage.getItem(`tour_completed_${entry.tour.id}`) === "true";
      } catch {
        state[entry.tour.id] = false;
      }
    }
    setCompleted(state);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = ALL_TOURS.length;
  const allDone = completedCount === totalCount;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return { completed, completedCount, totalCount, allDone, percentage, refresh };
}

// ─── Main Orchestrator ───────────────────────────────────────

export function ReceptionistOnboarding() {
  const pathname = usePathname();
  const router = useRouter();
  const progress = useTourProgress();

  // Tour state
  const [activeTour, setActiveTour] = useState<TourConfig | null>(null);
  const [tourActive, setTourActive] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showHub, setShowHub] = useState(false);

  // First-visit welcome check
  const overviewDone = useTourCompleted("recepcion-overview");
  const hasShownWelcome = useRef(false);

  // Show welcome modal on first visit to /dashboard
  useEffect(() => {
    if (pathname === "/dashboard" && !overviewDone && !hasShownWelcome.current && !tourActive) {
      // Small delay to let the page render
      const timer = setTimeout(() => {
        setShowWelcome(true);
        hasShownWelcome.current = true;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pathname, overviewDone, tourActive]);

  // Auto-launch page-specific tours on first visit
  useEffect(() => {
    if (tourActive || showWelcome) return;

    const entry = ALL_TOURS.find((e) => e.route === pathname && e.tour.id !== "recepcion-overview");
    if (!entry) return;

    let done = false;
    try {
      done = localStorage.getItem(`tour_completed_${entry.tour.id}`) === "true";
    } catch {
      /* */
    }

    if (!done) {
      const timer = setTimeout(() => {
        setActiveTour(entry.tour);
        setShowWelcome(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [pathname, tourActive, showWelcome]);

  // Listen for the sidebar "trigger-tour" event
  useEffect(() => {
    const handler = () => {
      setShowHub(true);
    };
    window.addEventListener("trigger-tour", handler);
    return () => window.removeEventListener("trigger-tour", handler);
  }, []);

  // Start a tour
  const startTour = useCallback(
    (tour: TourConfig) => {
      // Navigate to the tour's page first if not already there
      const entry = ALL_TOURS.find((e) => e.tour.id === tour.id);
      if (entry && entry.route !== pathname) {
        router.push(entry.route);
        // Wait for navigation + render
        setTimeout(() => {
          setActiveTour(tour);
          setShowWelcome(false);
          setShowHub(false);
          setTourActive(true);
        }, 500);
      } else {
        setActiveTour(tour);
        setShowWelcome(false);
        setShowHub(false);
        setTourActive(true);
      }
    },
    [pathname, router],
  );

  // Handle welcome modal actions
  const handleWelcomeStart = useCallback(() => {
    const tour = activeTour || DASHBOARD_OVERVIEW_TOUR;
    startTour(tour);
  }, [activeTour, startTour]);

  const handleWelcomeSkip = useCallback(() => {
    const tour = activeTour || DASHBOARD_OVERVIEW_TOUR;
    try {
      localStorage.setItem(`tour_completed_${tour.id}`, "true");
    } catch {
      /* */
    }
    setShowWelcome(false);
    setActiveTour(null);
    progress.refresh();
  }, [activeTour, progress]);

  // Handle tour complete/dismiss
  const handleTourComplete = useCallback(() => {
    setTourActive(false);
    setActiveTour(null);
    progress.refresh();

    // If this was the overview tour, show the hub after a beat
    if (activeTour?.id === "recepcion-overview") {
      setTimeout(() => setShowHub(true), 400);
    }
  }, [activeTour, progress]);

  const handleTourDismiss = useCallback(() => {
    setTourActive(false);
    setActiveTour(null);
    progress.refresh();
  }, [progress]);

  // Reset a specific tour
  const resetTour = useCallback(
    (tourId: string) => {
      try {
        localStorage.removeItem(`tour_completed_${tourId}`);
      } catch {
        /* */
      }
      progress.refresh();
    },
    [progress],
  );

  // Reset all tours
  const resetAll = useCallback(() => {
    for (const entry of ALL_TOURS) {
      try {
        localStorage.removeItem(`tour_completed_${entry.tour.id}`);
      } catch {
        /* */
      }
    }
    progress.refresh();
  }, [progress]);

  const welcomeTour = activeTour || DASHBOARD_OVERVIEW_TOUR;
  const welcomeDesc =
    welcomeTour.id === "recepcion-overview"
      ? "Te vamos a mostrar paso a paso cómo funciona tu panel de trabajo. Vas a aprender dónde encontrar cada herramienta y cómo usarla en tu día a día."
      : `Te mostramos cómo usar la sección "${welcomeTour.name}" en ${welcomeTour.steps.length} pasos simples.`;

  return (
    <>
      <TourStyles />

      {/* Welcome Modal */}
      <TourWelcomeModal
        open={showWelcome && !tourActive}
        tourName={welcomeTour.name}
        description={welcomeDesc}
        onStart={handleWelcomeStart}
        onSkip={handleWelcomeSkip}
      />

      {/* Active Tour */}
      {activeTour && (
        <GuidedTour
          tour={activeTour}
          active={tourActive}
          onComplete={handleTourComplete}
          onDismiss={handleTourDismiss}
        />
      )}

      {/* Tour Hub / Checklist */}
      {showHub && !tourActive && !showWelcome && (
        <TourHub
          progress={progress}
          onStartTour={startTour}
          onResetTour={resetTour}
          onResetAll={resetAll}
          onClose={() => setShowHub(false)}
          currentPath={pathname}
        />
      )}

      {/* Floating progress badge (when hub is closed, not all done) */}
      {!showHub && !tourActive && !showWelcome && !progress.allDone && (
        <button
          onClick={() => setShowHub(true)}
          className="fixed bottom-20 right-5 z-[100] flex items-center gap-2 px-4 py-2.5 bg-white border border-celeste-200 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
          aria-label="Progreso de la guía"
        >
          <GraduationCap className="w-4 h-4 text-celeste-dark" />
          <span className="text-xs font-semibold text-gray-700">
            {progress.completedCount}/{progress.totalCount}
          </span>
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-celeste-dark rounded-full transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </button>
      )}

      {/* Celebration when all done */}
      {progress.allDone && !showHub && !tourActive && !showWelcome && (
        <AllDoneCelebration
          onDismiss={() => progress.refresh()}
          onShowHub={() => setShowHub(true)}
        />
      )}
    </>
  );
}

// ─── Tour Hub Panel ──────────────────────────────────────────

interface TourHubProps {
  progress: ReturnType<typeof useTourProgress>;
  onStartTour: (tour: TourConfig) => void;
  onResetTour: (id: string) => void;
  onResetAll: () => void;
  onClose: () => void;
  currentPath: string;
}

function TourHub({
  progress,
  onStartTour,
  onResetTour,
  onResetAll,
  onClose,
  currentPath,
}: TourHubProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="fixed bottom-5 right-5 z-[200] w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      role="dialog"
      aria-label="Guía de capacitación"
      style={{ animation: "tour-tooltip-in 300ms ease-out" }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-celeste-dark to-celeste px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Guía de capacitación</h3>
              <p className="text-[11px] text-white/80">
                {progress.completedCount} de {progress.totalCount} completadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-white/70 hover:text-white transition"
              aria-label={expanded ? "Minimizar" : "Expandir"}
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white transition"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Tour list */}
      {expanded && (
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {ALL_TOURS.map((entry) => {
            const isDone = progress.completed[entry.tour.id];
            const isCurrent = entry.route === currentPath;

            return (
              <div
                key={entry.tour.id}
                className={`flex items-center gap-3 px-5 py-3.5 transition ${
                  isDone ? "bg-gray-50/50" : "hover:bg-celeste-50/30"
                }`}
              >
                {/* Status icon */}
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" aria-hidden="true">
                      {entry.emoji}
                    </span>
                    <span
                      className={`text-[13px] font-medium ${isDone ? "text-gray-400 line-through" : "text-gray-800"}`}
                    >
                      {entry.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {entry.tour.steps.length} pasos
                    {isCurrent && !isDone && (
                      <span className="ml-1.5 text-celeste-dark font-medium">· Estás acá</span>
                    )}
                  </p>
                </div>

                {/* Action */}
                {isDone ? (
                  <button
                    onClick={() => onResetTour(entry.tour.id)}
                    className="shrink-0 p-1.5 text-gray-300 hover:text-celeste-dark transition"
                    aria-label={`Repetir ${entry.label}`}
                    title="Repetir"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => onStartTour(entry.tour)}
                    className="shrink-0 px-3 py-1.5 text-[11px] font-semibold text-white bg-celeste-dark hover:bg-celeste rounded-lg transition"
                  >
                    Iniciar
                  </button>
                )}
              </div>
            );
          })}

          {/* Reset all */}
          {progress.completedCount > 0 && (
            <div className="px-5 py-3 bg-gray-50">
              <button
                onClick={onResetAll}
                className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-red-500 transition"
              >
                <RotateCcw className="w-3 h-3" />
                Reiniciar todas las guías
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Celebration ─────────────────────────────────────────────

function AllDoneCelebration({
  onDismiss,
  onShowHub,
}: {
  onDismiss: () => void;
  onShowHub: () => void;
}) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if we already celebrated
    try {
      if (localStorage.getItem("tour_celebrated") === "true") {
        setDismissed(true);
        return;
      }
    } catch {
      /* */
    }
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem("tour_celebrated", "true");
    } catch {
      /* */
    }
    setDismissed(true);
    onDismiss();
  };

  if (dismissed || !show) return null;

  return (
    <div
      className="fixed bottom-20 right-5 z-[100] w-[300px] bg-white rounded-2xl shadow-2xl border border-emerald-200 overflow-hidden"
      style={{ animation: "tour-tooltip-in 300ms ease-out" }}
    >
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 text-center">
        <Sparkles className="w-8 h-8 text-white mx-auto mb-2" />
        <h3 className="text-sm font-bold text-white">¡Capacitación completa!</h3>
        <p className="text-[11px] text-white/80 mt-1">
          Ya conocés todas las herramientas de tu panel
        </p>
      </div>
      <div className="px-5 py-4 space-y-2">
        <button
          onClick={() => {
            handleDismiss();
            onShowHub();
          }}
          className="w-full px-4 py-2 text-xs font-medium text-celeste-dark hover:bg-celeste-50 rounded-lg border border-celeste-200 transition"
        >
          Ver mi progreso
        </button>
        <button
          onClick={handleDismiss}
          className="w-full px-4 py-2 text-xs text-gray-400 hover:text-gray-600 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
