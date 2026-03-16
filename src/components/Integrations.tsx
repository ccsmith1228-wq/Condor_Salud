"use client";

import { useLocale } from "@/lib/i18n/context";

const entityNames = [
  "PAMI",
  "OSDE",
  "Swiss Medical",
  "Galeno",
  "Medifé",
  "IOMA",
  "Sancor Salud",
  "Omint",
  "Accord Salud",
  "AFIP",
  "ANMAT",
  "SISA",
];
// Translation keys per entity (some use name as-is for desc)
const entityDescKeys: Record<number, string> = {
  0: "int.entity0",
  1: "int.entity1",
  2: "int.entity2",
  3: "int.entity3",
  4: "int.entity4",
  5: "int.entity5",
  7: "int.entity7",
  9: "int.entity9",
  10: "int.entity10",
  11: "int.entity11",
};
const entityStaticDesc: Record<number, string> = { 6: "Santa Fe", 8: "Grupo OSDE" };

export default function Integrations() {
  const { t } = useLocale();

  const entities = entityNames.map((name, i) => ({
    name,
    desc: entityDescKeys[i] ? t(entityDescKeys[i]) : (entityStaticDesc[i] ?? name),
  }));

  const integrationTypes = [0, 1, 2].map((i) => ({
    title: t(`int.type${i}.title`),
    count: ["280+", "45+", "6"][i],
    desc: t(`int.type${i}.desc`),
  }));

  return (
    <section className="px-6 py-20 bg-celeste-pale/50 border-t border-border">
      <div className="max-w-[900px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          {t("int.label")}
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          {t("int.title")}
        </h2>
        <p className="text-[15px] text-ink-light leading-[1.7] max-w-[600px] mb-10">
          {t("int.subtitle")}
        </p>

        {/* Integration type cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {integrationTypes.map((it) => (
            <div
              key={it.title}
              className="bg-white border border-border rounded-xl p-5 text-center"
            >
              <div className="text-3xl font-bold text-celeste-dark mb-1">{it.count}</div>
              <h3 className="font-bold text-sm text-ink mb-1">{it.title}</h3>
              <p className="text-[12px] text-ink-light leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>

        {/* Entity grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {entities.map((e) => (
            <div
              key={e.name}
              className="bg-white border border-border/80 rounded-lg py-4 px-3 text-center hover:border-celeste-dark/40 hover:shadow-sm transition"
            >
              <div className="text-sm font-bold text-ink leading-tight">{e.name}</div>
              <div className="text-[10px] text-ink-muted mt-0.5">{e.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
