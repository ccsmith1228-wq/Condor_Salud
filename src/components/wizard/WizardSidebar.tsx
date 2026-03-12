"use client";

import { useWizard, WIZARD_CATEGORIES, WIZARD_STEPS, WIZARD_CATEGORY_ICON_MAP } from "./WizardData";

export function WizardSidebar() {
  const { currentStep, goTo, completedSteps } = useWizard();

  return (
    <nav
      className="w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4"
      aria-label="Pasos del asistente"
    >
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Índice del Recorrido
        </h2>
      </div>

      {WIZARD_CATEGORIES.map((cat) => (
        <div key={cat.name} className="mb-4">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            {(() => {
              const I = WIZARD_CATEGORY_ICON_MAP[cat.icon];
              return I ? <I className="w-3.5 h-3.5" /> : null;
            })()}
            {cat.name}
          </h3>
          <ul className="space-y-0.5">
            {cat.stepIds.map((stepId) => {
              const idx = WIZARD_STEPS.findIndex((s) => s.id === stepId);
              const step = WIZARD_STEPS[idx];
              if (!step) return null;

              const isActive = idx === currentStep;
              const isCompleted = completedSteps.has(idx);

              return (
                <li key={stepId}>
                  <button
                    onClick={() => goTo(idx)}
                    className={`
                      group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all
                      ${
                        isActive
                          ? "bg-celeste-50 font-semibold text-celeste-700 shadow-sm ring-1 ring-celeste-200"
                          : isCompleted
                            ? "text-gray-600 hover:bg-gray-50"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }
                    `}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {/* Status indicator */}
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                      {isActive ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-celeste-500 ring-4 ring-celeste-100" />
                      ) : isCompleted ? (
                        <svg
                          className="h-4 w-4 text-success-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-gray-300 group-hover:bg-gray-400" />
                      )}
                    </span>
                    <span className="truncate">{step.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
