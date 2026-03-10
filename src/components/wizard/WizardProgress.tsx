"use client";

import { useWizard, WIZARD_ICON_MAP } from "./WizardData";

export function WizardProgress() {
  const { currentStep, totalSteps, progress, step } = useWizard();

  return (
    <div className="border-b border-gray-200 bg-white px-8 py-4">
      {/* Top row */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(() => {
            const I = WIZARD_ICON_MAP[step.icon];
            return I ? <I className="w-6 h-6 text-celeste-600" /> : null;
          })()}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {step.category}
            </p>
            <h1 className="text-lg font-bold text-ink-900">{step.title}</h1>
          </div>
        </div>
        <span className="rounded-full bg-celeste-50 px-3 py-1 text-xs font-semibold text-celeste-700">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-celeste-400 to-celeste-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Paso ${currentStep + 1} de ${totalSteps}`}
        />
      </div>
    </div>
  );
}
