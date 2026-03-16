"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, Users, Shield, Clock, Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

// UM-01: Strict email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // U-01
  const [error, setError] = useState<string | null>(null); // D-02
  const { t } = useLocale();

  const benefits = [
    { icon: Clock, text: t("wl.benefit0") },
    { icon: Shield, text: t("wl.benefit1") },
    { icon: Users, text: t("wl.benefit2") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // UM-01: Client-side email validation
    if (!email || !EMAIL_REGEX.test(email)) {
      setError(t("wl.emailError"));
      return;
    }

    setLoading(true); // U-01
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        // D-02: Don't set submitted=true on error
        const data = await res.json().catch(() => ({}));
        setError(data.error || t("wl.apiError"));
      }
    } catch {
      // D-02: Show error instead of silently succeeding
      setError(t("wl.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="px-6 py-20 bg-celeste-pale/30 border-t border-border">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
            {t("wl.label")}
          </p>
          <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
            {t("wl.title")}
          </h2>
          <p className="text-[15px] text-ink-muted leading-[1.7] max-w-[520px] mx-auto">
            {t("wl.subtitle")}
          </p>
        </div>

        {/* Benefits row */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {benefits.map((b) => (
            <div key={b.text} className="flex items-center gap-2">
              <b.icon className="w-4 h-4 text-celeste-dark" aria-hidden="true" />
              <span className="text-xs text-ink-muted font-medium">{b.text}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        {submitted ? (
          <div className="bg-celeste-pale border border-celeste/30 rounded-xl px-6 py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-celeste-dark/20 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-celeste-dark" aria-hidden="true" />
            </div>
            <p className="text-celeste-dark font-semibold text-lg">{t("wl.successTitle")}</p>
            <p className="text-sm text-ink-muted mt-2">{t("wl.successSub")}</p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 px-6 py-2.5 text-sm font-semibold text-celeste-dark bg-white rounded-[4px] hover:bg-celeste-pale transition"
            >
              {t("wl.successCta")}
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-border rounded-xl p-6 space-y-3 shadow-sm"
            noValidate
          >
            {/* D-02: Error banner */}
            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3"
              >
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              {/* A-04: Proper labels */}
              <div>
                <label htmlFor="waitlist-name" className="sr-only">
                  {t("wl.namePlaceholder")}
                </label>
                <input
                  id="waitlist-name"
                  type="text"
                  placeholder={t("wl.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-surface border border-border text-ink text-sm rounded focus:outline-none focus:border-celeste focus:ring-1 focus:ring-celeste placeholder:text-ink-muted"
                />
              </div>
              <div>
                <label htmlFor="waitlist-email" className="sr-only">
                  Email
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  placeholder="tu@clinica.com.ar"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  aria-invalid={error ? "true" : undefined}
                  aria-describedby={error ? "waitlist-error" : undefined}
                  className="w-full px-4 py-3.5 bg-surface border border-border text-ink text-sm rounded focus:outline-none focus:border-celeste focus:ring-1 focus:ring-celeste placeholder:text-ink-muted"
                />
              </div>
            </div>
            {/* U-01: Loading state */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-7 py-3.5 bg-celeste-dark text-white font-bold text-sm rounded hover:bg-celeste transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {loading ? t("wl.loading") : t("wl.submit")}
            </button>
            <p className="text-[10px] text-ink-muted text-center">
              {t("wl.legal1")}
              <Link href="/terminos" className="text-celeste-dark underline">
                {t("wl.legalTerms")}
              </Link>
              {t("wl.legalAnd")}
              <Link href="/privacidad" className="text-celeste-dark underline">
                {t("wl.legalPrivacy")}
              </Link>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
