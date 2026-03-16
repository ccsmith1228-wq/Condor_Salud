"use client";

import { AlertTriangle, Clock, TrendingDown, Unlink } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

const statIcons = [Unlink, AlertTriangle, Clock, TrendingDown];
const statValues = ["300+", "8–25%", "45–90", "8–15%"];

export default function Stats() {
  const { t } = useLocale();

  const stats = statIcons.map((icon, i) => ({
    icon,
    value: statValues[i],
    label: t(`stats.label${i}`),
    detail: t(`stats.detail${i}`),
  }));

  return (
    <section className="px-6 mb-16">
      <div className="max-w-[960px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-border rounded-xl p-5 hover:border-celeste/40 hover:shadow-sm transition text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-celeste-pale flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-5 h-5 text-celeste-dark" />
              </div>
              <div className="text-[32px] font-bold text-celeste-dark leading-none">{s.value}</div>
              <div className="text-xs font-semibold text-ink mt-1.5 mb-1">{s.label}</div>
              <p className="text-[11px] text-ink-muted leading-snug">{s.detail}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-ink-muted mt-4">{t("stats.source")}</p>
      </div>
    </section>
  );
}
