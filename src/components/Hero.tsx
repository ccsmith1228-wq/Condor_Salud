"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

const trustLogos = ["PAMI", "OSDE", "Swiss Medical", "Galeno", "Medifé", "IOMA"];

export default function Hero() {
  const { t } = useLocale();

  return (
    <section className="px-6 pt-16 pb-20 max-w-[1000px] mx-auto">
      {/* Announcement banner */}
      <div className="flex justify-center mb-8">
        <Link
          href="/dashboard/configuracion/integraciones"
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-celeste-pale border border-celeste/20 rounded-full text-xs hover:bg-celeste-100 hover:border-celeste/40 transition"
        >
          <span className="w-2 h-2 bg-celeste-dark rounded-full animate-pulse" />
          <span className="text-ink-light">{t("hero.badge")}</span>
          <ArrowRight className="w-3 h-3 text-celeste-dark" />
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-[clamp(32px,5vw,56px)] font-bold text-ink leading-[1.1] mb-6">
          {t("hero.title1")}
          <br />
          <em className="not-italic text-celeste-dark">{t("hero.title2")}</em>
        </h1>
        <p className="text-lg text-ink-light leading-[1.7] max-w-[660px] mx-auto mb-8">
          {t("hero.subtitle")}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Link
            href="/auth/registro"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-celeste-dark hover:bg-celeste rounded-[4px] transition"
          >
            {t("hero.cta1")}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-ink-light border-[1.5px] border-border hover:border-celeste-dark hover:text-celeste-dark rounded-[4px] transition"
          >
            {t("hero.cta2")}
          </Link>
        </div>
        <p className="text-[11px] text-ink-muted mb-10">{t("hero.fine")}</p>

        {/* Dashboard preview */}
        <div className="relative max-w-[800px] mx-auto mb-10">
          <div className="bg-gradient-to-b from-celeste-pale to-white border border-border rounded-xl overflow-hidden shadow-lg">
            {/* Browser chrome */}
            <div className="bg-white/80 backdrop-blur border-b border-border px-5 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-gold" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-surface rounded text-[11px] text-ink-muted">
                  condorsalud.com/dashboard
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Mock KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: t("hero.mockBilled"), val: "$12.4M", change: "+18%" },
                  { label: t("hero.mockCollected"), val: "$9.8M", change: "+24%" },
                  { label: t("hero.mockRejections"), val: "3.2%", change: "-62%" },
                  { label: t("hero.mockDelay"), val: "22 días", change: "-45d" },
                ].map((k) => (
                  <div key={k.label} className="bg-white border border-border/60 rounded-lg p-3">
                    <p className="text-[10px] text-ink-muted">{k.label}</p>
                    <p className="text-lg font-bold text-ink">{k.val}</p>
                    <p className="text-[10px] text-celeste-dark font-medium">{k.change}</p>
                  </div>
                ))}
              </div>
              {/* Mock chart */}
              <div className="bg-white border border-border/60 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-ink">{t("hero.mockChartTitle")}</p>
                  <div className="flex gap-3 text-[10px] text-ink-muted">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-celeste-dark rounded-full" />{" "}
                      {t("hero.mockBilled")}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gold rounded-full" /> {t("hero.mockCollected")}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-400 rounded-full" />{" "}
                      {t("hero.mockRejections")}
                    </span>
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-24">
                  {[65, 72, 58, 80, 75, 85, 90, 78, 88, 92, 86, 95].map((h, i) => (
                    <div key={`bar-${h}-${i}`} className="flex-1 flex flex-col gap-0.5">
                      <div className="bg-celeste-dark/20 rounded-sm" style={{ height: `${h}%` }} />
                      <div
                        className="bg-celeste-dark rounded-sm"
                        style={{ height: `${h * 0.75}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -inset-4 bg-celeste/5 rounded-2xl -z-10 blur-xl" />
        </div>

        {/* Trust logos */}
        <p className="text-[10px] font-bold tracking-[2px] text-ink-muted uppercase mb-4">
          {t("hero.trust")}
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {trustLogos.map((name) => (
            <div
              key={name}
              className="text-sm font-bold text-ink-muted/50 hover:text-celeste-dark transition"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
