"use client";

import { Stethoscope, Bell, Pill, Wallet } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

const statIcons = [Stethoscope, Bell, Pill, Wallet];
const statValues = ["2,400+", "< 30s", "850+", "MercadoPago"];

export default function PatientStats() {
  const { t } = useLocale();

  const stats = statIcons.map((icon, i) => ({
    icon,
    value: statValues[i],
    label: t(`pstats.label${i}`),
    detail: t(`pstats.detail${i}`),
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
        <p className="text-center text-[11px] text-ink-muted mt-4">{t("pstats.source")}</p>
      </div>
    </section>
  );
}
