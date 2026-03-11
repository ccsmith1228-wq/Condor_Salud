"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Flag stripe */}
      <div className="h-1 flex sticky top-0 z-[100]">
        <div className="flex-1 bg-celeste" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-celeste" />
      </div>

      <nav className="sticky top-1 z-[99] bg-white border-b border-border px-6 lg:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/condor.png"
            alt="Cóndor Salud"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
          <div className="font-display font-bold text-xl">
            <span className="text-celeste-dark">CÓNDOR </span>
            <span className="text-gold">SALUD</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#problema"
            className="text-[13px] font-medium text-ink-light hover:text-celeste-dark transition"
          >
            Problema
          </a>
          <a
            href="#producto"
            className="text-[13px] font-medium text-ink-light hover:text-celeste-dark transition"
          >
            Producto
          </a>
          <a
            href="#pricing"
            className="text-[13px] font-medium text-ink-light hover:text-celeste-dark transition"
          >
            Pricing
          </a>
          <Link
            href="/auth/login"
            className="px-5 py-2 text-xs font-semibold text-celeste-dark border border-celeste-dark hover:bg-celeste-pale rounded-[4px] transition"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/registro"
            className="px-5 py-2 text-xs font-semibold text-white bg-celeste-dark hover:bg-celeste rounded-[4px] transition"
          >
            Probá gratis
          </Link>
          <Link
            href="/paciente"
            className="px-5 py-2 text-xs font-semibold text-celeste-dark border border-celeste rounded-[4px] hover:bg-celeste-pale transition"
          >
            Portal Paciente
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2 text-xs font-semibold text-white bg-celeste hover:bg-celeste-dark rounded-[4px] transition"
          >
            Demo
          </Link>
          <a
            href="https://wa.me/5491112345678?text=Hola%2C%20me%20interesa%20una%20demo%20de%20C%C3%B3ndor%20Salud%20para%20mi%20cl%C3%ADnica.%20%C2%BFPodemos%20coordinar%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20BD5A] rounded-[4px] transition flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2" aria-label="Menu">
          <div className="space-y-1.5">
            <span
              className={`block w-6 h-0.5 bg-ink transition-transform ${open ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-ink transition-transform ${open ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </div>
        </button>

        {/* Mobile menu */}
        {open && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-border p-6 flex flex-col gap-4 md:hidden">
            <a
              href="#problema"
              onClick={() => setOpen(false)}
              className="text-[13px] font-medium text-ink-light"
            >
              Problema
            </a>
            <a
              href="#producto"
              onClick={() => setOpen(false)}
              className="text-[13px] font-medium text-ink-light"
            >
              Producto
            </a>
            <a
              href="#pricing"
              onClick={() => setOpen(false)}
              className="text-[13px] font-medium text-ink-light"
            >
              Pricing
            </a>
            <a
              href="#waitlist"
              onClick={() => setOpen(false)}
              className="px-5 py-2 text-xs font-semibold text-white bg-celeste-dark rounded-[4px] text-center"
            >
              Sumate al waitlist
            </a>
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="px-5 py-2 text-xs font-semibold text-celeste-dark border border-celeste-dark rounded-[4px] text-center"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/paciente"
              onClick={() => setOpen(false)}
              className="px-5 py-2 text-xs font-semibold text-celeste-dark border border-celeste rounded-[4px] text-center"
            >
              Portal Paciente
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="px-5 py-2 text-xs font-semibold text-white bg-celeste rounded-[4px] text-center"
            >
              Demo
            </Link>
            <a
              href="https://wa.me/5491112345678?text=Hola%2C%20me%20interesa%20una%20demo%20de%20C%C3%B3ndor%20Salud%20para%20mi%20cl%C3%ADnica.%20%C2%BFPodemos%20coordinar%3F"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#25D366] rounded-[4px] text-center flex items-center justify-center gap-1.5"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Demo
            </a>
          </div>
        )}
      </nav>
    </>
  );
}
