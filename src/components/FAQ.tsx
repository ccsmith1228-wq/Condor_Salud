"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

const FAQ_COUNT = 8;

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t } = useLocale();

  const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(`faq.q${i}`),
    a: t(`faq.a${i}`),
  }));

  return (
    <section id="faq" className="px-6 py-20 border-t border-border">
      <div className="max-w-[720px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          {t("faq.label")}
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-10 leading-[1.2]">
          {t("faq.title")}
        </h2>

        <div className="space-y-1">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            const panelId = `faq-panel-${i}`;
            const headingId = `faq-heading-${i}`;
            return (
              <div key={headingId} className="border border-border rounded-lg overflow-hidden">
                {/* A-03: aria-expanded, aria-controls, ID */}
                <button
                  id={headingId}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen ? "true" : "false"}
                  aria-controls={panelId}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-celeste-pale/30 transition"
                >
                  <span className="text-sm font-semibold text-ink pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {/* A-03: Panel with ID, role="region", aria-labelledby */}
                {/* UM-03: CSS transition via grid trick */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-4">
                      <p className="text-[13px] text-ink-light leading-[1.7]">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
