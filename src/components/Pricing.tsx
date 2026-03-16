"use client";

import Link from "next/link";
import {
  PRESETS,
  calcPresetPrice,
  calcPresetSubtotal,
  formatARS,
  getModule,
} from "@/lib/plan-config";
import { Check } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

export default function Pricing() {
  const { t } = useLocale();

  return (
    <section id="pricing" className="px-6 py-20 border-t border-border">
      <div className="max-w-[960px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          {t("pricing.label")}
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          {t("pricing.title")}
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {PRESETS.map((preset) => {
            const price = calcPresetPrice(preset);
            const subtotal = calcPresetSubtotal(preset);
            const hasDiscount = preset.discount > 0;
            const isPro = preset.popular;
            // Show first 5 module labels
            const moduleLabels = preset.modules.slice(0, 5).map((id) => getModule(id).label);
            return (
              <Link
                key={preset.id}
                href={`/planes?tier=${preset.id}`}
                className={`relative flex flex-col p-7 transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer rounded-xl ${
                  isPro ? "border-2 border-celeste bg-celeste-pale/40" : "border border-border"
                }`}
              >
                {isPro && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-celeste-dark text-white rounded-full">
                    Popular
                  </span>
                )}
                <div className="text-[10px] font-bold tracking-[0.12em] text-ink-muted uppercase mb-1">
                  {preset.name}
                </div>
                <p className="text-xs text-ink-muted mb-3">{preset.tagline}</p>
                {hasDiscount && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-ink-muted line-through">
                      {formatARS(subtotal)}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded">
                      {Math.round(preset.discount * 100)}
                      {t("pricing.discount")}
                    </span>
                  </div>
                )}
                <div
                  className={`text-[28px] font-bold mb-4 ${isPro ? "text-celeste-dark" : "text-ink"}`}
                >
                  {formatARS(price)}
                  <span className="text-sm font-normal text-ink-muted">
                    {t("pricing.perMonth")}
                  </span>
                </div>
                <div className="flex-1 space-y-1.5 mb-5">
                  {moduleLabels.map((label) => (
                    <div key={label} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-celeste-dark" />
                      <span className="text-xs text-ink">{label}</span>
                    </div>
                  ))}
                  {preset.modules.length > 5 && (
                    <p className="text-[11px] text-celeste-dark font-medium mt-1">
                      +{preset.modules.length - 5} {t("pricing.moreModules")}
                    </p>
                  )}
                </div>
                <span
                  className={`block w-full py-2.5 text-center text-xs font-semibold rounded-[4px] transition ${
                    isPro
                      ? "bg-celeste-dark text-white hover:bg-celeste"
                      : "border border-celeste-dark text-celeste-dark hover:bg-celeste-pale"
                  }`}
                >
                  {t("pricing.choose")}
                </span>
                <p className="text-center text-[10px] text-ink-muted mt-2">
                  {preset.modules.length} {t("pricing.modulesIncluded")}
                </p>
              </Link>
            );
          })}
        </div>
        {/* Custom plan CTA */}
        <div className="text-center mt-8">
          <p className="text-sm text-ink-muted">
            {t("pricing.custom")}
            <Link href="/planes#custom" className="text-celeste-dark font-semibold hover:underline">
              {t("pricing.customLink")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
