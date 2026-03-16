"use client";

import { Building2, HeartPulse, ShieldAlert, Landmark } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

const cardIcons = [Landmark, Building2, HeartPulse, ShieldAlert];
const accents = [
  "border-celeste",
  "border-celeste-light",
  "border-celeste",
  "border-celeste-light",
];

export default function Problem() {
  const { t } = useLocale();

  const problems = cardIcons.map((icon, i) => ({
    icon,
    title: t(`problem.card${i}.title`),
    desc: t(`problem.card${i}.desc`),
    stats: t(`problem.card${i}.stats`),
    accent: accents[i],
  }));

  const consequences = Array.from({ length: 6 }, (_, i) => t(`problem.cons${i}`));

  return (
    <section id="problema" className="px-6 py-20 border-t border-border">
      <div className="max-w-[960px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          {t("problem.label")}
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          {t("problem.title")}
          <em className="not-italic text-celeste-dark">{t("problem.titleEm")}</em>
        </h2>
        <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-10">
          {t("problem.subtitle")}
        </p>

        {/* Problem cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {problems.map((p) => (
            <div
              key={p.title}
              className={`border-l-[3px] ${p.accent} bg-white border border-l-[3px] border-border rounded-lg p-5 hover:shadow-sm transition`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-celeste-pale flex items-center justify-center shrink-0">
                  <p.icon className="w-4 h-4 text-celeste-dark" />
                </div>
                <h3 className="font-bold text-sm text-ink">{p.title}</h3>
              </div>
              <p className="text-[13px] text-ink-light leading-relaxed mb-3">{p.desc}</p>
              <p className="text-[10px] font-medium text-celeste-dark/70 tracking-wide">
                {p.stats}
              </p>
            </div>
          ))}
        </div>

        {/* Consequences */}
        <div className="bg-red-50/50 border border-red-200/60 rounded-xl p-6">
          <h3 className="text-sm font-bold text-ink mb-3">{t("problem.consequence.title")}</h3>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {consequences.map((c) => (
              <div key={c} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
                <p className="text-[13px] text-ink-light leading-relaxed">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
