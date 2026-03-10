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
            src="/logos/condor.png"
            alt="Cóndor Salud"
            width={36}
            height={36}
            className="w-9 h-9 object-contain"
          />
          <div className="leading-none">
            <div className="font-bold text-lg text-celeste-dark tracking-[2px]">CÓNDOR</div>
            <div className="text-[11px] font-bold text-gold tracking-[4px] -mt-0.5">S A L U D</div>
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
            href="/dashboard"
            className="px-5 py-2 text-xs font-semibold text-white bg-gold hover:bg-gold-dark rounded-[4px] transition"
          >
            Demo
          </Link>
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
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="px-5 py-2 text-xs font-semibold text-white bg-gold rounded-[4px] text-center"
            >
              Demo
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
