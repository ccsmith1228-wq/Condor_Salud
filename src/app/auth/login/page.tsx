"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAuth } from "@/lib/auth/context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    const result = await login(data.email, data.password);
    if (result.success) {
      router.push(redirect);
    } else {
      setServerError(result.error || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left - Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-ink text-white flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-12" aria-label="Ir al inicio">
            <Image src="/logos/condor.png" alt="" width={40} height={40} className="rounded-full" />
            <div className="leading-none">
              <span className="text-[13px] font-bold tracking-[0.5px]">CÓNDOR</span>
              <br />
              <span className="text-[9px] font-medium tracking-[4px] text-celeste-light">
                S A L U D
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold leading-tight mb-4">
            Inteligencia financiera para
            <br />
            la <em className="text-celeste not-italic">salud argentina</em>
          </h1>
          <p className="text-base text-white/60 leading-relaxed max-w-md">
            Automatizá facturación, eliminá rechazos y protegé tus ingresos contra la inflación.
            Todo en una sola plataforma.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { stat: "-62%", label: "Rechazos" },
            { stat: "45 días", label: "Cobro más rápido" },
            { stat: "$2.4M", label: "Recupero promedio" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-celeste">{s.stat}</p>
              <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <Link
            href="/"
            className="lg:hidden flex items-center gap-2 mb-8"
            aria-label="Ir al inicio"
          >
            <Image src="/logos/condor.png" alt="" width={36} height={36} className="rounded-full" />
            <div className="leading-none">
              <span className="text-[12px] font-bold tracking-[0.5px] text-ink">CÓNDOR</span>
              <br />
              <span className="text-[8px] font-medium tracking-[4px] text-celeste-dark">
                S A L U D
              </span>
            </div>
          </Link>

          <h2 className="text-2xl font-bold text-ink mb-1">Iniciar sesión</h2>
          <p className="text-sm text-ink-muted mb-8">Ingresá a tu cuenta para acceder al panel</p>

          {serverError && (
            <div
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[4px] text-sm text-red-700"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="tu@clinica.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-celeste-dark"
                />
                <span className="text-xs text-ink-light">Recordarme</span>
              </label>
              <button
                type="button"
                className="text-xs text-celeste-dark font-medium hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full py-3">
              Ingresar
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-xs text-ink-muted">
              ¿No tenés cuenta?{" "}
              <Link
                href="/auth/registro"
                className="text-celeste-dark font-semibold hover:underline"
              >
                Registrate gratis
              </Link>
            </p>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-[10px] text-ink-muted hover:text-celeste-dark transition"
            >
              Volver al sitio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
