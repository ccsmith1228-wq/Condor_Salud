"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Heart,
  AlertTriangle,
  Save,
  Edit3,
  Bell,
  Lock,
  Smartphone,
  CreditCard,
  FileText,
  ChevronRight,
  Droplets,
  Pill,
} from "lucide-react";
import { useToast } from "@/components/Toast";

/* ── types ────────────────────────────────────────────── */
interface PatientProfile {
  name: string;
  email: string;
  phone: string;
  dni: string;
  birthDate: string;
  gender: string;
  address: string;
  city: string;
  bloodType: string;
  insurance: string;
  memberId: string;
  plan: string;
  emergencyContact: string;
  emergencyPhone: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
}

/* ── demo data ────────────────────────────────────────── */
const initialProfile: PatientProfile = {
  name: "María Gómez",
  email: "maria.gomez@email.com",
  phone: "+54 11 5555-1234",
  dni: "29.384.756",
  birthDate: "1985-06-15",
  gender: "Femenino",
  address: "Av. Cabildo 2040, 3°B",
  city: "CABA, Buenos Aires",
  bloodType: "A+",
  insurance: "OSDE",
  memberId: "08-29384756-3",
  plan: "310",
  emergencyContact: "Juan Gómez (esposo)",
  emergencyPhone: "+54 11 5555-5678",
  allergies: ["Penicilina", "Mariscos"],
  chronicConditions: ["Hipertensión arterial", "Diabetes tipo 2", "Dislipidemia"],
  currentMedications: ["Losartán 50mg", "Metformina 850mg", "Atorvastatina 20mg"],
};

type Section = "personal" | "medical" | "settings";

export default function PerfilPage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<PatientProfile>(initialProfile);
  const [editProfile, setEditProfile] = useState<PatientProfile>(initialProfile);
  const [section, setSection] = useState<Section>("personal");
  const [editing, setEditing] = useState(false);

  // Settings
  const [notifications, setNotifications] = useState({
    turnos: true,
    medicamentos: true,
    resultados: true,
    promociones: false,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Mi Perfil</h1>
        <p className="text-sm text-ink-muted mt-0.5">Tu información personal y configuración</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-border-light p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-celeste-100 flex items-center justify-center text-celeste-dark text-2xl font-bold">
            MG
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-ink">{profile.name}</h2>
            <p className="text-sm text-ink-muted">DNI: {profile.dni}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-ink-muted">
                <Droplets className="w-3 h-3 text-red-500" />
                Grupo: {profile.bloodType}
              </span>
              <span className="flex items-center gap-1 text-xs text-ink-muted">
                <Shield className="w-3 h-3 text-celeste-dark" />
                {profile.insurance} {profile.plan}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              if (editing) {
                setEditProfile(profile);
              } else {
                setEditProfile(profile);
              }
              setEditing(!editing);
            }}
            className="flex items-center gap-2 text-sm font-medium text-celeste-dark hover:text-celeste-700 bg-celeste-50 px-3 py-1.5 rounded-lg transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {editing ? "Cancelar" : "Editar"}
          </button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-ink-50 rounded-xl p-1 w-fit">
        {(
          [
            ["personal", "Datos personales"],
            ["medical", "Info médica"],
            ["settings", "Configuración"],
          ] as [Section, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              section === key ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Personal data ─────────────────────────────── */}
      {section === "personal" && (
        <div className="bg-white rounded-2xl border border-border-light divide-y divide-border-light">
          {[
            { icon: User, label: "Nombre completo", value: profile.name },
            { icon: Mail, label: "Email", value: profile.email },
            { icon: Phone, label: "Teléfono", value: profile.phone },
            { icon: FileText, label: "DNI", value: profile.dni },
            {
              icon: Calendar,
              label: "Fecha de nacimiento",
              value: new Date(profile.birthDate + "T12:00").toLocaleDateString("es-AR"),
            },
            { icon: User, label: "Género", value: profile.gender },
            { icon: MapPin, label: "Dirección", value: `${profile.address}, ${profile.city}` },
            {
              icon: Shield,
              label: "Obra social",
              value: `${profile.insurance} ${profile.plan} — N° ${profile.memberId}`,
            },
            {
              icon: Phone,
              label: "Contacto de emergencia",
              value: `${profile.emergencyContact} — ${profile.emergencyPhone}`,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-ink-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-ink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-ink-muted">{item.label}</p>
                  {editing ? (
                    <input
                      type="text"
                      value={
                        item.label === "Nombre completo"
                          ? editProfile.name
                          : item.label === "Email"
                            ? editProfile.email
                            : item.label === "Tel\u00e9fono"
                              ? editProfile.phone
                              : item.label === "DNI"
                                ? editProfile.dni
                                : item.label === "Fecha de nacimiento"
                                  ? editProfile.birthDate
                                  : item.label === "G\u00e9nero"
                                    ? editProfile.gender
                                    : item.label === "Direcci\u00f3n"
                                      ? `${editProfile.address}, ${editProfile.city}`
                                      : item.label === "Obra social"
                                        ? `${editProfile.insurance} ${editProfile.plan} \u2014 N\u00b0 ${editProfile.memberId}`
                                        : `${editProfile.emergencyContact} \u2014 ${editProfile.emergencyPhone}`
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditProfile((prev) => {
                          if (item.label === "Nombre completo") return { ...prev, name: val };
                          if (item.label === "Email") return { ...prev, email: val };
                          if (item.label === "Tel\u00e9fono") return { ...prev, phone: val };
                          if (item.label === "DNI") return { ...prev, dni: val };
                          if (item.label === "Fecha de nacimiento")
                            return { ...prev, birthDate: val };
                          if (item.label === "G\u00e9nero") return { ...prev, gender: val };
                          return prev;
                        });
                      }}
                      className="w-full text-sm text-ink border-b border-celeste-200 focus:border-celeste-dark outline-none pb-0.5 mt-0.5 bg-transparent"
                    />
                  ) : (
                    <p className="text-sm text-ink font-medium">{item.value}</p>
                  )}
                </div>
              </div>
            );
          })}
          {editing && (
            <div className="px-5 py-4">
              <button
                onClick={() => {
                  setProfile(editProfile);
                  setEditing(false);
                  showToast("Cambios guardados correctamente");
                }}
                className="inline-flex items-center gap-2 bg-celeste-dark hover:bg-celeste-700 text-white text-sm font-semibold px-5 py-2.5 rounded-[4px] transition"
              >
                <Save className="w-4 h-4" />
                Guardar cambios
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Medical info ──────────────────────────────── */}
      {section === "medical" && (
        <div className="space-y-4">
          {/* Allergies */}
          <div className="bg-white rounded-2xl border border-border-light p-5">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Alergias
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map((a) => (
                <span
                  key={a}
                  className="text-sm bg-red-50 text-red-700 px-3 py-1 rounded-full font-medium"
                >
                  {a}
                </span>
              ))}
              {editing && (
                <button
                  onClick={() => showToast("Agregar alergia disponible próximamente")}
                  className="text-sm bg-ink-50 text-ink-400 px-3 py-1 rounded-full hover:bg-ink-100 transition"
                >
                  + Agregar
                </button>
              )}
            </div>
          </div>

          {/* Chronic conditions */}
          <div className="bg-white rounded-2xl border border-border-light p-5">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-red-500" />
              Condiciones crónicas
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.chronicConditions.map((c) => (
                <span
                  key={c}
                  className="text-sm bg-red-50 text-red-700 px-3 py-1 rounded-full font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Current meds */}
          <div className="bg-white rounded-2xl border border-border-light p-5">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-3">
              <Pill className="w-4 h-4 text-amber-600" />
              Medicación actual
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.currentMedications.map((m) => (
                <span
                  key={m}
                  className="text-sm bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Blood type & donor */}
          <div className="bg-white rounded-2xl border border-border-light p-5">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-3">
              <Droplets className="w-4 h-4 text-red-500" />
              Información adicional
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-ink-muted text-xs">Grupo sanguíneo</p>
                <p className="font-semibold text-ink">{profile.bloodType}</p>
              </div>
              <div>
                <p className="text-ink-muted text-xs">Donante de órganos</p>
                <p className="font-semibold text-ink">Sí</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings ──────────────────────────────────── */}
      {section === "settings" && (
        <div className="space-y-4">
          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-border-light p-5">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-celeste-dark" />
              Notificaciones
            </h3>
            <div className="space-y-3">
              {(
                [
                  ["turnos", "Recordatorio de turnos", "Te avisamos antes de cada consulta"],
                  [
                    "medicamentos",
                    "Medicamentos",
                    "Alerta cuando un medicamento está por acabarse",
                  ],
                  [
                    "resultados",
                    "Resultados médicos",
                    "Te notificamos cuando hay nuevos resultados",
                  ],
                  ["promociones", "Novedades y promociones", "Información sobre nuevos servicios"],
                ] as const
              ).map(([key, label, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-ink font-medium">{label}</p>
                    <p className="text-xs text-ink-muted">{desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className={`w-10 h-6 rounded-full transition relative ${
                      notifications[key] ? "bg-celeste-dark" : "bg-ink-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        notifications[key] ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl border border-border-light">
            <div className="px-5 py-4 border-b border-border-light">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Lock className="w-4 h-4 text-ink-400" />
                Seguridad
              </h3>
            </div>
            <div className="divide-y divide-border-light">
              {[
                { label: "Cambiar contraseña", desc: "Última actualización hace 3 meses" },
                { label: "Autenticación de dos factores", desc: "No activada" },
                { label: "Dispositivos conectados", desc: "2 dispositivos" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => showToast(`${item.label}: disponible próximamente`)}
                  className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-surface/30 transition"
                >
                  <div className="text-left">
                    <p className="text-sm text-ink font-medium">{item.label}</p>
                    <p className="text-xs text-ink-muted">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-200 p-5">
            <h3 className="text-sm font-bold text-red-600 mb-2">Zona de peligro</h3>
            <p className="text-xs text-ink-muted mb-3">
              Eliminar tu cuenta borrará todos tus datos de forma permanente.
            </p>
            <button
              onClick={() => showToast("Eliminación de cuenta: contactar soporte")}
              className="text-sm font-medium text-red-600 border border-red-200 px-4 py-2 rounded-[4px] hover:bg-red-50 transition"
            >
              Eliminar cuenta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
