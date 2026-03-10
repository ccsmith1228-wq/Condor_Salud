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
            <Image src="/logos/condor-transparent.svg" alt="" width={40} height={40} className="" />
            <div className="leading-none">
              <span className="text-[13px] font-bold tracking-[0.5px]">CÓNDOR</span>
              <br />
              <span className="text-[9px] font-medium tracking-[4px] text-celeste-light">
                S A L U D
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold leading-tight mb-4">
            Empezá a proteger tus
            <br />
            <em className="text-gold not-italic">ingresos hoy</em>
          </h1>
          <p className="text-base text-white/60 leading-relaxed max-w-md">
            Más de 120 clínicas en Argentina ya usan Cóndor Salud para automatizar su facturación y
            reducir rechazos.
          </p>
        </div>
        <div className="relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
            <p className="text-sm text-white/80 italic leading-relaxed">
              &ldquo;Desde que implementamos Cóndor, redujimos los rechazos de PAMI un 62% y
              cobramos 45 días antes.&rdquo;
            </p>
            <p className="text-xs text-white/40 mt-3">— Dra. Fernández, Centro Médico Palermo</p>
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
            <Image src="/logos/condor-transparent.svg" alt="" width={36} height={36} className="" />
            <div className="leading-none">
              <span className="text-[12px] font-bold tracking-[0.5px] text-ink">CÓNDOR</span>
              <br />
              <span className="text-[8px] font-medium tracking-[4px] text-celeste-dark">
                S A L U D
              </span>
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
