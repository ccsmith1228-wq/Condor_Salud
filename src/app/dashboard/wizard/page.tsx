"use client";

import {
  WizardProvider,
  WizardSidebar,
  WizardProgress,
  WizardStepContent,
  WizardNavigation,
} from "@/components/wizard";

export default function WizardPage() {
  return (
    <WizardProvider>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Left TOC */}
        <div className="hidden lg:block">
          <WizardSidebar />
        </div>

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Progress + step header */}
          <WizardProgress />

          {/* Mobile TOC toggle */}
          <MobileTocToggle />

          {/* Step body (scrollable) */}
          <WizardStepContent />

          {/* Navigation bar */}
          <WizardNavigation />
        </div>
      </div>
    </WizardProvider>
  );
}

// ─── Mobile sidebar drawer ───────────────────────────────────

import { useState } from "react";

function MobileTocToggle() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 border-b border-gray-100 px-4 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50"
        aria-expanded={open}
        aria-controls="mobile-wizard-toc"
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span>{open ? "Ocultar índice" : "Mostrar índice"}</span>
      </button>
      {open && (
        <div id="mobile-wizard-toc" className="max-h-64 overflow-y-auto border-b border-gray-100">
          <WizardSidebar />
        </div>
      )}
    </div>
  );
}
