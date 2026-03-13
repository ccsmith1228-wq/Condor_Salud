"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, Users, Shield, Clock } from "lucide-react";

const benefits = [
  { icon: Clock, text: "Los primeros 50 reciben 30 días gratis" },
  { icon: Shield, text: "Sin tarjeta de crédito" },
  { icon: Users, text: "Onboarding personalizado incluido" },
];

const socialProof = [
  "Centro Médico Palermo — CABA",
  "Clínica San Martín — Córdoba",
  "Instituto del Sur — Bahía Blanca",
  "Sanatorio del Norte — Tucumán",
  "Centro Integral — Mendoza",
];

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <section id="waitlist" className="px-6 py-20 bg-ink">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold tracking-[2px] text-celeste-light uppercase mb-2.5">
            Acceso anticipado
          </p>
          <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-white mb-4 leading-[1.2]">
            Sumate al waitlist y sé de los primeros
          </h2>
          <p className="text-[15px] text-ink-muted leading-[1.7] max-w-[520px] mx-auto">
            Dejá tus datos y te contactamos cuando tengamos un lugar para tu clínica. Los primeros
            50 del waitlist arrancan con 30 días de acceso completo, sin costo.
          </p>
        </div>

        {/* Benefits row */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {benefits.map((b) => (
            <div key={b.text} className="flex items-center gap-2">
              <b.icon className="w-4 h-4 text-celeste-light" />
              <span className="text-xs text-celeste-light/80 font-medium">{b.text}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        {submitted ? (
          <div className="bg-celeste-dark/20 border border-celeste/30 rounded-xl px-6 py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-celeste-dark/30 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-celeste-light" />
            </div>
            <p className="text-celeste-light font-semibold text-lg">¡Listo! Estás en la lista.</p>
            <p className="text-sm text-ink-muted mt-2">
              Te contactamos dentro de 48 horas para coordinar el onboarding de tu clínica.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 px-6 py-2.5 text-sm font-semibold text-celeste-dark bg-white rounded-[4px] hover:bg-celeste-pale transition"
            >
              Mientras tanto, explorá el demo
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-3"
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#1A1A1A] border border-[#333] text-white text-sm rounded focus:outline-none focus:border-celeste placeholder:text-ink-muted"
              />
              <input
                type="email"
                required
                placeholder="tu@clinica.com.ar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#1A1A1A] border border-[#333] text-white text-sm rounded focus:outline-none focus:border-celeste placeholder:text-ink-muted"
              />
            </div>
            <button
              type="submit"
              className="w-full px-7 py-3.5 bg-gold text-ink font-bold text-sm rounded hover:bg-[#E5A50D] transition"
            >
              Quiero acceso anticipado
            </button>
            <p className="text-[10px] text-ink-muted text-center">
              Al registrarte aceptás nuestros{" "}
              <Link href="/terminos" className="text-celeste-light/60 underline">
                Términos
              </Link>{" "}
              y{" "}
              <Link href="/privacidad" className="text-celeste-light/60 underline">
                Política de Privacidad
              </Link>
            </p>
          </form>
        )}

        {/* Counter + social proof */}
        <div className="mt-8 text-center">
          <p className="text-sm text-ink-muted mb-3">
            <strong className="text-celeste-light font-semibold text-lg">127</strong>{" "}
            <span className="text-ink-muted">profesionales ya están en la lista</span>
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {socialProof.map((clinic) => (
              <span key={clinic} className="text-[10px] text-ink-muted/60">
                {clinic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
