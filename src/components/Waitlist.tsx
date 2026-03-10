"use client";
import { useState } from "react";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <section id="waitlist" className="px-6 py-20 bg-ink text-center">
      <div className="max-w-xl mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste-light uppercase mb-2.5">
          Acceso anticipado
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-white mb-4 leading-[1.2]">
          Sumate al waitlist
        </h2>
        <p className="text-[15px] text-ink-muted leading-[1.7] max-w-[500px] mx-auto mb-7">
          Dejá tu email y te avisamos cuando estemos listos para tu clínica. Los primeros 50 reciben
          30 días gratis.
        </p>

        {submitted ? (
          <div className="bg-celeste-dark/20 border border-celeste/30 rounded px-6 py-4">
            <p className="text-celeste-light font-semibold">¡Listo! Te contactamos pronto.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2 max-w-[480px] mx-auto flex-wrap justify-center"
          >
            <input
              type="email"
              required
              placeholder="tu@clinica.com.ar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-3.5 bg-[#111] border border-[#333] text-white text-sm rounded focus:outline-none focus:border-celeste placeholder:text-ink-muted"
              style={{ fontFamily: "inherit" }}
            />
            <button
              type="submit"
              className="px-7 py-3.5 bg-gold text-ink font-bold text-sm rounded hover:bg-[#E5A50D] transition whitespace-nowrap"
              style={{ fontFamily: "inherit" }}
            >
              Quiero acceso
            </button>
          </form>
        )}

        <p className="text-xs text-ink-muted mt-4">
          <strong className="text-celeste-light font-semibold">127</strong> profesionales en la
          lista
        </p>
      </div>
    </section>
  );
}
