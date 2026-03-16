"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isSupabaseConfigured } from "@/lib/env";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";

const schema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  // Check if user arrived via the reset link (Supabase sets a session)
  useEffect(() => {
    async function checkSession() {
      if (!isSupabaseConfigured()) {
        setHasSession(true); // Demo mode: allow
        return;
      }
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setHasSession(!!session);
      } catch {
        setHasSession(false);
      }
    }
    checkSession();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: FormData) => {
    setServerError("");

    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
          password: data.password,
        });

        if (error) {
          if (error.message.includes("same password")) {
            setServerError("La nueva contraseña debe ser diferente a la anterior.");
            return;
          }
          if (error.message.includes("Password should be")) {
            setServerError("La contraseña debe tener al menos 8 caracteres.");
            return;
          }
          setServerError(error.message);
          return;
        }

        setSuccess(true);
        // Redirect to dashboard after 3 seconds
        setTimeout(() => router.push("/dashboard"), 3000);
      } catch {
        setServerError("Error de conexión. Intentá de nuevo.");
      }
    } else {
      // Demo mode
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 3000);
    }
  };

  // Loading state
  if (hasSession === null) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-celeste-dark border-t-transparent rounded-full" />
      </div>
    );
  }

  // No session = invalid/expired link
  if (!hasSession) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-ink mb-2">Enlace expirado</h2>
          <p className="text-sm text-ink-muted mb-8">
            Este enlace de recuperación ya expiró o no es válido. Solicitá uno nuevo.
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-2 px-6 py-3 bg-celeste-dark text-white font-semibold rounded-[4px] hover:bg-celeste transition"
          >
            Solicitar nuevo enlace
          </Link>
          <div className="mt-4">
            <Link
              href="/auth/login"
              className="text-sm text-ink-muted hover:text-celeste-dark transition"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            Elegí una nueva
            <br />
            <em className="text-celeste-dark not-italic">contraseña segura</em>
          </h1>
          <p className="text-base text-ink-light leading-relaxed max-w-md">
            Tu contraseña debe tener al menos 8 caracteres. Recomendamos usar letras, números y
            caracteres especiales.
          </p>
        </div>
        <div className="relative z-10 flex gap-6">
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Lock className="w-4 h-4 text-celeste-dark" />
            <span>8+ caracteres</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Lock className="w-4 h-4 text-celeste-dark" />
            <span>Encriptación AES-256</span>
          </div>
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

          {!success ? (
            <>
              <h2 className="text-2xl font-bold text-ink mb-1">Nueva contraseña</h2>
              <p className="text-sm text-ink-muted mb-8">
                Elegí una contraseña segura para tu cuenta
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
                  label="Nueva contraseña"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <Input
                  label="Confirmar contraseña"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
                <Button type="submit" loading={isSubmitting} className="w-full py-3">
                  <Lock className="w-4 h-4 mr-2" />
                  Cambiar contraseña
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-ink mb-2">¡Contraseña actualizada!</h2>
              <p className="text-sm text-ink-muted mb-6">
                Tu contraseña fue cambiada exitosamente. Redirigiendo al panel...
              </p>
              <div className="animate-spin w-6 h-6 border-2 border-celeste-dark border-t-transparent rounded-full mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
