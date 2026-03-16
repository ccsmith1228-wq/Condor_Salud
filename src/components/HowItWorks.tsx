"use client";

import { UserPlus, Settings2, Zap } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

const stepIcons = [UserPlus, Settings2, Zap];
const stepNums = ["01", "02", "03"];

export default function HowItWorks() {
  const { t } = useLocale();

  const steps = stepIcons.map((icon, i) => ({
    icon,
    step: stepNums[i],
    title: t(`how.step${i}.title`),
    desc: t(`how.step${i}.desc`),
  }));

  return (
    <section className="px-6 py-20 border-t border-border">
      <div className="max-w-[900px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          {t("how.label")}
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          {t("how.title")}
          <em className="not-italic text-celeste-dark">{t("how.titleEm")}</em>
        </h2>
        <p className="text-[15px] text-ink-light leading-[1.7] max-w-[600px] mb-12">
          {t("how.subtitle")}
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-celeste-pale flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-celeste-dark" />
                </div>
                <span className="text-[11px] font-bold tracking-wider text-celeste-dark/60 uppercase">
                  {t("how.stepLabel")} {s.step}
                </span>
              </div>
              <h3 className="font-bold text-base text-ink mb-2">{s.title}</h3>
              <p className="text-[13px] text-ink-light leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Connector line (desktop only) — decorative */}
        <div className="hidden md:block relative mt-4 mb-4 mx-[60px]" aria-hidden="true">
          <div className="h-px bg-celeste/30 w-full" />
        </div>
      </div>
    </section>
  );
}
