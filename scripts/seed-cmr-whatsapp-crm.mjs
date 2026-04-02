// ─── Seed: Centro Médico Roca — WhatsApp CRM Configuration ──
// Run: node scripts/seed-cmr-whatsapp-crm.mjs
//
// Seeds WhatsApp CRM configuration for Centro Médico Roca:
//   - whatsapp_config row (number, welcome message, business hours, auto-reply)
//   - 7 WhatsApp message templates (reminders, confirmation, cancel, reschedule, post-visit, welcome, follow-up)
//
// Prerequisites:
//   - Centro Médico Roca clinic must already exist (run seed-centro-medico-roca.mjs first)
//   - Migration 006_whatsapp_crm.sql must be applied
//
// Requires env: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌ Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

// ─── Clinic Constants ────────────────────────────────────────

const CLINIC_CUIT = "20-95140905-8";
const CLINIC_NAME = "Centro Médico Roca";
const CLINIC_SLUG = "centro-medico-roca";
const WHATSAPP_NUMBER = "+5491127756496";
const CLINIC_ADDRESS = "Juan B. Ambrosetti 698, C1405BIJ, Caballito, CABA";
const CLINIC_PHONE = "011 5263-3288";
const GMAPS_LINK = "https://maps.app.goo.gl/cmroca"; // Short link — update with real one
const BOOKING_LINK = "condorsalud.com/reservar/centro-medico-roca";

// ─── WhatsApp Config ─────────────────────────────────────────

const WHATSAPP_CONFIG = {
  whatsapp_number: WHATSAPP_NUMBER,
  display_name: CLINIC_NAME,
  welcome_message:
    `¡Hola! 👋 Gracias por comunicarte con *${CLINIC_NAME}*.\n\n` +
    `Somos un centro médico con más de 27 especialidades en Caballito.\n\n` +
    `¿En qué podemos ayudarte?\n` +
    `*1* — Sacar turno\n` +
    `*2* — Consultar turnos existentes\n` +
    `*3* — Hablar con recepción\n\n` +
    `También podés reservar online: ${BOOKING_LINK}`,
  auto_reply: true,
  business_hours: JSON.stringify({
    hours: "10:00-18:00",
    hoursBeforeFirst: 24,
    hoursBeforeSecond: 2,
    confirmationReply: true,
    cancellationReply: true,
    rescheduleReply: true,
    includeGoogleMaps: true,
    includeClinicPhone: true,
    includePreparation: false,
    schedule: {
      lun: { open: "10:00", close: "18:00" },
      mar: { open: "09:30", close: "18:00" },
      mie: { open: "10:00", close: "18:00" },
      jue: { open: "10:00", close: "18:00" },
      vie: { open: "10:00", close: "18:00" },
      sab: null,
      dom: null,
    },
  }),
  out_of_hours_message:
    `Nuestro horario de atención es de *lunes a viernes de 10:00 a 18:00*.\n\n` +
    `Te responderemos a primera hora del próximo día hábil.\n\n` +
    `Mientras tanto, podés reservar un turno online: ${BOOKING_LINK}`,
  notify_on_new_lead: true,
};

// ─── Message Templates ───────────────────────────────────────

const TEMPLATES = [
  {
    name: "reminder-24h",
    category: "utility",
    language: "es_AR",
    body_template:
      `Hola {{paciente_nombre}}, te recordamos tu turno en *${CLINIC_NAME}*:\n\n` +
      `📅 Fecha: *{{turno_fecha}}*\n` +
      `🕐 Hora: *{{turno_hora}}*\n` +
      `👨‍⚕️ Profesional: *{{profesional_nombre}}*\n` +
      `📋 Tipo: {{turno_tipo}}\n\n` +
      `📍 Dirección: ${CLINIC_ADDRESS}\n` +
      `🗺️ Cómo llegar: ${GMAPS_LINK}\n\n` +
      `Respondé:\n` +
      `*1* — Confirmar turno ✅\n` +
      `*2* — Cancelar turno ❌\n` +
      `*3* — Reprogramar 📅`,
    variables: [
      "paciente_nombre",
      "turno_fecha",
      "turno_hora",
      "profesional_nombre",
      "turno_tipo",
    ],
    header_text: "Recordatorio de turno — 24 horas antes",
    active: true,
  },
  {
    name: "reminder-2h",
    category: "utility",
    language: "es_AR",
    body_template:
      `Hola {{paciente_nombre}}, tu turno es *hoy a las {{turno_hora}}* con *{{profesional_nombre}}*.\n\n` +
      `📍 ${CLINIC_ADDRESS}\n` +
      `🗺️ Abrir en Google Maps: ${GMAPS_LINK}\n\n` +
      `📞 Teléfono fijo: ${CLINIC_PHONE}\n\n` +
      `¡Te esperamos!`,
    variables: ["paciente_nombre", "turno_hora", "profesional_nombre"],
    header_text: "Recordatorio de turno — 2 horas antes",
    active: true,
  },
  {
    name: "confirmation",
    category: "utility",
    language: "es_AR",
    body_template:
      `✅ Hola {{paciente_nombre}}, tu turno fue agendado en *${CLINIC_NAME}*:\n\n` +
      `📅 Fecha: *{{turno_fecha}}*\n` +
      `🕐 Hora: *{{turno_hora}}*\n` +
      `👨‍⚕️ Profesional: *{{profesional_nombre}}*\n` +
      `📋 Tipo: {{turno_tipo}}\n` +
      `💳 Financiador: {{financiador}}\n\n` +
      `📍 Dirección: ${CLINIC_ADDRESS}\n` +
      `🗺️ Google Maps: ${GMAPS_LINK}\n\n` +
      `24 hs antes te enviaremos un recordatorio.\n` +
      `Respondé *CANCELAR* si necesitás cancelar.`,
    variables: [
      "paciente_nombre",
      "turno_fecha",
      "turno_hora",
      "profesional_nombre",
      "turno_tipo",
      "financiador",
    ],
    header_text: "Confirmación de turno nuevo",
    active: true,
  },
  {
    name: "cancellation",
    category: "utility",
    language: "es_AR",
    body_template:
      `Hola {{paciente_nombre}}, tu turno del *{{turno_fecha}}* a las *{{turno_hora}}* fue cancelado correctamente.\n\n` +
      `Para agendar uno nuevo:\n` +
      `🌐 Online: ${BOOKING_LINK}\n` +
      `📞 Teléfono: ${CLINIC_PHONE}\n` +
      `💬 O respondé *TURNO* por acá.`,
    variables: ["paciente_nombre", "turno_fecha", "turno_hora"],
    header_text: "Cancelación de turno",
    active: true,
  },
  {
    name: "reschedule",
    category: "utility",
    language: "es_AR",
    body_template:
      `🔄 Hola {{paciente_nombre}}, tu turno fue reprogramado:\n\n` +
      `📅 Nueva fecha: *{{turno_fecha}}*\n` +
      `🕐 Nueva hora: *{{turno_hora}}*\n` +
      `👨‍⚕️ Profesional: *{{profesional_nombre}}*\n\n` +
      `📍 ${CLINIC_ADDRESS}\n` +
      `🗺️ Google Maps: ${GMAPS_LINK}\n\n` +
      `Respondé *CANCELAR* si necesitás cancelar.`,
    variables: ["paciente_nombre", "turno_fecha", "turno_hora", "profesional_nombre"],
    header_text: "Turno reprogramado",
    active: true,
  },
  {
    name: "post-visit",
    category: "utility",
    language: "es_AR",
    body_template:
      `Hola {{paciente_nombre}}, gracias por visitarnos en *${CLINIC_NAME}* 🏥\n\n` +
      `Esperamos que tu consulta con *{{profesional_nombre}}* haya sido de tu agrado.\n\n` +
      `Si necesitás un nuevo turno o tenés consultas, escribinos por acá o llamanos al ${CLINIC_PHONE}.\n\n` +
      `⭐ Dejanos tu opinión en Google: https://g.page/r/CS0EDOwOdeQnEAE/review\n\n` +
      `¡Gracias por confiar en nosotros!`,
    variables: ["paciente_nombre", "profesional_nombre"],
    header_text: "Post-visita — 1 hora después",
    active: false, // disabled by default; clinic can enable
  },
  {
    name: "follow-up-results",
    category: "utility",
    language: "es_AR",
    body_template:
      `Hola {{paciente_nombre}}, te informamos que los resultados de tu estudio de *{{tipo_estudio}}* ya están disponibles.\n\n` +
      `Podés retirarlos en recepción de lunes a viernes de 10:00 a 18:00.\n` +
      `📍 ${CLINIC_ADDRESS}\n\n` +
      `Si tenés consultas, respondé este mensaje o llamanos al ${CLINIC_PHONE}.`,
    variables: ["paciente_nombre", "tipo_estudio"],
    header_text: "Resultados disponibles",
    active: true,
  },
];

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log("═".repeat(60));
  console.log(`🟢 WhatsApp CRM Seed — ${CLINIC_NAME}`);
  console.log("═".repeat(60));

  // 1. Look up clinic by CUIT
  console.log("\n📍 Looking up clinic...");
  const { data: clinic, error: clinicErr } = await sb
    .from("clinics")
    .select("id, name, slug, phone")
    .eq("cuit", CLINIC_CUIT)
    .single();

  if (clinicErr || !clinic) {
    console.error(`❌ Clinic not found (CUIT: ${CLINIC_CUIT}). Run seed-centro-medico-roca.mjs first.`);
    process.exit(1);
  }

  const clinicId = clinic.id;
  console.log(`  ✅ Found: ${clinic.name} (${clinic.slug}) — ID: ${clinicId}`);

  // 2. Upsert whatsapp_config
  console.log("\n📱 Configuring WhatsApp...");
  const { data: config, error: cfgErr } = await sb
    .from("whatsapp_config")
    .upsert(
      {
        clinic_id: clinicId,
        ...WHATSAPP_CONFIG,
      },
      { onConflict: "clinic_id" },
    )
    .select("id")
    .single();

  if (cfgErr) {
    console.error("  ❌ WhatsApp config error:", cfgErr.message);
  } else {
    console.log(`  ✅ WhatsApp config upserted (ID: ${config.id})`);
    console.log(`     Number:        ${WHATSAPP_NUMBER}`);
    console.log(`     Display name:  ${CLINIC_NAME}`);
    console.log(`     Auto-reply:    ✅ Yes`);
    console.log(`     Business hours: Lun-Vie 10:00–18:00`);
    console.log(`     New lead alert: ✅ Yes`);
  }

  // 3. Upsert message templates
  console.log("\n📝 Seeding message templates...");
  let templateCount = 0;

  for (const tpl of TEMPLATES) {
    const { error: tplErr } = await sb.from("whatsapp_templates").upsert(
      {
        clinic_id: clinicId,
        ...tpl,
        approved: false, // Pending Meta approval
      },
      { onConflict: "clinic_id,name" },
    );

    if (tplErr) {
      console.warn(`  ⚠️  Template "${tpl.name}": ${tplErr.message}`);
    } else {
      templateCount++;
      console.log(`  ✅ ${tpl.name} — ${tpl.active ? "Activa" : "Inactiva"} — ${tpl.header_text}`);
    }
  }

  console.log(`  📊 ${templateCount}/${TEMPLATES.length} templates seeded`);

  // 4. Summary
  console.log("\n" + "═".repeat(60));
  console.log("🎉 WhatsApp CRM configured for Centro Médico Roca!");
  console.log("═".repeat(60));
  console.log(`   Clinic:      ${CLINIC_NAME}`);
  console.log(`   WhatsApp:    ${WHATSAPP_NUMBER}`);
  console.log(`   Templates:   ${templateCount} (${TEMPLATES.filter((t) => t.active).length} active)`);
  console.log(`   CRM inbox:   /dashboard/pacientes?tab=inbox`);
  console.log(`   WA Config:   /dashboard/configuracion/whatsapp`);
  console.log(`   Webhook:     /api/webhooks/whatsapp`);
  console.log("");
  console.log("⚠️  NEXT STEPS:");
  console.log("   1. Register webhook URL in Meta Developer Console:");
  console.log(`      https://condorsalud.com/api/webhooks/whatsapp`);
  console.log("   2. Set env vars in Vercel:");
  console.log("      META_WHATSAPP_PHONE_NUMBER_ID=<from Meta console>");
  console.log("      META_WHATSAPP_ACCESS_TOKEN=<from Meta console>");
  console.log("      META_WHATSAPP_VERIFY_TOKEN=condorsalud-whatsapp-verify-2026");
  console.log("   3. Submit templates for Meta approval");
  console.log("   4. Test with: /dashboard/configuracion/whatsapp → 'Enviar prueba'");
  console.log("═".repeat(60));
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
