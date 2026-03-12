"use client";

import Link from "next/link";
import { useWizard } from "./WizardData";

export function WizardStepContent() {
  const { step } = useWizard();

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      {/* Summary card */}
      <div className="mb-8 rounded-2xl border border-celeste-100 bg-celeste-50/60 p-6 shadow-sm">
        <p className="text-base leading-relaxed text-gray-700">{step.summary}</p>
        <Link
          href={step.route}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-celeste-600 hover:text-celeste-700 transition-colors"
        >
          <span>Ir al módulo</span>
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
        </Link>
      </div>

      {/* Description */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
          ¿Qué hace este módulo?
        </h2>
        <div className="space-y-3">
          {step.description.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-gray-700">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
          Funcionalidades clave
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {step.keyFeatures.map((feat, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 rounded-lg border border-gray-100 bg-gray-50/50 p-3"
            >
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-celeste-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">{feat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Customizations */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
          Cómo personalizarlo para tu práctica
        </h2>
        <div className="space-y-3">
          {step.customizations.map((c, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-1 text-sm font-semibold text-ink-800">{c.label}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{c.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pro Tip */}
      {step.proTip && (
        <section className="mb-6">
          <div className="rounded-xl border border-celeste-200 bg-celeste-50 p-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-celeste-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <h3 className="text-sm font-bold text-celeste-700">Pro Tip</h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-700">{step.proTip}</p>
          </div>
        </section>
      )}
    </div>
  );
}
