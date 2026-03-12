"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { useAuth } from "@/lib/auth/context";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { GOOGLE_CLIENT_ID } from "@/lib/google";

const PROVINCIAS = [
  { value: "CABA", label: "CABA" },
  { value: "Buenos Aires", label: "Buenos Aires" },
  { value: "Córdoba", label: "Córdoba" },
  { value: "Santa Fe", label: "Santa Fe" },
  { value: "Mendoza", label: "Mendoza" },
  { value: "Tucumán", label: "Tucumán" },
  { value: "Otra", label: "Otra" },
];

const ESPECIALIDADES = [
  { value: "clinica_medica", label: "Clínica Médica" },
  { value: "cardiologia", label: "Cardiología" },
  { value: "traumatologia", label: "Traumatología" },
  { value: "pediatria", label: "Pediatría" },
  { value: "diagnostico_imagen", label: "Diagnóstico por Imagen" },
  { value: "laboratorio", label: "Laboratorio" },
  { value: "multiespecialidad", label: "Multiespecialidad" },
  { value: "otra", label: "Otra" },
];

const FINANCIADORES_LIST = [
  "PAMI",
  "OSDE",
  "Swiss Medical",
  "Galeno",
  "Medifé",
  "IOMA",
  "Sancor Salud",
  "Otro",
];

export default function RegistroPage() {
  const router = useRouter();
  const { register: authRegister } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      clinicName: "",
      cuit: "",
      provincia: "",
      especialidad: "",
      financiadores: [],
      terms: false as unknown as true,
    },
  });

  const selectedFin = watch("financiadores");
  const toggleFin = (f: string) => {
    const cur = selectedFin || [];
    setValue("financiadores", cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f], {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: RegisterInput) => {
    setServerError("");
    const result = await authRegister({
      name: data.name,
      email: data.email,
      password: data.password,
      clinicName: data.clinicName,
      cuit: data.cuit,
      provincia: data.provincia,
      especialidad: data.especialidad,
      financiadores: data.financiadores,
    });
    if (result.success) router.push("/dashboard");
    else setServerError(result.error || "Error al crear la cuenta");
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left brand panel */}
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
            Empezá a proteger tus
            <br />
            <em className="text-amber-600 not-italic">ingresos hoy</em>
          </h1>
          <p className="text-base text-ink-light leading-relaxed max-w-md">
            Más de 120 clínicas en Argentina ya usan Cóndor Salud para automatizar su facturación y
            reducir rechazos.
          </p>
        </div>
        <div className="relative z-10">
          <div className="bg-celeste-100/50 border border-celeste/20 rounded-lg p-5">
            <p className="text-sm text-ink-light italic leading-relaxed">
              &ldquo;Desde que implementamos Cóndor, redujimos los rechazos de PAMI un 62% y
              cobramos 45 días antes.&rdquo;
            </p>
            <p className="text-xs text-ink-muted mt-3">— Dra. Fernández, Centro Médico Palermo</p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px]">
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

          <h2 className="text-2xl font-bold text-ink mb-1">Crear cuenta</h2>
          <p className="text-sm text-ink-muted mb-6">
            Probá Cóndor Salud gratis por 14 días. Sin tarjeta.
          </p>

          {serverError && (
            <div
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[4px] text-sm text-red-700"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombre completo"
                placeholder="Martín Rodríguez"
                autoComplete="name"
                error={errors.name?.message}
                {...register("name")}
              />
              <Input
                label="Email profesional"
                type="email"
                placeholder="tu@clinica.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
            <Input
              label="Nombre de la clínica"
              placeholder="Centro Médico San Martín"
              error={errors.clinicName?.message}
              {...register("clinicName")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="CUIT"
                placeholder="30-12345678-9"
                error={errors.cuit?.message}
                {...register("cuit")}
              />
              <Select
                label="Provincia"
                options={PROVINCIAS}
                placeholder="Seleccionar"
                error={errors.provincia?.message}
                {...register("provincia")}
              />
            </div>
            <Select
              label="Especialidad principal"
              options={ESPECIALIDADES}
              placeholder="Seleccionar"
              error={errors.especialidad?.message}
              {...register("especialidad")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Contraseña"
                type="password"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <Input
                label="Confirmar contraseña"
                type="password"
                placeholder="Repetí"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Financiadores principales
              </label>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Financiadores">
                {FINANCIADORES_LIST.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFin(f)}
                    className={`px-2.5 py-1.5 border rounded-[4px] text-xs transition ${selectedFin?.includes(f) ? "border-celeste-dark bg-celeste-pale text-celeste-dark font-semibold" : "border-border text-ink-light hover:border-celeste-dark"}`}
                    aria-pressed={selectedFin?.includes(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {errors.financiadores?.message && (
                <p className="text-xs text-red-600 mt-1" role="alert">
                  {errors.financiadores.message}
                </p>
              )}
            </div>
            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border text-celeste-dark mt-0.5"
                {...register("terms")}
              />
              <span className="text-[10px] text-ink-muted leading-relaxed">
                Acepto los{" "}
                <Link href="/terminos" className="text-celeste-dark underline">
                  Términos de Servicio
                </Link>{" "}
                y la{" "}
                <Link href="/privacidad" className="text-celeste-dark underline">
                  Política de Privacidad
                </Link>
              </span>
            </label>
            {errors.terms?.message && (
              <p className="text-xs text-red-600" role="alert">
                {errors.terms.message}
              </p>
            )}
            <Button type="submit" loading={isSubmitting} className="w-full py-3 mt-2">
              Crear cuenta gratis
            </Button>
          </form>

          {/* Google Sign-Up divider + button */}
          <div className="flex items-center gap-3 my-4">
            <span className="flex-1 h-px bg-border" />
            <span className="text-xs text-ink-muted">o registrate con</span>
            <span className="flex-1 h-px bg-border" />
          </div>
          <button
            type="button"
            onClick={() => {
              const redirect = `${window.location.origin}/api/auth/google/callback`;
              const params = new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID,
                redirect_uri: redirect,
                response_type: "code",
                scope:
                  "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
                access_type: "offline",
                prompt: "consent",
                state: "/dashboard",
              });
              window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-border rounded-[4px] text-sm font-medium text-ink hover:bg-ink-50 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Registrarse con Google
          </button>

          <div className="mt-5 pt-5 border-t border-border text-center">
            <p className="text-xs text-ink-muted">
              ¿Ya tenés cuenta?{" "}
              <Link href="/auth/login" className="text-celeste-dark font-semibold hover:underline">
                Iniciá sesión
              </Link>
            </p>
          </div>
          <div className="mt-6 text-center">
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
