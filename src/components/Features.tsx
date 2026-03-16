"use client";

import Link from "next/link";
import {
  Search,
  FileText,
  ShieldCheck,
  TrendingUp,
  Plug,
  BarChart3,
  Calendar,
  Pill,
  Video,
  Stethoscope,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

const coreIcons = [Search, FileText, ShieldCheck, TrendingUp, Plug, BarChart3];
const coreCeleste = [true, false, true, false, true, false];
const extraIcons = [Calendar, Pill, Video, Stethoscope];

export default function Features() {
  const { t } = useLocale();

  const coreFeatures = coreIcons.map((icon, i) => ({
    icon,
    title: t(`features.core${i}.title`),
    desc: t(`features.core${i}.desc`),
    highlight: t(`features.core${i}.hl`),
    celeste: coreCeleste[i],
  }));

  const extraModules = extraIcons.map((icon, i) => ({
    icon,
    title: t(`features.extra${i}.title`),
    desc: t(`features.extra${i}.desc`),
  }));

  return (
    <section id="producto" className="px-6 py-20 bg-celeste-pale/50">
      <div className="max-w-[960px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          {t("features.label")}
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          {t("features.title")}
          <em className="not-italic text-celeste-dark">{t("features.titleEm")}</em>
        </h2>
        <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-10">
          {t("features.subtitle")}
        </p>

        {/* Core feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {coreFeatures.map((f) => (
            <div
              key={f.title}
              className={`border-l-[3px] rounded-lg p-5 hover:shadow-sm transition ${
                f.celeste ? "border-celeste bg-celeste-pale/60" : "border-celeste-light bg-white"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/80 border border-celeste/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-celeste-dark" />
                </div>
                <h3 className="font-bold text-sm text-ink">{f.title}</h3>
              </div>
              <p className="text-[13px] text-ink-light leading-relaxed mb-3">{f.desc}</p>
              <span className="inline-block text-[10px] font-bold text-celeste-dark bg-celeste-pale px-2 py-0.5 rounded">
                {f.highlight}
              </span>
            </div>
          ))}
        </div>

        {/* Extra modules */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="text-sm font-bold text-ink mb-1">{t("features.extraTitle")}</h3>
          <p className="text-[12px] text-ink-muted mb-5">{t("features.extraSubtitle")}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {extraModules.map((m) => (
              <div key={m.title} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded bg-celeste-pale flex items-center justify-center shrink-0 mt-0.5">
                  <m.icon className="w-3.5 h-3.5 text-celeste-dark" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">{m.title}</p>
                  <p className="text-[11px] text-ink-muted leading-snug">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-celeste-dark border border-celeste-dark rounded-[4px] hover:bg-celeste-pale transition"
          >
            {t("features.cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
