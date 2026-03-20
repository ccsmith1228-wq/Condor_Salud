"use client";

// ─── Payment Page ────────────────────────────────────────────
// MercadoPago checkout via iframe/redirect.
// Ported from frontend/src/screens/PaymentScreen.tsx (WebView → iframe).

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CreditCard, CheckCircle2, XCircle, Clock, Loader2, ArrowLeft, Shield } from "lucide-react";

type PaymentState = "loading" | "checkout" | "success" | "failure" | "pending";

export default function PagoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = searchParams.get("bookingId") || "";
  const [state, setState] = useState<PaymentState>("loading");
  const [initPoint, setInitPoint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're returning from MercadoPago
    const status = searchParams.get("status") || searchParams.get("collection_status");
    if (status === "approved") {
      setState("success");
      return;
    }
    if (status === "rejected" || status === "cancelled") {
      setState("failure");
      return;
    }
    if (status === "pending" || status === "in_process") {
      setState("pending");
      return;
    }

    // If we have a bookingId, fetch the payment preference
    if (bookingId) {
      fetchPaymentInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  async function fetchPaymentInfo() {
    try {
      const token = localStorage.getItem("condor_patient_token");
      const res = await fetch(`/api/payments/booking/${bookingId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        if (data.initPoint) {
          setInitPoint(data.initPoint);
          setState("checkout");
          return;
        }
      }

      // No existing payment — might need to create one via preference
      setError("No se encontró información de pago para este turno.");
      setState("failure");
    } catch {
      setError("Error al cargar la información de pago");
      setState("failure");
    }
  }

  if (state === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-celeste" />
          <p className="mt-3 text-sm text-gray-500">Cargando pago...</p>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">¡Pago exitoso!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Tu turno ha sido confirmado. Recibirás un email con los detalles.
          </p>
          <button
            onClick={() => router.push("/paciente/turnos")}
            className="mt-6 w-full rounded-xl bg-celeste px-4 py-3 text-sm font-semibold text-white transition hover:bg-celeste-dark"
          >
            Ver mis turnos
          </button>
        </div>
      </div>
    );
  }

  if (state === "failure") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Pago no procesado</h2>
          <p className="mt-2 text-sm text-gray-500">
            {error || "Hubo un problema con tu pago. Podés intentar nuevamente."}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700"
            >
              Volver
            </button>
            <button
              onClick={() => {
                setState("loading");
                fetchPaymentInfo();
              }}
              className="flex-1 rounded-xl bg-celeste px-4 py-3 text-sm font-semibold text-white"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "pending") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <Clock className="mx-auto h-16 w-16 text-amber-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Pago pendiente</h2>
          <p className="mt-2 text-sm text-gray-500">
            Tu pago está siendo procesado. Te notificaremos cuando se confirme.
          </p>
          <button
            onClick={() => router.push("/paciente/turnos")}
            className="mt-6 w-full rounded-xl bg-celeste px-4 py-3 text-sm font-semibold text-white transition hover:bg-celeste-dark"
          >
            Ver mis turnos
          </button>
        </div>
      </div>
    );
  }

  // state === "checkout" — show MercadoPago checkout
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="rounded-2xl bg-white shadow-lg">
        <div className="flex items-center gap-3 border-b border-gray-100 p-4">
          <CreditCard className="h-5 w-5 text-celeste" />
          <h1 className="text-lg font-bold text-gray-900">Pagar consulta</h1>
        </div>

        {initPoint ? (
          <div className="p-0">
            <iframe
              src={initPoint}
              className="h-[600px] w-full rounded-b-2xl border-0"
              title="MercadoPago Checkout"
              allow="payment"
            />
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3">
          <Shield className="h-4 w-4 text-green-500" />
          <span className="text-xs text-gray-400">Pago seguro procesado por MercadoPago</span>
        </div>
      </div>
    </div>
  );
}
