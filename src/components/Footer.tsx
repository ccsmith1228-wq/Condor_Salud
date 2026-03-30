"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/lib/i18n/context";

// L-01: Dynamic copyright year

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-border pt-10 pb-8" aria-label={t("aria.siteFooter")}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        {/* Brand — centered */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Image
              src="/condor.png"
              alt="Cóndor Salud"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
            />
            <div className="font-display font-bold text-lg">
              <span className="text-celeste-dark group-hover:text-celeste transition">CÓNDOR </span>
              <span className="text-gold-dark">SALUD</span>
            </div>
          </Link>
        </div>

        {/* Nav columns — centered */}
        <nav
          aria-label={t("aria.footerNav")}
          className="flex flex-wrap justify-center gap-12 text-[13px] mb-8"
        >
          <div className="space-y-2">
            <p className="font-semibold text-ink text-xs uppercase tracking-wider">
              {t("footer.colSolution")}
            </p>
            <Link
              href="/#problema"
              className="block text-ink-light hover:text-celeste-dark transition"
            >
              {t("footer.problem")}
            </Link>
            <Link
              href="/#producto"
              className="block text-ink-light hover:text-celeste-dark transition"
            >
              {t("footer.solution")}
            </Link>
            <Link
              href="/planes"
              className="block text-ink-light hover:text-celeste-dark transition"
            >
              {t("footer.plans")}
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-ink text-xs uppercase tracking-wider">
              {t("footer.colPlatform")}
            </p>
            <Link href="/demo" className="block text-ink-light hover:text-celeste-dark transition">
              {t("footer.demo")}
            </Link>
            <Link
              href="/paciente"
              className="block text-ink-light hover:text-celeste-dark transition"
            >
              {t("footer.patient")}
            </Link>
            <Link
              href="/medicos"
              className="block text-ink-light hover:text-celeste-dark transition"
            >
              {t("footer.doctors")}
            </Link>
            <Link
              href="/#waitlist"
              className="block text-ink-light hover:text-celeste-dark transition"
            >
              {t("footer.waitlist")}
            </Link>
            <Link
              href="/partnerships"
              className="block text-ink-light hover:text-celeste-dark transition"
            >
              {t("footer.partners")}
            </Link>
            <Link
              href="/medicos/partner"
              className="block text-ink-light hover:text-celeste-dark transition"
            >
              {t("footer.doctorPartner")}
            </Link>
            <Link href="/club" className="block text-ink-light hover:text-celeste-dark transition">
              {t("footer.healthClub")}
            </Link>
            <Link href="/acs" className="block text-ink-light hover:text-celeste-dark transition">
              {t("footer.embassy")}
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-ink text-xs uppercase tracking-wider">
              {t("footer.colAccount")}
            </p>
            <Link
              href="/auth/login"
              className="block text-ink-light hover:text-celeste-dark transition"
            >
              {t("footer.login")}
            </Link>
            <Link
              href="/auth/registro"
              className="block text-ink-light hover:text-celeste-dark transition"
            >
              {t("footer.register")}
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-ink text-xs uppercase tracking-wider">
              {t("footer.colLegal")}
            </p>
            <Link
              href="/privacidad"
              className="block text-ink-light hover:text-celeste-dark transition"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/terminos"
              className="block text-ink-light hover:text-celeste-dark transition"
            >
              {t("footer.terms")}
            </Link>
          </div>
        </nav>

        {/* Bottom divider + copyright */}
        <div className="border-t border-border pt-4 text-center">
          <p className="text-[11px] text-ink-muted">
            {t("footer.copy")} {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
