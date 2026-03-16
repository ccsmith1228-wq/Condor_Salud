"use client";

import { Shield, Lock, Server, Eye, FileCheck, Globe } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

const certIcons = [Lock, Shield, Server, Eye, FileCheck, Globe];
// Titles that don't change between locales (certifications 2 & 4 keep their English names)
const staticTitles: Record<number, string> = {
  2: "SOC 2 Type II & ISO 27001",
  4: "HIPAA-ready",
  5: "Data residency Argentina",
};

export default function Security() {
  const { t } = useLocale();

  const certifications = certIcons.map((icon, i) => ({
    icon,
    title: staticTitles[i] ?? t(`sec.cert${i}.title`),
    desc: t(`sec.cert${i}.desc`),
  }));

  return (
    <section className="px-6 py-20 bg-[#FAFCFF] border-t border-border">
      <div className="max-w-[960px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          {t("sec.label")}
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          {t("sec.title")}
          <em className="not-italic text-celeste-dark">{t("sec.titleEm")}</em>
        </h2>
        <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-10">
          {t("sec.subtitle")}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((c) => (
            <div
              key={c.title}
              className="bg-white border border-border rounded-xl p-5 hover:border-celeste/30 hover:shadow-sm transition"
            >
              <div className="w-9 h-9 rounded-lg bg-celeste-pale flex items-center justify-center mb-3">
                <c.icon className="w-[18px] h-[18px] text-celeste-dark" />
              </div>
              <h3 className="font-bold text-sm text-ink mb-1.5">{c.title}</h3>
              <p className="text-[12px] text-ink-light leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
