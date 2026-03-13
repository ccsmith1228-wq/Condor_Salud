"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "¿Cuánto tarda la implementación?",
    a: "La mayoría de las clínicas están operativas el mismo día. Creás tu cuenta, seleccionás financiadores, y Cóndor configura automáticamente los nomencladores y conexiones. Para integraciones avanzadas (HIS, laboratorio), el equipo te acompaña en 48–72 horas.",
  },
  {
    q: "¿Funciona con PAMI y todas las obras sociales?",
    a: "Sí. Cóndor se integra con PAMI (padrón, nomenclador propio, receta digital), más de 280 obras sociales y 45 prepagas. Incluye verificación de padrón en tiempo real, presentación electrónica y seguimiento de expedientes.",
  },
  {
    q: "¿Cómo funciona el ajuste por inflación?",
    a: "Todos los planes se ajustan mensualmente por IPC (INDEC). El tracker de inflación te muestra el valor real vs. nominal de cada cobro y cuánto perdés por cada día de demora. Así podés tomar decisiones con datos reales.",
  },
  {
    q: "¿Necesito cambiar mi sistema de historia clínica?",
    a: "No. Cóndor se integra con los principales HIS del mercado argentino (TRAKCARE, eMedical, PROSALUD, etc.) y también funciona de manera independiente. Importamos datos vía API o archivos estándar.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Cóndor cumple con la Ley 25.326 de Protección de Datos Personales y está hosteado en infraestructura con certificación SOC 2 e ISO 27001. Los datos de salud se encriptan en tránsito (TLS 1.3) y en reposo (AES-256).",
  },
  {
    q: "¿Puedo probar antes de pagar?",
    a: "Sí. Ofrecemos 14 días de prueba gratuita con acceso completo a todos los módulos del plan elegido. No pedimos tarjeta de crédito para empezar. Los primeros 50 del waitlist reciben 30 días gratis.",
  },
  {
    q: "¿Qué pasa si tengo clínicas en varias provincias?",
    a: "El plan Enterprise incluye multi-sucursal con dashboard consolidado. Cada sede puede tener sus propios financiadores y nomencladores, pero la facturación y reportes se unifican en una sola vista directiva.",
  },
  {
    q: "¿Ofrecen soporte y capacitación?",
    a: "Todos los planes incluyen soporte por WhatsApp en horario extendido (8–22h). Los planes Profesional y Enterprise incluyen onboarding personalizado, capacitación del equipo y un Customer Success Manager dedicado.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 py-20 border-t border-border">
      <div className="max-w-[720px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          Preguntas frecuentes
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-10 leading-[1.2]">
          Todo lo que necesitás saber
        </h2>

        <div className="space-y-1">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-celeste-pale/30 transition"
                >
                  <span className="text-sm font-semibold text-ink pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-[13px] text-ink-light leading-[1.7]">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
