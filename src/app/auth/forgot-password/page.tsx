"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isSupabaseConfigured } from "@/lib/env";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const schema = z.object({
  email: z.string().email("Ingresá un email válido"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");

    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
          // Don't reveal whether the email exists
          if (error.message.includes("rate limit")) {
            setServerError("Demasiados intentos. Esperá un momento.");
            return;
          }
        }

        // Always show success (security: don't reveal if email exists)
        setSent(true);
      } catch {
        setServerError("Error de conexión. Intentá de nuevo.");
      }
    } else {
      // Demo mode: just simulate success
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left - Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-celeste-50 flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #75AADB 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-12" aria-label="Ir al inicio">
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
          <h1 className="text-3xl font-bold leading-tight mb-4 text-ink">
            Recuperá tu acceso
            <br />
            en <em className="text-celeste-dark not-italic">segundos</em>
          </h1>
          <p className="text-base text-ink-light leading-relaxed max-w-md">
            Te enviaremos un enlace seguro para restablecer tu contraseña. Revisá tu bandeja de
            entrada y la carpeta de spam.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { stat: "256-bit", label: "Encriptación" },
            { stat: "10 min", label: "Enlace válido" },
            { stat: "1 click", label: "Recuperación" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-celeste-dark">{s.stat}</p>
              <p className="text-xs text-ink-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <Link
            href="/"
            className="lg:hidden flex items-center gap-2 mb-8"
            aria-label="Ir al inicio"
          >
            <Image
              src="/condor.png"
              alt="Cóndor Salud"
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
            />
            <div className="font-display font-bold text-lg">
              <span className="text-celeste-dark">CÓNDOR </span>
              <span className="text-gold">SALUD</span>
            </div>
          </Link>

          {!sent ? (
            <>
              <h2 className="text-2xl font-bold text-ink mb-1">¿Olvidaste tu contraseña?</h2>
              <p className="text-sm text-ink-muted mb-8">
                Ingresá tu email y te enviaremos un enlace para restablecerla
              </p>

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
                <Button type="submit" loading={isSubmitting} className="w-full py-3">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar enlace de recuperación
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-ink mb-2">¡Email enviado!</h2>
              <p className="text-sm text-ink-muted mb-2">
                Si existe una cuenta con{" "}
                <span className="font-semibold text-ink">{getValues("email")}</span>, recibirás un
                enlace para restablecer tu contraseña.
              </p>
              <p className="text-xs text-ink-muted mb-8">
                Revisá tu bandeja de entrada y la carpeta de spam. El enlace expira en 10 minutos.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-celeste-dark font-medium hover:underline"
              >
                ¿No recibiste el email? Reenviar
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <Link
              href="/auth/login"
              className="flex items-center gap-2 text-sm text-ink-muted hover:text-celeste-dark transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
