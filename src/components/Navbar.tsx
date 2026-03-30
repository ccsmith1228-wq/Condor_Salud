"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { locale, toggleLocale, t, segment } = useLocale();

  const isTourist = segment === "tourist";

  // Segment-aware nav links
  const navLinks = isTourist
    ? [
        { href: "/paciente/medicos", label: t("nav.doctors") },
        { href: "/paciente/teleconsulta", label: t("nav.teleconsult") },
        { href: "/paciente/medicamentos", label: t("nav.pharmacy") },
        { href: "/paciente/cobertura", label: t("nav.coverage") },
        { href: "/club", label: t("nav.healthClub") },
      ]
    : [
        { href: "/#problema", label: t("nav.problem") },
        { href: "/#producto", label: t("nav.product") },
        { href: "/planes", label: t("nav.plans") },
        { href: "/club", label: t("nav.healthClub") },
      ];

  // Segment-aware primary CTA
  const primaryCta = isTourist
    ? { href: "/paciente", label: t("nav.patient") }
    : { href: "/auth/registro", label: t("nav.try") };

  return (
    <>
      {/* Flag stripe */}
      <div className="h-1 flex sticky top-0 z-[100]">
        <div className="flex-1 bg-celeste" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-celeste" />
      </div>

      <nav
        aria-label={t("nav.aria")}
        className="sticky top-1 z-[99] bg-white/80 backdrop-blur-md border-b border-border/60 px-6 lg:px-10 py-3 flex items-center justify-between"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/condor.png"
            alt="Cóndor Salud"
            width={36}
            height={36}
            className="w-9 h-9 object-contain"
          />
          <div className="font-display font-bold text-lg leading-tight">
            <span className="text-celeste-dark">CÓNDOR </span>
            <span className="text-gold-dark">SALUD</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {/* Nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-[13px] font-medium text-ink-light hover:text-celeste-dark rounded-lg hover:bg-celeste-pale/50 transition"
            >
              {link.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-2" />

          {/* Language toggle */}
          <button
            type="button"
            onClick={toggleLocale}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 text-[12px] font-semibold text-ink-muted hover:text-celeste-dark rounded-lg hover:bg-celeste-pale/50 transition"
            aria-label={locale === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            <Globe className="w-3.5 h-3.5" />
            {locale === "es" ? "EN" : "ES"}
          </button>

          {/* Secondary CTA */}
          <Link
            href={isTourist ? "/demo" : "/auth/login"}
            className="px-4 py-2 text-[13px] font-medium text-ink-light hover:text-celeste-dark rounded-lg hover:bg-celeste-pale/50 transition"
          >
            {isTourist ? t("nav.demo") : t("nav.login")}
          </Link>

          {/* Primary CTA */}
          <Link
            href={primaryCta.href}
            className="ml-1 px-5 py-2 text-[13px] font-semibold text-white bg-celeste-dark hover:bg-celeste rounded-full transition shadow-sm"
          >
            {primaryCta.label}
          </Link>
        </div>

        {/* Mobile: lang + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleLocale}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted hover:text-celeste-dark rounded-lg transition"
            aria-label={locale === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            <Globe className="w-3.5 h-3.5" />
            {locale === "es" ? "EN" : "ES"}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-surface transition"
            aria-label={t("nav.menuAria")}
            aria-expanded={open ? "true" : "false"}
          >
            <div className="space-y-1.5">
              <span
                className={`block w-5 h-0.5 bg-ink rounded-full transition-transform duration-200 ${open ? "rotate-45 translate-y-[4px]" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-ink rounded-full transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-ink rounded-full transition-transform duration-200 ${open ? "-rotate-45 -translate-y-[4px]" : ""}`}
              />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-border/60 p-5 flex flex-col gap-1 md:hidden animate-segmentFade">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-[14px] font-medium text-ink-light hover:text-celeste-dark rounded-xl hover:bg-celeste-pale/50 transition"
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-border/60 my-2" />

            <Link
              href={isTourist ? "/demo" : "/auth/login"}
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-[14px] font-medium text-ink-light hover:text-celeste-dark rounded-xl hover:bg-celeste-pale/50 transition"
            >
              {isTourist ? t("nav.demo") : t("nav.login")}
            </Link>

            <Link
              href={primaryCta.href}
              onClick={() => setOpen(false)}
              className="mx-2 mt-1 px-5 py-3 text-[14px] font-semibold text-white bg-celeste-dark hover:bg-celeste rounded-full text-center transition shadow-sm"
            >
              {primaryCta.label}
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
