"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Globe,
  Save,
  Eye,
  Loader2,
  Plus,
  Trash2,
  ExternalLink,
  BadgeCheck,
  ImagePlus,
} from "lucide-react";
import { useToast } from "@/components/Toast";

// ─── Types ───────────────────────────────────────────────────

interface Education {
  institution: string;
  degree: string;
  year: number;
}

interface ProfileForm {
  displayName: string;
  specialty: string;
  subSpecialties: string[];
  bioEs: string;
  bioEn: string;
  photoUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  bookingUrl: string;
  address: string;
  city: string;
  province: string;
  insuranceAccepted: string[];
  languages: string[];
  education: Education[];
  experienceYears: number | "";
  teleconsultaAvailable: boolean;
  consultationFeeArs: number | "";
  consultationFeeUsd: number | "";
  seoTitle: string;
  seoDescription: string;
  published: boolean;
}

// ─── Constants ───────────────────────────────────────────────

const SPECIALTIES = [
  "Cardiología",
  "Dermatología",
  "Endocrinología",
  "Gastroenterología",
  "Ginecología",
  "Kinesiología",
  "Medicina General",
  "Medicina Interna",
  "Nefrología",
  "Neumología",
  "Neurología",
  "Nutrición",
  "Obstetricia",
  "Oftalmología",
  "Oncología",
  "Otorrinolaringología",
  "Pediatría",
  "Psicología",
  "Psiquiatría",
  "Reumatología",
  "Traumatología",
  "Urología",
];

const INSURANCE_OPTIONS = [
  "OSDE",
  "Swiss Medical",
  "Galeno",
  "Medifé",
  "IOMA",
  "OSECAC",
  "Sancor Salud",
  "Omint",
  "Hospital Italiano",
  "Particular",
];

const LANGUAGE_OPTIONS = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
];

const PROVINCES = [
  "CABA",
  "Buenos Aires",
  "Córdoba",
  "Santa Fe",
  "Mendoza",
  "Tucumán",
  "Salta",
  "Entre Ríos",
  "Misiones",
  "Chaco",
  "San Juan",
  "Jujuy",
  "Río Negro",
  "Neuquén",
  "Formosa",
  "Catamarca",
  "La Rioja",
  "San Luis",
  "Santiago del Estero",
  "La Pampa",
  "Corrientes",
  "Chubut",
  "Santa Cruz",
  "Tierra del Fuego",
];

// ─── Defaults ────────────────────────────────────────────────

const defaultForm: ProfileForm = {
  displayName: "Dr. Martín Rodríguez",
  specialty: "Medicina General",
  subSpecialties: ["Cardiología Preventiva", "Medicina Interna"],
  bioEs:
    "Médico clínico con más de 15 años de experiencia en atención primaria y cardiología preventiva. Director médico de Clínica San Martín. Especializado en el manejo integral del paciente con factores de riesgo cardiovascular, diabetes y enfermedades metabólicas. Miembro de la Sociedad Argentina de Cardiología.",
  bioEn:
    "General practitioner with over 15 years of experience in primary care and preventive cardiology. Medical director of Clínica San Martín. Specialized in comprehensive management of patients with cardiovascular risk factors, diabetes, and metabolic diseases.",
  photoUrl: "",
  phone: "+54 11 4567-8901",
  whatsapp: "5491145678901",
  email: "dr.rodriguez@clinicasanmartin.com.ar",
  bookingUrl: "https://condorsalud.com/medicos/dr-rodriguez",
  address: "Av. Rivadavia 4321, Piso 3° B",
  city: "Buenos Aires",
  province: "CABA",
  insuranceAccepted: ["OSDE", "Swiss Medical", "Galeno", "Medifé", "PAMI", "IOMA", "OSECAC"],
  languages: ["es", "en"],
  education: [
    { institution: "Universidad de Buenos Aires (UBA)", degree: "Médico", year: 2010 },
    {
      institution: "Hospital Italiano de Buenos Aires",
      degree: "Residencia Medicina Interna",
      year: 2014,
    },
    {
      institution: "Sociedad Argentina de Cardiología",
      degree: "Posgrado Cardiología Preventiva",
      year: 2016,
    },
  ],
  experienceYears: 15,
  teleconsultaAvailable: true,
  consultationFeeArs: 22000,
  consultationFeeUsd: 35,
  seoTitle: "Dr. Martín Rodríguez – Medicina General | Cóndor Salud",
  seoDescription:
    "Médico clínico en CABA con 15 años de experiencia. Cardiología preventiva, medicina interna. Turnos online. OSDE, Swiss Medical, Galeno, PAMI.",
  published: true,
};

// ─── Main Component ──────────────────────────────────────────

export default function MiPerfilPublicoPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState<ProfileForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState<string | null>("dr-rodriguez");
  const [saved, setSaved] = useState(false);
  const [newSubSpec, setNewSubSpec] = useState("");
  const [newInsurance, setNewInsurance] = useState("");

  // Load existing profile
  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/doctors/profile/me");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          const p = data.profile;
          setForm({
            displayName: p.displayName || "",
            specialty: p.specialty || "Medicina General",
            subSpecialties: p.subSpecialties || [],
            bioEs: p.bioEs || "",
            bioEn: p.bioEn || "",
            photoUrl: p.photoUrl || "",
            phone: p.phone || "",
            whatsapp: p.whatsapp || "",
            email: p.email || "",
            bookingUrl: p.bookingUrl || "",
            address: p.address || "",
            city: p.city || "",
            province: p.province || "",
            insuranceAccepted: p.insuranceAccepted || [],
            languages: p.languages || ["es"],
            education: p.education || [],
            experienceYears: p.experienceYears || "",
            teleconsultaAvailable: p.teleconsultaAvailable || false,
            consultationFeeArs: p.consultationFeeArs || "",
            consultationFeeUsd: p.consultationFeeUsd || "",
            seoTitle: p.seoTitle || "",
            seoDescription: p.seoDescription || "",
            published: p.published || false,
          });
          setSlug(p.slug);
        }
      }
    } catch {
      // New profile
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Save profile
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/doctors/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setSlug(data.profile?.slug);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      showToast("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: "", degree: "", year: new Date().getFullYear() },
      ],
    }));
  };

  const removeEducation = (index: number) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu)),
    }));
  };

  // ─── Loading ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-celeste" />
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Globe className="w-6 h-6 text-celeste" />
            Mi Perfil Público
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configurá tu perfil visible para pacientes en condorsalud.com/medicos
          </p>
        </div>
        <div className="flex items-center gap-3">
          {slug && (
            <a
              href={`/medicos/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-celeste hover:underline"
            >
              <Eye className="w-4 h-4" />
              Vista previa
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-celeste text-white font-bold px-5 py-2.5 rounded-lg hover:bg-celeste-dark transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? "¡Guardado!" : "Guardar"}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Published toggle */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-ink">Estado del Perfil</h3>
              <p className="text-sm text-gray-500">
                {form.published
                  ? "Tu perfil es visible públicamente"
                  : "Tu perfil está en borrador (no visible)"}
              </p>
            </div>
            <button
              onClick={() => updateField("published", !form.published)}
              className={`relative w-12 h-6 rounded-full transition ${
                form.published ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${
                  form.published ? "left-6.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <fieldset className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
          <legend className="text-lg font-bold text-ink flex items-center gap-2 -ml-1">
            <User className="w-5 h-5 text-celeste" />
            Información Básica
          </legend>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
                placeholder="Dra. María González"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-celeste/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad *</label>
              <select
                value={form.specialty}
                onChange={(e) => updateField("specialty", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-specialties */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub-especialidades
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.subSpecialties.map((sub, i) => (
                <span
                  key={i}
                  className="text-xs bg-celeste/10 text-celeste-dark px-2 py-1 rounded-full flex items-center gap-1"
                >
                  {sub}
                  <button
                    onClick={() =>
                      updateField(
                        "subSpecialties",
                        form.subSpecialties.filter((_, j) => j !== i),
                      )
                    }
                    className="text-celeste hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubSpec}
                onChange={(e) => setNewSubSpec(e.target.value)}
                placeholder="Agregar sub-especialidad"
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSubSpec.trim()) {
                    e.preventDefault();
                    updateField("subSpecialties", [...form.subSpecialties, newSubSpec.trim()]);
                    setNewSubSpec("");
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newSubSpec.trim()) {
                    updateField("subSpecialties", [...form.subSpecialties, newSubSpec.trim()]);
                    setNewSubSpec("");
                  }
                }}
                className="text-celeste p-1.5"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de Foto de Perfil
            </label>
            <div className="flex gap-2">
              <ImagePlus className="w-5 h-5 text-gray-400 mt-2" />
              <input
                type="url"
                value={form.photoUrl}
                onChange={(e) => updateField("photoUrl", e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Bio ES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biografía (Español) *
            </label>
            <textarea
              value={form.bioEs}
              onChange={(e) => updateField("bioEs", e.target.value)}
              rows={4}
              placeholder="Contá sobre tu experiencia profesional, áreas de interés..."
              className="w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-celeste/50"
            />
          </div>

          {/* Bio EN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biography (English)
            </label>
            <textarea
              value={form.bioEn}
              onChange={(e) => updateField("bioEn", e.target.value)}
              rows={3}
              placeholder="Tell us about your professional experience..."
              className="w-full px-3 py-2 border rounded-lg resize-none"
            />
          </div>

          {/* Experience */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Años de experiencia
              </label>
              <input
                type="number"
                value={form.experienceYears}
                onChange={(e) =>
                  updateField("experienceYears", e.target.value ? parseInt(e.target.value) : "")
                }
                placeholder="10"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="teleconsulta"
                checked={form.teleconsultaAvailable}
                onChange={(e) => updateField("teleconsultaAvailable", e.target.checked)}
                className="w-4 h-4 text-celeste rounded"
              />
              <label htmlFor="teleconsulta" className="text-sm font-medium text-gray-700">
                Ofrezco teleconsulta
              </label>
            </div>
          </div>
        </fieldset>

        {/* Contact & Location */}
        <fieldset className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
          <legend className="text-lg font-bold text-ink -ml-1">Contacto y Ubicación</legend>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+5411 4567-8901"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
                placeholder="5491145678901"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Turnos</label>
              <input
                type="url"
                value={form.bookingUrl}
                onChange={(e) => updateField("bookingUrl", e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Av. Santa Fe 1234, Piso 4°B"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Buenos Aires"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
              <select
                value={form.province}
                onChange={(e) => updateField("province", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">Seleccionar...</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Insurance */}
        <fieldset className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
          <legend className="text-lg font-bold text-ink -ml-1">Obras Sociales</legend>

          <div className="flex flex-wrap gap-2">
            {INSURANCE_OPTIONS.map((ins) => (
              <button
                key={ins}
                onClick={() => {
                  const current = form.insuranceAccepted;
                  if (current.includes(ins)) {
                    updateField(
                      "insuranceAccepted",
                      current.filter((i) => i !== ins),
                    );
                  } else {
                    updateField("insuranceAccepted", [...current, ins]);
                  }
                }}
                className={`text-sm px-3 py-1.5 rounded-lg border transition ${
                  form.insuranceAccepted.includes(ins)
                    ? "bg-celeste text-white border-celeste"
                    : "bg-white text-gray-600 border-gray-200 hover:border-celeste"
                }`}
              >
                {ins}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newInsurance}
              onChange={(e) => setNewInsurance(e.target.value)}
              placeholder="Otra obra social..."
              className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newInsurance.trim()) {
                  e.preventDefault();
                  updateField("insuranceAccepted", [
                    ...form.insuranceAccepted,
                    newInsurance.trim(),
                  ]);
                  setNewInsurance("");
                }
              }}
            />
          </div>
        </fieldset>

        {/* Languages */}
        <fieldset className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
          <legend className="text-lg font-bold text-ink -ml-1">Idiomas</legend>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  const current = form.languages;
                  if (current.includes(lang.code)) {
                    updateField(
                      "languages",
                      current.filter((l) => l !== lang.code),
                    );
                  } else {
                    updateField("languages", [...current, lang.code]);
                  }
                }}
                className={`text-sm px-3 py-1.5 rounded-lg border transition ${
                  form.languages.includes(lang.code)
                    ? "bg-celeste text-white border-celeste"
                    : "bg-white text-gray-600 border-gray-200 hover:border-celeste"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Education */}
        <fieldset className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
          <legend className="text-lg font-bold text-ink -ml-1">Formación Académica</legend>

          {form.education.map((edu, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3 relative">
              <button
                onClick={() => removeEducation(i)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Institución</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(i, "institution", e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg text-sm mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Título / Grado</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(i, "degree", e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg text-sm mt-0.5"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Año</label>
                <input
                  type="number"
                  value={edu.year}
                  onChange={(e) => updateEducation(i, "year", parseInt(e.target.value))}
                  className="w-24 px-3 py-1.5 border rounded-lg text-sm mt-0.5"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addEducation}
            className="flex items-center gap-2 text-celeste font-medium text-sm hover:underline"
          >
            <Plus className="w-4 h-4" />
            Agregar formación
          </button>
        </fieldset>

        {/* Fees */}
        <fieldset className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
          <legend className="text-lg font-bold text-ink -ml-1">Honorarios</legend>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consulta (ARS)</label>
              <input
                type="number"
                value={form.consultationFeeArs}
                onChange={(e) =>
                  updateField("consultationFeeArs", e.target.value ? parseInt(e.target.value) : "")
                }
                placeholder="15000"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consulta (USD)</label>
              <input
                type="number"
                value={form.consultationFeeUsd}
                onChange={(e) =>
                  updateField("consultationFeeUsd", e.target.value ? parseInt(e.target.value) : "")
                }
                placeholder="35"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </fieldset>

        {/* SEO */}
        <fieldset className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
          <legend className="text-lg font-bold text-ink -ml-1 flex items-center gap-2">
            <Globe className="w-5 h-5 text-celeste" />
            SEO (Opcional)
          </legend>
          <p className="text-xs text-gray-500">
            Se auto-genera si lo dejás en blanco. Personalizar mejora tu posicionamiento.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título SEO</label>
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => updateField("seoTitle", e.target.value)}
              placeholder={`${form.displayName || "Dr."} – ${form.specialty} | Cóndor Salud`}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              maxLength={70}
            />
            <p className="text-xs text-gray-400 mt-1">{form.seoTitle.length}/70 caracteres</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción SEO</label>
            <textarea
              value={form.seoDescription}
              onChange={(e) => updateField("seoDescription", e.target.value)}
              rows={2}
              placeholder="Descripción para resultados de búsqueda..."
              className="w-full px-3 py-2 border rounded-lg resize-none text-sm"
              maxLength={160}
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.seoDescription.length}/160 caracteres
            </p>
          </div>
        </fieldset>

        {/* Info Card */}
        <div className="bg-celeste/5 rounded-xl p-5 border border-celeste/10">
          <div className="flex items-start gap-3">
            <BadgeCheck className="w-6 h-6 text-celeste flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-ink text-sm">Perfil Verificado</p>
              <p className="text-xs text-gray-600 mt-1">
                Para obtener el badge de verificación, completá el proceso en{" "}
                <a
                  href="/dashboard/verificar-cuenta"
                  className="text-celeste hover:underline font-medium inline-flex items-center gap-0.5"
                >
                  Verificar Cuenta <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Save */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {slug && (
            <a
              href={`/medicos/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-celeste transition px-4 py-2.5"
            >
              <Eye className="w-4 h-4" />
              Ver perfil
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-celeste text-white font-bold px-6 py-2.5 rounded-lg hover:bg-celeste-dark transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? "¡Guardado!" : "Guardar Perfil"}
          </button>
        </div>
      </div>
    </div>
  );
}
