"use client";

import { useState, useCallback, useEffect } from "react";
import { Shield, Upload, CheckCircle, Clock, AlertCircle, FileText, Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

// ─── Types ───────────────────────────────────────────────────

interface VerificationStatus {
  id: string;
  status: "pending" | "approved" | "rejected" | "needs_review";
  matriculaNacional?: string;
  matriculaProvincial?: string;
  rejectionReason?: string;
  submittedAt: string;
  documents: { id: string; type: string; fileName: string }[];
}

// ─── Helpers ─────────────────────────────────────────────────

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    label: "En Revisión",
    description: "Tu solicitud está siendo revisada por nuestro equipo.",
  },
  approved: {
    icon: CheckCircle,
    color: "text-green-600 bg-green-50 border-green-200",
    label: "Verificado",
    description: "Tu perfil ha sido verificado exitosamente.",
  },
  rejected: {
    icon: AlertCircle,
    color: "text-red-600 bg-red-50 border-red-200",
    label: "Rechazado",
    description: "Tu solicitud fue rechazada. Por favor revisa los motivos e intenta nuevamente.",
  },
  needs_review: {
    icon: AlertCircle,
    color: "text-orange-600 bg-orange-50 border-orange-200",
    label: "Requiere Corrección",
    description: "Se necesitan documentos adicionales o correcciones.",
  },
};

// ─── No demo data – real verification status comes from API ──

// ─── Main Component ──────────────────────────────────────────

export default function VerificarCuentaPage() {
  const { locale } = useLocale();
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [matriculaNacional, setMatriculaNacional] = useState("");
  const [matriculaProvincial, setMatriculaProvincial] = useState("");
  const [dni, setDni] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // Check current status on load
  const checkStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doctors/verification/status");
      if (res.ok) {
        const data = await res.json();
        if (data.verification) {
          setVerification(data.verification);
        }
      }
    } catch {
      // No existing verification
    } finally {
      setLoading(false);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    checkStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matriculaNacional && !matriculaProvincial) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/doctors/verification/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matriculaNacional: matriculaNacional || undefined,
          matriculaProvincial: matriculaProvincial || undefined,
          dni: dni || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al enviar");
        return;
      }

      const data = await res.json();

      // Upload documents if any
      if (files.length > 0 && data.verification?.id) {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("verificationId", data.verification.id);
          formData.append("type", "matricula");
          await fetch("/api/doctors/verification/upload", {
            method: "POST",
            body: formData,
          });
        }
      }

      await checkStatus();
    } catch {
      alert("Error al enviar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-celeste" />
      </div>
    );
  }

  // ─── Existing Verification Status ────────────────────────

  if (verification) {
    const cfg = statusConfig[verification.status];
    const Icon = cfg.icon;

    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-celeste mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-ink">Verificación de Cuenta</h1>
        </div>

        <div className={`rounded-xl border p-6 ${cfg.color}`}>
          <div className="flex items-start gap-4">
            <Icon className="w-8 h-8 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold">{cfg.label}</h2>
              <p className="mt-1 opacity-80">{cfg.description}</p>

              {verification.rejectionReason && (
                <div className="mt-4 p-3 bg-white/60 rounded-lg">
                  <p className="text-sm font-medium">Motivo:</p>
                  <p className="text-sm">{verification.rejectionReason}</p>
                </div>
              )}

              <div className="mt-4 space-y-1 text-sm opacity-70">
                {verification.matriculaNacional && (
                  <p>Matrícula Nacional: {verification.matriculaNacional}</p>
                )}
                {verification.matriculaProvincial && (
                  <p>Matrícula Provincial: {verification.matriculaProvincial}</p>
                )}
                <p>
                  Enviado:{" "}
                  {new Date(verification.submittedAt).toLocaleDateString(
                    locale === "en" ? "en-US" : "es-AR",
                  )}
                </p>
              </div>

              {verification.documents.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Documentos enviados:</p>
                  <div className="space-y-1">
                    {verification.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4" />
                        <span>{doc.fileName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Allow resubmission if rejected */}
        {verification.status === "rejected" && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setVerification(null)}
              className="bg-celeste text-white px-6 py-2 rounded-lg hover:bg-celeste-dark transition"
            >
              Enviar Nueva Solicitud
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── New Verification Form ───────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <Shield className="w-12 h-12 text-celeste mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-ink">Verificar tu Cuenta Médica</h1>
        <p className="mt-2 text-gray-600">
          La verificación aumenta la confianza de los pacientes y desbloquea funcionalidades premium
          como recetas digitales y perfil público.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Matrícula Nacional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matrícula Nacional (MN)
          </label>
          <input
            type="text"
            value={matriculaNacional}
            onChange={(e) => setMatriculaNacional(e.target.value)}
            placeholder="Ej: MN 12345"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-celeste/50 focus:border-celeste"
          />
        </div>

        {/* Matrícula Provincial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matrícula Provincial (MP)
          </label>
          <input
            type="text"
            value={matriculaProvincial}
            onChange={(e) => setMatriculaProvincial(e.target.value)}
            placeholder="Ej: MP 6789"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-celeste/50 focus:border-celeste"
          />
        </div>

        {/* DNI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DNI del Profesional
          </label>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="Ej: 30123456"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-celeste/50 focus:border-celeste"
          />
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Documentos de Respaldo
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Foto o scan de tu matrícula profesional y/o DNI. Formatos: JPG, PNG, PDF.
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-celeste transition">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="doc-upload"
            />
            <label htmlFor="doc-upload" className="cursor-pointer">
              <span className="text-celeste font-medium">Seleccionar archivos</span>
              <span className="text-gray-500"> o arrastra aquí</span>
            </label>
            {files.length > 0 && (
              <div className="mt-3 space-y-1">
                {files.map((f, i) => (
                  <p key={i} className="text-sm text-gray-600">
                    {f.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium">¿Qué pasa después?</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Nuestro equipo revisará tu documentación en 24-48hs hábiles</li>
            <li>Recibirás una notificación cuando tu cuenta sea verificada</li>
            <li>El badge de verificación aparecerá en tu perfil público y recetas digitales</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={submitting || (!matriculaNacional && !matriculaProvincial)}
          className="w-full bg-celeste text-white font-bold py-3 rounded-lg hover:bg-celeste-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Enviar Solicitud de Verificación
            </>
          )}
        </button>
      </form>
    </div>
  );
}
