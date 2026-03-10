"use client";

import { useWizard, WIZARD_STEPS } from "./WizardData";
import Link from "next/link";

export function WizardNavigation() {
  const { currentStep, totalSteps, canPrev, canNext, prev, next, step } = useWizard();
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Previous */}
        <button
          onClick={prev}
          disabled={!canPrev}
          className={`
            flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all
            ${
              canPrev
                ? "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                : "cursor-not-allowed text-gray-300"
            }
          `}
          aria-label="Paso anterior"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          <span className="hidden sm:inline">
            {canPrev ? WIZARD_STEPS[currentStep - 1].title : "Anterior"}
          </span>
        </button>

        {/* Visit module link */}
        <Link
          href={step.route}
          className="flex items-center gap-2 rounded-lg border border-celeste-200 bg-celeste-50 px-4 py-2.5 text-sm font-semibold text-celeste-700 transition-all hover:bg-celeste-100 hover:shadow-sm"
        >
          <span>Visitar {step.title}</span>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </Link>

        {/* Next / Finish */}
        {isLast ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-celeste-500 to-celeste-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-celeste-200 transition-all hover:from-celeste-600 hover:to-celeste-700 hover:shadow-lg"
          >
            <span>Finalizar recorrido</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </Link>
        ) : (
          <button
            onClick={next}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-celeste-500 to-celeste-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-celeste-200 transition-all hover:from-celeste-600 hover:to-celeste-700 hover:shadow-lg active:shadow-sm"
            aria-label="Siguiente paso"
          >
            <span className="hidden sm:inline">{WIZARD_STEPS[currentStep + 1].title}</span>
            <span className="sm:hidden">Siguiente</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
