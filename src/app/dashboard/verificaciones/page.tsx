"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Eye,
  User,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";

interface Verification {
  id: string;
  profileId: string;
  matriculaNacional?: string;
  matriculaProvincial?: string;
  dni?: string;
  status: string;
  submittedAt: string;
  documents: {
    id: string;
    documentType: string;
    fileName: string;
    storagePath: string;
  }[];
}

const DOC_TYPE_KEYS: Record<string, string> = {
  matricula_frente: "verifications.docLicenseFront",
  matricula_dorso: "verifications.docLicenseBack",
  dni_frente: "verifications.docDniFront",
  dni_dorso: "verifications.docDniBack",
  titulo: "verifications.docDegree",
  otro: "verifications.docOther",
};

export default function VerificacionesAdminPage() {
  const { showToast } = useToast();
  const { t, locale } = useLocale();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadVerifications();
  }, []);

  async function loadVerifications() {
    try {
      const res = await fetch("/api/admin/verifications");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVerifications(data.verifications || []);
    } catch {
      // Demo data for development
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(id: string, status: "approved" | "rejected") {
    setReviewing(id);
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationId: id,
          status,
          rejectionReason: status === "rejected" ? rejectionReason : undefined,
        }),
      });
      if (!res.ok) throw new Error();

      setVerifications((prev) => prev.filter((v) => v.id !== id));
      showToast(
        status === "approved"
          ? t("toast.verificaciones.approved")
          : t("toast.verificaciones.rejected"),
      );
      setRejectionReason("");
    } catch {
      showToast(t("toast.verificaciones.processError"), "error");
    } finally {
      setReviewing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-celeste" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">{t("verifications.title")}</h1>
        <p className="text-sm text-ink/60 mt-0.5">{t("verifications.subtitle")}</p>
      </div>

      {verifications.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl">
          <Shield className="w-12 h-12 text-ink/20 mx-auto mb-3" />
          <p className="font-semibold text-ink">{t("verifications.noPending")}</p>
          <p className="text-sm text-ink/50 mt-1">{t("verifications.allProcessed")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map((v) => {
            const isExpanded = expandedId === v.id;
            return (
              <div key={v.id} className="bg-white border border-border rounded-xl overflow-hidden">
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : v.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-ink">{v.profileId.slice(0, 8)}...</p>
                      <p className="text-xs text-ink/50">
                        {v.matriculaNacional && `MN: ${v.matriculaNacional}`}
                        {v.matriculaProvincial && ` · MP: ${v.matriculaProvincial}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink/40">
                      {new Date(v.submittedAt).toLocaleDateString(
                        locale === "en" ? "en-US" : "es-AR",
                      )}
                    </span>
                    <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                      {v.documents.length} docs
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-ink/40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border/50 space-y-4">
                    {/* Doctor info */}
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div>
                        <p className="text-[10px] text-ink/40 uppercase tracking-wider">
                          {t("verifications.nationalLicense")}
                        </p>
                        <p className="text-sm font-medium text-ink">{v.matriculaNacional || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-ink/40 uppercase tracking-wider">
                          {t("verifications.provincialLicense")}
                        </p>
                        <p className="text-sm font-medium text-ink">
                          {v.matriculaProvincial || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-ink/40 uppercase tracking-wider">
                          {t("verifications.dni")}
                        </p>
                        <p className="text-sm font-medium text-ink">{v.dni || "—"}</p>
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider mb-2">
                        {t("verifications.uploadedDocs")}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {v.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2"
                          >
                            <FileText className="w-4 h-4 text-celeste shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-ink truncate">
                                {DOC_TYPE_KEYS[doc.documentType]
                                  ? t(DOC_TYPE_KEYS[doc.documentType] as Parameters<typeof t>[0])
                                  : doc.documentType}
                              </p>
                              <p className="text-[10px] text-ink/40 truncate">{doc.fileName}</p>
                            </div>
                            <button className="p-1 hover:bg-white rounded">
                              <Eye className="w-3.5 h-3.5 text-ink/50" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rejection reason input */}
                    <div>
                      <label className="text-[10px] text-ink/40 uppercase tracking-wider">
                        {t("verifications.rejectionLabel")}
                      </label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder={t("verifications.rejectionPlaceholder")}
                        className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste/40"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleReview(v.id, "approved")}
                        disabled={reviewing === v.id}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                      >
                        {reviewing === v.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {t("verifications.approve")}
                      </button>
                      <button
                        onClick={() => handleReview(v.id, "rejected")}
                        disabled={reviewing === v.id}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        {t("verifications.reject")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
