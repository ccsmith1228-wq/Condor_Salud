"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isSupabaseConfigured } from "@/lib/env";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    async function verifyEmail() {
      if (!isSupabaseConfigured()) {
        // Demo mode: simulate success
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 3000);
        return;
      }

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Supabase handles the token exchange automatically via the URL hash
        // The onAuthStateChange in AuthProvider will pick up the session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setStatus("success");
          setTimeout(() => router.push("/dashboard"), 3000);
        } else {
          // Wait a bit for the session to be established
          setTimeout(async () => {
            const {
              data: { session: retry },
            } = await supabase.auth.getSession();
            if (retry) {
              setStatus("success");
              setTimeout(() => router.push("/dashboard"), 2000);
            } else {
              setStatus("error");
            }
          }, 2000);
        }
      } catch {
        setStatus("error");
      }
    }

    verifyEmail();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-[400px] text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-10" aria-label="Ir al inicio">
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

        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-celeste-dark animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-ink mb-2">Verificando tu email...</h2>
            <p className="text-sm text-ink-muted">Esto tomará solo un momento</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-ink mb-2">¡Email verificado!</h2>
            <p className="text-sm text-ink-muted mb-6">
              Tu cuenta fue verificada exitosamente. Redirigiendo al panel...
            </p>
            <div className="animate-spin w-6 h-6 border-2 border-celeste-dark border-t-transparent rounded-full mx-auto" />
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-ink mb-2">Error de verificación</h2>
            <p className="text-sm text-ink-muted mb-8">
              El enlace de verificación es inválido o ya expiró. Intentá ingresar a tu cuenta — si
              tu email aún no está verificado, te enviaremos un nuevo enlace.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-celeste-dark text-white font-semibold rounded-[4px] hover:bg-celeste transition"
            >
              Ir a iniciar sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
