import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-border pt-10 pb-8">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        {/* Top row: brand + nav columns */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-8">
          {/* Brand */}
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Image
              src="/logos/condor-transparent.svg"
              alt="Cóndor Salud"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div className="leading-none">
              <span className="font-bold text-sm text-celeste-dark tracking-[2px] group-hover:text-celeste transition">
                CÓNDOR
              </span>{" "}
              <span className="text-[9px] font-bold text-celeste tracking-[4px]">S A L U D</span>
            </div>
          </Link>

          {/* Nav columns */}
          <div className="flex flex-wrap gap-12 text-[13px]">
            <div className="space-y-2">
              <p className="font-semibold text-ink text-xs uppercase tracking-wider">Producto</p>
              <a
                href="#problema"
                className="block text-ink-light hover:text-celeste-dark transition"
              >
                Problema
              </a>
              <a
                href="#producto"
                className="block text-ink-light hover:text-celeste-dark transition"
              >
                Solución
              </a>
              <a
                href="#pricing"
                className="block text-ink-light hover:text-celeste-dark transition"
              >
                Pricing
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-ink text-xs uppercase tracking-wider">Plataforma</p>
              <Link
                href="/dashboard"
                className="block text-ink-light hover:text-celeste-dark transition"
              >
                Demo
              </Link>
              <a
                href="#waitlist"
                className="block text-ink-light hover:text-celeste-dark transition"
              >
                Waitlist
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-ink text-xs uppercase tracking-wider">Cuenta</p>
              <Link
                href="/auth/login"
                className="block text-ink-light hover:text-celeste-dark transition"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/registro"
                className="block text-ink-light hover:text-celeste-dark transition"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom divider + copyright */}
        <div className="border-t border-border pt-4 text-center">
          <p className="text-[11px] text-ink-muted">
            Plataforma de Inteligencia · Sistema de Salud Argentino · 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
