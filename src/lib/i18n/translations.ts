// ─── Landing Page Translations ───────────────────────────────
// Centralized ES/EN dictionary for all landing-page components.
// Keys are namespaced by component: "nav.*", "hero.*", etc.

export type Locale = "es" | "en";

type Dict = Record<string, { es: string; en: string }>;

const translations: Dict = {
  // ── Navbar ──────────────────────────────────────────────────
  "nav.aria": { es: "Navegación principal", en: "Main navigation" },
  "nav.problem": { es: "Problema", en: "Problem" },
  "nav.product": { es: "Producto", en: "Product" },
  "nav.pricing": { es: "Precios", en: "Pricing" },
  "nav.plans": { es: "Planes", en: "Plans" },
  "nav.login": { es: "Iniciar sesión", en: "Log in" },
  "nav.try": { es: "Probá gratis", en: "Try free" },
  "nav.patient": { es: "Portal Paciente", en: "Patient Portal" },
  "nav.demo": { es: "Demo", en: "Demo" },
  "nav.joinWaitlist": { es: "Sumate al waitlist", en: "Join the waitlist" },
  "nav.menuAria": { es: "Menú de navegación", en: "Navigation menu" },
  "nav.whatsappDemo": { es: "WhatsApp Demo", en: "WhatsApp Demo" },
  "nav.doctors": { es: "Médicos", en: "Doctors" },
  "nav.teleconsult": { es: "Teleconsulta", en: "Teleconsult" },
  "nav.pharmacy": { es: "Farmacia", en: "Pharmacy" },
  "nav.coverage": { es: "Cobertura", en: "Coverage" },
  "nav.healthClub": { es: "Health Club", en: "Health Club" },

  // ── Hero ────────────────────────────────────────────────────
  "hero.badge": {
    es: "Nuevo: Turnos online con MercadoPago, notificaciones push y disponibilidad médica",
    en: "New: Online bookings with MercadoPago, push notifications & doctor availability",
  },
  "hero.title1": { es: "Todo tu sistema de salud.", en: "Your entire health system." },
  "hero.title2": { es: "Una sola vista.", en: "One single view." },
  "hero.subtitle": {
    es: "Conectamos PAMI, obras sociales, prepagas y AFIP en una plataforma unificada. Turnos online con pago integrado, notificaciones push, recordatorios automáticos y facturación sin errores.",
    en: "We connect PAMI, social health plans, private insurers and AFIP in one unified platform. Online bookings with integrated payments, push notifications, automated reminders and error-free billing.",
  },
  "hero.cta1": { es: "Empezar gratis — 14 días", en: "Start free — 14 days" },
  "hero.cta2": { es: "Ver demo en vivo", en: "Watch live demo" },
  "hero.fine": {
    es: "Sin tarjeta de crédito · Setup en 2 minutos · Cancelá cuando quieras",
    en: "No credit card · 2-minute setup · Cancel anytime",
  },
  "hero.mockBilled": { es: "Facturado", en: "Billed" },
  "hero.mockCollected": { es: "Cobrado", en: "Collected" },
  "hero.mockRejections": { es: "Rechazos", en: "Rejections" },
  "hero.mockDelay": { es: "Demora prom.", en: "Avg. delay" },
  "hero.mockChartTitle": {
    es: "Ingresos vs. Rechazos — Mar 2026",
    en: "Revenue vs. Rejections — Mar 2026",
  },
  "hero.mockUrl": { es: "condorsalud.com/dashboard", en: "condorsalud.com/dashboard" },
  "hero.mockBilledVal": { es: "$12.4M", en: "$12.4M" },
  "hero.mockBilledChange": { es: "+18% vs mes ant.", en: "+18% vs last month" },
  "hero.mockCollectedVal": { es: "$9.8M", en: "$9.8M" },
  "hero.mockCollectedChange": { es: "+24% vs mes ant.", en: "+24% vs last month" },
  "hero.mockRejectionsVal": { es: "3.2%", en: "3.2%" },
  "hero.mockRejectionsChange": { es: "-62% rechazos", en: "-62% rejections" },
  "hero.mockDelayVal": { es: "22 días", en: "22 days" },
  "hero.mockDelayChange": { es: "-45 días demora", en: "-45 days delay" },
  "hero.mockAlertsTitle": { es: "Alertas de hoy", en: "Today's alerts" },
  "hero.mockAlert1": {
    es: "MercadoPago: 8 pagos de consultas acreditados hoy — $124.000",
    en: "MercadoPago: 8 consultation payments credited today — $124,000",
  },
  "hero.mockAlert2": {
    es: "Recordatorios automáticos enviados: 23 turnos de mañana notificados",
    en: "Auto-reminders sent: 23 tomorrow's appointments notified",
  },
  "hero.mockAlert3": {
    es: "Push: 47 pacientes recibieron confirmación de turno en tiempo real",
    en: "Push: 47 patients received real-time booking confirmations",
  },
  "hero.mockPatients": { es: "Pacientes hoy", en: "Patients today" },
  "hero.mockPatientsVal": { es: "47", en: "47" },
  "hero.mockPatientsChange": { es: "+12 vs ayer", en: "+12 vs yesterday" },
  "hero.mockAgenda": { es: "Agenda", en: "Schedule" },
  "hero.mockAgendaVal": { es: "94%", en: "94%" },
  "hero.mockAgendaChange": { es: "3 slots libres", en: "3 slots free" },
  "hero.mockAutoTitle": { es: "Automatizaciones activas", en: "Active automations" },
  "hero.mockAuto1": { es: "Cobro automático MercadoPago", en: "Auto MercadoPago payments" },
  "hero.mockAuto2": { es: "Push de confirmación de turno", en: "Booking confirmation push" },
  "hero.mockAuto3": { es: "Recordatorios 24h antes", en: "24h advance reminders" },
  "hero.mockAuto4": { es: "Disponibilidad semanal sync", en: "Weekly availability sync" },
  "hero.mockAlert4": {
    es: "Disponibilidad: Dra. González actualizó 32 slots para la semana",
    en: "Availability: Dr. González updated 32 slots for the week",
  },
  "hero.mockRevenueTitle": { es: "Meta mensual", en: "Monthly target" },
  "hero.mockRevenuePercent": { es: "78%", en: "78%" },
  "hero.mockRevenueLabel": { es: "$12.4M de $15.9M facturado", en: "$12.4M of $15.9M billed" },
  "hero.mockApptTitle": { es: "Próximos turnos", en: "Upcoming appointments" },
  "hero.mockCoraTitle": { es: "Cora — Tu asistente de salud", en: "Cora — Your health assistant" },
  "hero.mockCoraMsg": {
    es: "¡Hola! Soy Cora. ¿En qué te puedo ayudar hoy?",
    en: "Hi! I'm Cora. How can I help today?",
  },
  "hero.mockCoraInput": { es: "Escribí tu consulta...", en: "Type your question..." },
  "hero.trust": {
    es: "Integrado con los financiadores que ya usás",
    en: "Integrated with the insurers you already use",
  },

  // ── Stats ───────────────────────────────────────────────────
  "stats.label0": { es: "Financiadores sin conectar", en: "Disconnected payers" },
  "stats.detail0": {
    es: "Cada obra social y prepaga usa su propio portal, formato y nomenclador",
    en: "Each health plan and insurer uses its own portal, format and billing codes",
  },
  "stats.label1": { es: "Tasa de rechazo promedio", en: "Average rejection rate" },
  "stats.detail1": {
    es: "Errores de nomenclador, datos incompletos y auditorías manuales",
    en: "Billing-code errors, incomplete data and manual audits",
  },
  "stats.label2": { es: "Días de demora de pago", en: "Days of payment delay" },
  "stats.detail2": {
    es: "Entre presentación y acreditación, la inflación erosiona cada cobro",
    en: "Between submission and payment, inflation erodes every charge",
  },
  "stats.label3": { es: "Pérdida real por inflación", en: "Real inflation loss" },
  "stats.detail3": {
    es: "Cada día de demora = plata que perdés. $1M hoy son $920K en 30 días",
    en: "Every day of delay = money you lose. $1M today is $920K in 30 days",
  },
  "stats.source": {
    es: "Fuente: Datos del mercado argentino de salud. Superintendencia de Servicios de Salud.",
    en: "Source: Argentine health market data. Superintendency of Health Services.",
  },

  // ── Patient Stats (tourist segment) ─────────────────────────
  "pstats.label0": { es: "Médicos en la red", en: "Doctors in the network" },
  "pstats.detail0": {
    es: "Profesionales con turnos online, pago MercadoPago y notificaciones push integradas.",
    en: "Professionals with online bookings, MercadoPago payment and push notifications built-in.",
  },
  "pstats.label1": { es: "Confirmación push", en: "Push confirmation" },
  "pstats.detail1": {
    es: "Reservá turno y recibí confirmación push en segundos + recordatorio 24h antes.",
    en: "Book an appointment and get push confirmation in seconds + a 24h reminder.",
  },
  "pstats.label2": { es: "Farmacias con delivery", en: "Pharmacies with delivery" },
  "pstats.detail2": {
    es: "Farmacias habilitadas que envían medicamentos a tu domicilio en CABA y GBA.",
    en: "Licensed pharmacies delivering medications to your door in Buenos Aires metro.",
  },
  "pstats.label3": { es: "Pago integrado", en: "Integrated payment" },
  "pstats.detail3": {
    es: "Pagá tu consulta con MercadoPago al reservar. Sin efectivo, sin demoras.",
    en: "Pay your consultation via MercadoPago when booking. No cash, no delays.",
  },
  "pstats.source": {
    es: "Red Cóndor Salud · Datos actualizados a 2026",
    en: "Cóndor Salud network · Data updated to 2026",
  },

  // ── Problem ─────────────────────────────────────────────────
  "problem.label": { es: "El problema", en: "The problem" },
  "problem.title": {
    es: "El sistema de salud argentino ",
    en: "The Argentine health system ",
  },
  "problem.titleEm": {
    es: "no se habla entre sí",
    en: "doesn't talk to itself",
  },
  "problem.subtitle": {
    es: "Argentina tiene uno de los sistemas de salud más fragmentados del mundo. Público, obras sociales, prepagas y PAMI operan en silos separados. Tu clínica paga las consecuencias.",
    en: "Argentina has one of the most fragmented health systems in the world. Public, social plans, private insurers and PAMI operate in separate silos. Your clinic pays the price.",
  },
  "problem.card0.title": { es: "Hospitales Públicos", en: "Public Hospitals" },
  "problem.card0.desc": {
    es: "Sistemas HIS legados de los años 90. Sin APIs, sin interoperabilidad. 1.400 hospitales completamente desconectados del sector privado. Registros en papel que se pierden entre guardias.",
    en: "Legacy HIS systems from the 90s. No APIs, no interoperability. 1,400 hospitals completely disconnected from the private sector. Paper records lost between shifts.",
  },
  "problem.card0.stats": {
    es: "1.400 hospitales · SISA desactualizado · 0 APIs públicas",
    en: "1,400 hospitals · Outdated SISA · 0 public APIs",
  },
  "problem.card1.title": { es: "Obras Sociales", en: "Social Health Plans" },
  "problem.card1.desc": {
    es: "Más de 300 financiadores, cada uno con su portal web, su formato de presentación (AGFA, formularios propios) y su calendario de auditoría. Tu equipo pierde horas adaptándose a cada uno.",
    en: "Over 300 payers, each with its own web portal, submission format (AGFA, proprietary forms) and audit schedule. Your team loses hours adapting to each one.",
  },
  "problem.card1.stats": {
    es: "300+ portales · Formatos AGFA · Auditoría manual",
    en: "300+ portals · AGFA formats · Manual audit",
  },
  "problem.card2.title": { es: "Prepagas", en: "Private Insurers" },
  "problem.card2.desc": {
    es: "Swiss Medical, OSDE, Galeno — cada prepaga tiene su propia API, su flujo de autorización y sus reglas de cobertura. Una integración diferente por cada contrato. Meses de desarrollo.",
    en: "Swiss Medical, OSDE, Galeno — each insurer has its own API, authorization flow and coverage rules. A different integration for every contract. Months of development.",
  },
  "problem.card2.stats": {
    es: "45+ prepagas · APIs heterogéneas · Meses de integración",
    en: "45+ insurers · Heterogeneous APIs · Months of integration",
  },
  "problem.card3.title": { es: "PAMI", en: "PAMI" },
  "problem.card3.desc": {
    es: "El financiador más grande de Argentina con 5.5 millones de afiliados, nomenclador propio que cambia cada mes, receta digital obligatoria y una tasa de rechazo que llega al 25%.",
    en: "Argentina's largest payer with 5.5 million members, proprietary billing codes that change monthly, mandatory digital prescriptions and a rejection rate up to 25%.",
  },
  "problem.card3.stats": {
    es: "5.5M afiliados · Rechazo 12–25% · Nomenclador mensual",
    en: "5.5M members · 12–25% rejection · Monthly code changes",
  },
  "problem.consequence.title": {
    es: "¿El resultado? Tu clínica pierde tiempo y dinero cada día:",
    en: "The result? Your clinic loses time and money every day:",
  },
  "problem.cons0": {
    es: "Horas de trabajo manual verificando padrones por teléfono",
    en: "Hours of manual work verifying enrollment by phone",
  },
  "problem.cons1": {
    es: "Facturas rechazadas que se descubren 60 días después",
    en: "Rejected claims discovered 60 days later",
  },
  "problem.cons2": {
    es: "Ingresos que se deprecian 8–15% antes de cobrarlos",
    en: "Revenue that depreciates 8–15% before collection",
  },
  "problem.cons3": {
    es: "Personal administrativo saturado con tareas repetitivas",
    en: "Administrative staff overwhelmed with repetitive tasks",
  },
  "problem.cons4": {
    es: "Directivos sin visibilidad del flujo real de ingresos",
    en: "Executives with no visibility into actual revenue flow",
  },
  "problem.cons5": {
    es: "Riesgo de errores de nomenclador en cada presentación",
    en: "Risk of billing-code errors in every submission",
  },

  // ── Features ────────────────────────────────────────────────
  "features.label": { es: "El producto", en: "The product" },
  "features.title": {
    es: "Todo lo que tu clínica necesita. ",
    en: "Everything your clinic needs. ",
  },
  "features.titleEm": {
    es: "Una sola base de datos.",
    en: "One single database.",
  },
  "features.subtitle": {
    es: "35+ módulos integrados: turnos con MercadoPago, chatbot IA, directorio médico con Google Places, notificaciones push, portal del paciente, WhatsApp Business y más. Sin costos ocultos.",
    en: "35+ integrated modules: bookings with MercadoPago, AI chatbot, doctor directory with Google Places, push notifications, patient portal, WhatsApp Business and more. No hidden costs.",
  },
  "features.core0.title": { es: "Turnos Online con Pago", en: "Online Bookings + Payment" },
  "features.core0.desc": {
    es: "Turnos end-to-end: el paciente reserva, paga con MercadoPago, recibe confirmación push y recordatorio 24h antes. Todo automático.",
    en: "End-to-end bookings: the patient books, pays via MercadoPago, gets a push confirmation and a 24h reminder. Fully automated.",
  },
  "features.core0.hl": { es: "MercadoPago + Push integrado", en: "MercadoPago + Push built-in" },
  "features.core1.title": { es: "Facturación Unificada", en: "Unified Billing" },
  "features.core1.desc": {
    es: "Nomenclador SSS + PAMI + arancelarios de cada prepaga en una sola interfaz. Liquidación automática por financiador con validación preventiva de errores.",
    en: "SSS + PAMI billing codes + each insurer's fee schedule in one interface. Auto-settlement per payer with preventive error validation.",
  },
  "features.core1.hl": { es: "Facturá 3x más rápido", en: "Bill 3x faster" },
  "features.core2.title": { es: "Auditoría Inteligente", en: "Smart Audit" },
  "features.core2.desc": {
    es: "El sistema revisa cada línea de facturación contra las reglas de cada financiador ANTES de presentar. Detecta códigos incorrectos, combinaciones inválidas y datos faltantes.",
    en: "The system reviews every billing line against each payer's rules BEFORE submission. Detects incorrect codes, invalid combinations and missing data.",
  },
  "features.core2.hl": { es: "Reduce rechazos 40–60%", en: "Reduces rejections 40–60%" },
  "features.core3.title": { es: "Tracker de Inflación", en: "Inflation Tracker" },
  "features.core3.desc": {
    es: "Visualizá el valor real vs. nominal de cada cobro. Sabé exactamente cuánto perdés por cada día de demora y compará rendimiento entre financiadores ajustado por IPC.",
    en: "See the real vs. nominal value of every charge. Know exactly how much you lose per day of delay and compare payer performance adjusted for CPI.",
  },
  "features.core3.hl": { es: "Visibilidad peso x peso", en: "Full financial visibility" },
  "features.core4.title": { es: "Integración Total", en: "Total Integration" },
  "features.core4.desc": {
    es: "MercadoPago, Web Push VAPID, AFIP, PAMI receta digital, SISA, Google Places y 280+ obras sociales. Recordatorios automáticos vía cron a las 10:00 UTC.",
    en: "MercadoPago, Web Push VAPID, AFIP, PAMI digital prescriptions, SISA, Google Places and 280+ social plans. Auto-reminders via daily cron at 10:00 UTC.",
  },
  "features.core4.hl": { es: "330+ integraciones + Push", en: "330+ integrations + Push" },
  "features.core5.title": { es: "Dashboard Directivo", en: "Executive Dashboard" },
  "features.core5.desc": {
    es: "Ingresos, rechazos, demoras y rendimiento por financiador en una sola vista. Alertas automáticas cuando algo se desvía. Exportá reportes en PDF y Excel.",
    en: "Revenue, rejections, delays and payer performance in one view. Automatic alerts when something deviates. Export PDF & Excel reports.",
  },
  "features.core5.hl": { es: "Decisiones con datos reales", en: "Data-driven decisions" },
  "features.extra0.title": { es: "Disponibilidad médica", en: "Doctor availability" },
  "features.extra0.desc": {
    es: "Grilla semanal de horarios por profesional con CRUD",
    en: "Weekly schedule grid per doctor with full CRUD",
  },
  "features.extra1.title": { es: "Notificaciones push", en: "Push notifications" },
  "features.extra1.desc": {
    es: "Web Push VAPID para turnos, pagos y recordatorios",
    en: "Web Push VAPID for bookings, payments & reminders",
  },
  "features.extra2.title": { es: "Recordatorios auto", en: "Auto reminders" },
  "features.extra2.desc": {
    es: "Cron diario: email + push 24h antes del turno",
    en: "Daily cron: email + push 24h before appointment",
  },
  "features.core6.title": { es: "Cora — Chatbot con IA", en: "Cora — AI Chatbot" },
  "features.core6.desc": {
    es: "Asistente virtual con 20+ intenciones: triage de síntomas, búsqueda de médicos cercanos, verificación de cobertura, pedido de remedios y transporte. Responde en español e inglés 24/7.",
    en: "Virtual assistant with 20+ intents: symptom triage, nearby doctor search, coverage verification, medication orders and transport. Responds in Spanish & English 24/7.",
  },
  "features.core6.hl": { es: "IA + 20 intenciones + ES/EN", en: "AI + 20 intents + ES/EN" },
  "features.core7.title": { es: "Directorio Médico Inteligente", en: "Smart Doctor Directory" },
  "features.core7.desc": {
    es: "Búsqueda por especialidad, ubicación y financiador. Integración con Google Places para datos en tiempo real. Scraping automático de WhatsApp, turnos online, seguros y telemedicina.",
    en: "Search by specialty, location and insurer. Google Places integration for real-time data. Auto-scraping for WhatsApp, online bookings, insurance and telehealth.",
  },
  "features.core7.hl": { es: "Google Places + Web Scraping", en: "Google Places + Web Scraping" },
  "features.core8.title": { es: "Portal del Paciente", en: "Patient Portal" },
  "features.core8.desc": {
    es: "Portal completo para pacientes: mis turnos, mis recetas, mi cobertura, mapa de médicos cercanos, teleconsulta y Cora. Todo responsive y bilingüe.",
    en: "Full patient portal: my appointments, prescriptions, coverage, nearby doctor map, teleconsult and Cora. Fully responsive and bilingual.",
  },
  "features.core8.hl": { es: "Self-service + Mapa GPS", en: "Self-service + GPS Map" },
  "features.extra3.title": { es: "Pagos MercadoPago", en: "MercadoPago payments" },
  "features.extra3.desc": {
    es: "Cobro en checkout al reservar con confirmación auto",
    en: "Checkout payment on booking with auto-confirmation",
  },
  "features.extra4.title": { es: "WhatsApp Business", en: "WhatsApp Business" },
  "features.extra4.desc": {
    es: "Confirmaciones y recordatorios de turno por WhatsApp",
    en: "Booking confirmations & reminders via WhatsApp",
  },
  "features.extra5.title": { es: "Roles y permisos", en: "Roles & permissions" },
  "features.extra5.desc": {
    es: "RBAC con 6 roles: owner, admin, médico, recepción, facturación, auditor",
    en: "RBAC with 6 roles: owner, admin, doctor, reception, billing, auditor",
  },
  "features.extra6.title": { es: "Modo offline PWA", en: "Offline PWA mode" },
  "features.extra6.desc": {
    es: "Service worker + cache para operar sin conexión",
    en: "Service worker + cache for offline operation",
  },
  "features.extra7.title": { es: "Bilingüe ES + EN", en: "Bilingual ES + EN" },
  "features.extra7.desc": {
    es: "Toda la plataforma disponible en español e inglés",
    en: "Entire platform available in Spanish and English",
  },
  "features.extraTitle": {
    es: "Y mucho más incluido en tu plan",
    en: "And much more included in your plan",
  },
  "features.extraSubtitle": {
    es: "35+ módulos totales — turnos, pagos, push, agenda, IA, directorio, farmacia, telemedicina y más",
    en: "35+ total modules — bookings, payments, push, scheduling, AI, directory, pharmacy, telehealth & more",
  },
  "features.cta": { es: "Explorá el demo completo", en: "Explore the full demo" },

  // ── HowItWorks ──────────────────────────────────────────────
  "how.label": { es: "Cómo funciona", en: "How it works" },
  "how.title": { es: "Arrancá en minutos, ", en: "Get started in minutes, " },
  "how.titleEm": { es: "no en meses", en: "not months" },
  "how.subtitle": {
    es: "Otras plataformas tardan semanas en implementarse. Con Cóndor, estás operativo el mismo día.",
    en: "Other platforms take weeks to implement. With Cóndor, you're up and running the same day.",
  },
  "how.stepLabel": { es: "Paso", en: "Step" },
  "how.step0.title": { es: "Creá tu cuenta en 2 minutos", en: "Create your account in 2 minutes" },
  "how.step0.desc": {
    es: "Registrá tu clínica, cargá el CUIT y seleccioná los financiadores con los que trabajás. Sin contratos ni tarjeta de crédito.",
    en: "Register your clinic, enter your tax ID and select your payers. No contracts, no credit card.",
  },
  "how.step1.title": { es: "Conectamos tus financiadores", en: "We connect your payers" },
  "how.step1.desc": {
    es: "Cóndor Salud se integra automáticamente con PAMI, obras sociales y prepagas. Verificamos padrones y configuramos nomencladores.",
    en: "Cóndor Salud integrates automatically with PAMI, social plans and private insurers. We verify enrollment and set up billing codes.",
  },
  "how.step2.title": {
    es: "Turnos, cobros y notificaciones",
    en: "Bookings, payments & notifications",
  },
  "how.step2.desc": {
    es: "Tus pacientes reservan online, pagan con MercadoPago, reciben push de confirmación y recordatorio 24h antes. Vos cobrás sin esfuerzo.",
    en: "Your patients book online, pay via MercadoPago, get push confirmation and a 24h reminder. You collect effortlessly.",
  },

  // ── Integrations ────────────────────────────────────────────
  "int.label": { es: "Integraciones", en: "Integrations" },
  "int.title": {
    es: "Conectado con todo el ecosistema de salud y tecnología argentino",
    en: "Connected with Argentina's entire health & technology ecosystem",
  },
  "int.subtitle": {
    es: "No necesitás integraciones manuales ni archivos CSV. Cóndor se comunica directamente con cada financiador, organismo regulador y plataforma tecnológica.",
    en: "No manual integrations or CSV files needed. Cóndor communicates directly with every payer, regulatory body and technology platform.",
  },
  "int.entity0": { es: "5.5M afiliados", en: "5.5M members" },
  "int.entity1": { es: "Prepaga líder", en: "Leading insurer" },
  "int.entity2": { es: "Grupo médico", en: "Medical group" },
  "int.entity3": { es: "Red nacional", en: "National network" },
  "int.entity4": { es: "Obra social", en: "Social plan" },
  "int.entity5": { es: "Prov. Buenos Aires", en: "Buenos Aires Prov." },
  "int.entity7": { es: "Prepaga premium", en: "Premium insurer" },
  "int.entity9": { es: "Factura electrónica", en: "E-invoicing" },
  "int.entity10": { es: "Medicamentos", en: "Pharmaceuticals" },
  "int.entity11": { es: "Sistema salud", en: "Health system" },
  "int.entity12": { es: "Cobros online", en: "Online payments" },
  "int.entity13": { es: "Directorio médico", en: "Doctor directory" },
  "int.entity14": { es: "Mensajería", en: "Messaging" },
  "int.entity15": { es: "Transporte", en: "Transport" },
  "int.entity16": { es: "Transporte", en: "Transport" },
  "int.entity17": { es: "Transporte", en: "Transport" },
  "int.type0.title": { es: "Obras Sociales", en: "Social Health Plans" },
  "int.type0.desc": {
    es: "Padrones, nomencladores y presentación electrónica",
    en: "Enrollment, billing codes and electronic submission",
  },
  "int.type1.title": { es: "Prepagas", en: "Private Insurers" },
  "int.type1.desc": {
    es: "APIs directas, autorización online y liquidación automática",
    en: "Direct APIs, online authorization and automatic settlement",
  },
  "int.type2.title": { es: "Organismos", en: "Government Bodies" },
  "int.type2.desc": {
    es: "AFIP, ANMAT, SISA, REFEPS, receta digital PAMI",
    en: "AFIP, ANMAT, SISA, REFEPS, PAMI digital prescriptions",
  },
  "int.type3.title": { es: "Plataformas Tech", en: "Tech Platforms" },
  "int.type3.desc": {
    es: "MercadoPago, Google Places, WhatsApp, Uber, Cabify, InDrive, Rappi",
    en: "MercadoPago, Google Places, WhatsApp, Uber, Cabify, InDrive, Rappi",
  },

  // ── Security ────────────────────────────────────────────────
  "sec.label": { es: "Seguridad", en: "Security" },
  "sec.title": { es: "Datos de salud protegidos con ", en: "Health data protected with " },
  "sec.titleEm": {
    es: "estándares de clase mundial",
    en: "world-class standards",
  },
  "sec.subtitle": {
    es: "Los datos de tus pacientes y tu facturación merecen el más alto nivel de protección. Cóndor Salud fue diseñado desde cero con seguridad como prioridad.",
    en: "Your patient data and billing deserve the highest level of protection. Cóndor Salud was designed from scratch with security as a priority.",
  },
  "sec.cert0.title": { es: "Encriptación end-to-end", en: "End-to-end encryption" },
  "sec.cert0.desc": {
    es: "TLS 1.3 en tránsito, AES-256 en reposo. Tus datos de salud nunca viajan en texto plano.",
    en: "TLS 1.3 in transit, AES-256 at rest. Your health data never travels in plain text.",
  },
  "sec.cert1.title": { es: "Ley 25.326 compliant", en: "Law 25.326 compliant" },
  "sec.cert1.desc": {
    es: "Cumplimos la Ley de Protección de Datos Personales de Argentina y la Disposición 11/2006 de la AAIP.",
    en: "We comply with Argentina's Personal Data Protection Law and AAIP Disposition 11/2006.",
  },
  "sec.cert2.desc": {
    es: "Infraestructura certificada con auditorías anuales de seguridad. Uptime 99.95% garantizado.",
    en: "Certified infrastructure with annual security audits. 99.95% uptime guaranteed.",
  },
  "sec.cert3.title": { es: "Auditoría de acceso", en: "Access audit" },
  "sec.cert3.desc": {
    es: "Logs inmutables de cada acción. Sabé quién accedió a qué, cuándo y desde dónde.",
    en: "Immutable logs of every action. Know who accessed what, when and from where.",
  },
  "sec.cert4.desc": {
    es: "Arquitectura preparada para cumplir estándares internacionales de datos de salud.",
    en: "Architecture ready to meet international health data standards.",
  },
  "sec.cert5.desc": {
    es: "Tus datos se almacenan en servidores dentro de Argentina. Sin transferencias internacionales no autorizadas.",
    en: "Your data is stored on servers in Argentina. No unauthorized international transfers.",
  },

  // ── Pricing ─────────────────────────────────────────────────
  "pricing.label": { es: "Pricing", en: "Pricing" },
  "pricing.title": {
    es: "Precio en pesos con ajuste mensual IPC",
    en: "Pricing in pesos with monthly CPI adjustment",
  },
  "pricing.discount": { es: "% dto.", en: "% off" },
  "pricing.perMonth": { es: "/mes", en: "/mo" },
  "pricing.moreModules": { es: "módulos mas", en: "more modules" },
  "pricing.choose": { es: "Elegir plan", en: "Choose plan" },
  "pricing.modulesIncluded": { es: "módulos incluidos", en: "modules included" },
  "pricing.custom": { es: "¿Necesitás algo diferente? ", en: "Need something different? " },
  "pricing.customLink": { es: "Armá tu plan a medida", en: "Build a custom plan" },

  // ── FAQ ─────────────────────────────────────────────────────
  "faq.label": { es: "Preguntas frecuentes", en: "Frequently asked questions" },
  "faq.title": { es: "Todo lo que necesitás saber", en: "Everything you need to know" },
  "faq.q0": { es: "¿Cuánto tarda la implementación?", en: "How long does implementation take?" },
  "faq.a0": {
    es: "La mayoría de las clínicas están operativas el mismo día. Creás tu cuenta, seleccionás financiadores, y Cóndor configura automáticamente los nomencladores y conexiones. Para integraciones avanzadas (HIS, laboratorio), el equipo te acompaña en 48–72 horas.",
    en: "Most clinics are up and running the same day. Create your account, select your payers, and Cóndor automatically sets up billing codes and connections. For advanced integrations (HIS, lab), our team supports you in 48–72 hours.",
  },
  "faq.q1": {
    es: "¿Funciona con PAMI y todas las obras sociales?",
    en: "Does it work with PAMI and all social health plans?",
  },
  "faq.a1": {
    es: "Sí. Cóndor se integra con PAMI (padrón, nomenclador propio, receta digital), más de 280 obras sociales y 45 prepagas. Incluye verificación de padrón en tiempo real, presentación electrónica y seguimiento de expedientes.",
    en: "Yes. Cóndor integrates with PAMI (enrollment, proprietary billing codes, digital prescriptions), 280+ social plans and 45 private insurers. Includes real-time enrollment verification, electronic submission and case tracking.",
  },
  "faq.q2": {
    es: "¿Cómo funciona el ajuste por inflación?",
    en: "How does the inflation adjustment work?",
  },
  "faq.a2": {
    es: "Todos los planes se ajustan mensualmente por IPC (INDEC). El tracker de inflación te muestra el valor real vs. nominal de cada cobro y cuánto perdés por cada día de demora. Así podés tomar decisiones con datos reales.",
    en: "All plans adjust monthly by CPI (INDEC). The inflation tracker shows you the real vs. nominal value of every charge and how much you lose per day of delay. So you can make data-driven decisions.",
  },
  "faq.q3": {
    es: "¿Necesito cambiar mi sistema de historia clínica?",
    en: "Do I need to switch my electronic health records system?",
  },
  "faq.a3": {
    es: "No. Cóndor se integra con los principales HIS del mercado argentino (TRAKCARE, eMedical, PROSALUD, etc.) y también funciona de manera independiente. Importamos datos vía API o archivos estándar.",
    en: "No. Cóndor integrates with the main EHR systems in Argentina (TRAKCARE, eMedical, PROSALUD, etc.) and also works standalone. We import data via API or standard files.",
  },
  "faq.q4": { es: "¿Mis datos están seguros?", en: "Is my data secure?" },
  "faq.a4": {
    es: "Cóndor cumple con la Ley 25.326 de Protección de Datos Personales y está hosteado en infraestructura con certificación SOC 2 e ISO 27001. Los datos de salud se encriptan en tránsito (TLS 1.3) y en reposo (AES-256).",
    en: "Cóndor complies with Law 25.326 for Personal Data Protection and is hosted on SOC 2 and ISO 27001 certified infrastructure. Health data is encrypted in transit (TLS 1.3) and at rest (AES-256).",
  },
  "faq.q5": { es: "¿Puedo probar antes de pagar?", en: "Can I try before paying?" },
  "faq.a5": {
    es: "Sí. Ofrecemos 14 días de prueba gratuita con acceso completo a todos los módulos del plan elegido. No pedimos tarjeta de crédito para empezar. Los primeros 50 del waitlist reciben 30 días gratis.",
    en: "Yes. We offer a 14-day free trial with full access to all modules in your chosen plan. No credit card required. The first 50 on the waitlist get 30 days free.",
  },
  "faq.q6": {
    es: "¿Qué pasa si tengo clínicas en varias provincias?",
    en: "What if I have clinics in multiple provinces?",
  },
  "faq.a6": {
    es: "El plan Enterprise incluye multi-sucursal con dashboard consolidado. Cada sede puede tener sus propios financiadores y nomencladores, pero la facturación y reportes se unifican en una sola vista directiva.",
    en: "The Enterprise plan includes multi-branch with a consolidated dashboard. Each location can have its own payers and billing codes, but billing and reports unify into one executive view.",
  },
  "faq.q7": {
    es: "¿Ofrecen soporte y capacitación?",
    en: "Do you offer support and training?",
  },
  "faq.a7": {
    es: "Todos los planes incluyen soporte por WhatsApp en horario extendido (8–22h). Los planes Profesional y Enterprise incluyen onboarding personalizado, capacitación del equipo y un Customer Success Manager dedicado.",
    en: "All plans include WhatsApp support during extended hours (8am–10pm). Professional and Enterprise plans include personalized onboarding, team training and a dedicated Customer Success Manager.",
  },

  // ── FAQ (patient / tourist overrides) ────────────────────────
  "faq.title@tourist": { es: "Preguntas de pacientes", en: "Patient questions" },
  "faq.q0@tourist": { es: "¿Es gratis para pacientes?", en: "Is it free for patients?" },
  "faq.a0@tourist": {
    es: "Sí, 100% gratis. Cóndor Salud cobra a las clínicas, no a los pacientes. Podés buscar médicos, hacer teleconsultas y pedir remedios sin costo alguno.",
    en: "Yes, 100% free. Cóndor Salud charges clinics, not patients. You can search doctors, do teleconsults and order meds at no cost.",
  },
  "faq.q1@tourist": {
    es: "¿Cómo encuentro un médico cerca?",
    en: "How do I find a doctor nearby?",
  },
  "faq.a1@tourist": {
    es: "Usá el buscador con GPS o hablá con Cora (nuestro chatbot). Te mostramos médicos por especialidad, distancia y horario, con mapa, cómo llegar y opciones de Uber, Cabify e InDrive.",
    en: "Use the GPS-powered search or talk to Cora (our chatbot). We show doctors by specialty, distance and schedule, with a map, directions and Uber, Cabify & InDrive ride options.",
  },
  "faq.q2@tourist": { es: "¿Cómo funciona la teleconsulta?", en: "How does teleconsult work?" },
  "faq.a2@tourist": {
    es: "Elegís un médico, seleccionás un horario y te conectás por videollamada desde el navegador. No necesitás instalar nada. El médico puede darte recetas digitales.",
    en: "Pick a doctor, choose a time slot and connect via video call from your browser. No app install needed. The doctor can issue digital prescriptions.",
  },
  "faq.q3@tourist": { es: "¿Puedo pedir remedios a domicilio?", en: "Can I get meds delivered?" },
  "faq.a3@tourist": {
    es: "Sí. Después de tu consulta, podés enviar la receta a una farmacia con delivery (Rappi, PedidosYa o retiro en sucursal). Todo integrado.",
    en: "Yes. After your consultation, send the prescription to a pharmacy with delivery (Rappi, PedidosYa or in-store pickup). All integrated.",
  },
  "faq.q4@tourist": { es: "¿Mis datos médicos están seguros?", en: "Is my medical data safe?" },
  "faq.a4@tourist": {
    es: "Sí. Cumplimos con la Ley 25.326 de Protección de Datos. Todo se encripta con TLS 1.3 y AES-256. Tus datos son tuyos y nunca se comparten sin tu consentimiento.",
    en: "Yes. We comply with Data Protection Law 25.326. Everything is encrypted with TLS 1.3 and AES-256. Your data is yours and never shared without consent.",
  },
  "faq.q5@tourist": { es: "¿Necesito registrarme?", en: "Do I need to sign up?" },
  "faq.a5@tourist": {
    es: "Para buscar médicos y hablar con Cora, no. Para guardar historial, hacer teleconsultas o pedir remedios, creás una cuenta gratuita en 30 segundos.",
    en: "To search doctors and talk to Cora, no. To save history, do teleconsults or order meds, create a free account in 30 seconds.",
  },
  "faq.q6@tourist": {
    es: "¿Funciona fuera de Buenos Aires?",
    en: "Does it work outside Buenos Aires?",
  },
  "faq.a6@tourist": {
    es: "Sí. Tenemos médicos en toda Argentina. La teleconsulta funciona desde cualquier lugar con internet. El delivery de medicamentos se expande continuamente.",
    en: "Yes. We have doctors across Argentina. Teleconsult works from anywhere with internet. Medication delivery is continuously expanding.",
  },
  "faq.q7@tourist": { es: "¿Hablan inglés?", en: "Do you speak English?" },
  "faq.a7@tourist": {
    es: "Sí. Todo el sistema funciona en español e inglés. Cora (nuestro chatbot de enfermería) atiende 24/7 en ambos idiomas. Muchos médicos de la red también hablan inglés.",
    en: "Yes. The entire system works in Spanish and English. Cora (our nursing chatbot) is available 24/7 in both languages. Many network doctors also speak English.",
  },

  // ── Waitlist ────────────────────────────────────────────────
  "wl.label": { es: "Acceso anticipado", en: "Early access" },
  "wl.title": {
    es: "Sumate al waitlist y sé de los primeros",
    en: "Join the waitlist and be first",
  },
  "wl.subtitle": {
    es: "Dejá tus datos y te contactamos cuando tengamos un lugar para tu clínica. Los primeros 50 del waitlist arrancan con 30 días de acceso completo, sin costo.",
    en: "Leave your details and we'll contact you when there's a spot for your clinic. The first 50 on the waitlist start with 30 days of full access, free.",
  },
  "wl.benefit0": { es: "Los primeros 50 reciben 30 días gratis", en: "First 50 get 30 days free" },
  "wl.benefit1": { es: "Sin tarjeta de crédito", en: "No credit card" },
  "wl.benefit2": {
    es: "Onboarding personalizado incluido",
    en: "Personalized onboarding included",
  },
  "wl.emailError": {
    es: "Ingresá un email válido (ej: tu@clinica.com.ar)",
    en: "Enter a valid email (e.g. you@clinic.com)",
  },
  "wl.apiError": {
    es: "Hubo un problema. Intentá de nuevo.",
    en: "Something went wrong. Please try again.",
  },
  "wl.networkError": {
    es: "Error de conexión. Verificá tu internet e intentá de nuevo.",
    en: "Connection error. Check your internet and try again.",
  },
  "wl.successTitle": { es: "¡Listo! Estás en la lista.", en: "Done! You're on the list." },
  "wl.successSub": {
    es: "Te contactamos dentro de 48 horas para coordinar el onboarding de tu clínica.",
    en: "We'll contact you within 48 hours to coordinate onboarding for your clinic.",
  },
  "wl.successCta": { es: "Mientras tanto, explorá el demo", en: "Meanwhile, explore the demo" },
  "wl.namePlaceholder": { es: "Tu nombre", en: "Your name" },
  "wl.loading": { es: "Registrando…", en: "Registering…" },
  "wl.submit": { es: "Quiero acceso anticipado", en: "I want early access" },
  "wl.legal1": { es: "Al registrarte aceptás nuestros ", en: "By registering you accept our " },
  "wl.legalTerms": { es: "Términos", en: "Terms" },
  "wl.legalAnd": { es: " y ", en: " and " },
  "wl.legalPrivacy": { es: "Política de Privacidad", en: "Privacy Policy" },

  // ── FinalCTA ────────────────────────────────────────────────
  "cta.label": { es: "Empezá hoy", en: "Start today" },
  "cta.title1": {
    es: "Tu clínica merece cobrar lo que le corresponde.",
    en: "Your clinic deserves to get paid what it's owed.",
  },
  "cta.title2": { es: "Sin rechazos. Sin demoras.", en: "No rejections. No delays." },
  "cta.subtitle": {
    es: "Probá gratis durante 14 días y empezá a facturar sin errores desde el primer día.",
    en: "Try free for 14 days and start billing without errors from day one.",
  },
  "cta.hl0": { es: "Turnos + cobro MercadoPago", en: "Bookings + MercadoPago" },
  "cta.hl1": { es: "Push + recordatorios auto", en: "Push + auto-reminders" },
  "cta.hl2": { es: "14 días gratis, sin tarjeta", en: "14 days free, no card" },
  "cta.hl3": { es: "Cora IA + chatbot 24/7", en: "Cora AI + 24/7 chatbot" },
  "cta.hl4": { es: "Directorio médico GPS", en: "GPS doctor directory" },
  "cta.primary": { es: "Crear cuenta gratis", en: "Create free account" },
  "cta.secondary": { es: "Ver demo en vivo", en: "Watch live demo" },
  "cta.bottom": {
    es: "Setup en 2 minutos · Sin tarjeta de crédito · Soporte por WhatsApp",
    en: "2-minute setup · No credit card · WhatsApp support",
  },

  // ── Footer ──────────────────────────────────────────────────
  "footer.colSolution": { es: "Solución", en: "Solution" },
  "footer.problem": { es: "Problema", en: "Problem" },
  "footer.solution": { es: "Solución", en: "Solution" },
  "footer.plans": { es: "Planes", en: "Plans" },
  "footer.colPlatform": { es: "Plataforma", en: "Platform" },
  "footer.demo": { es: "Demo", en: "Demo" },
  "footer.patient": { es: "Portal Paciente", en: "Patient Portal" },
  "footer.waitlist": { es: "Waitlist", en: "Waitlist" },
  "footer.partners": { es: "Partners", en: "Partners" },
  "footer.healthClub": { es: "Health Club", en: "Health Club" },
  "footer.embassy": { es: "Viajeros Americanos", en: "American Travelers" },
  "footer.colAccount": { es: "Cuenta", en: "Account" },
  "footer.login": { es: "Iniciar sesión", en: "Log in" },
  "footer.register": { es: "Registrarse", en: "Sign up" },
  "footer.colLegal": { es: "Legal", en: "Legal" },
  "footer.privacy": { es: "Privacidad", en: "Privacy" },
  "footer.terms": { es: "Términos", en: "Terms" },
  "footer.copy": {
    es: "Plataforma de Inteligencia · Sistema de Salud Argentino · ",
    en: "Intelligence Platform · Argentine Health System · ",
  },

  // ── WhatsAppFloat ───────────────────────────────────────────
  "wa.tooltip": { es: "Chateá con nosotros", en: "Chat with us" },
  "wa.aria": { es: "Contactar por WhatsApp para demo", en: "Contact via WhatsApp for demo" },
  "wa.message": {
    es: "Hola, me interesa una demo de Cóndor Salud para mi clínica. ¿Podemos coordinar?",
    en: "Hi, I'm interested in a demo of Cóndor Salud for my clinic. Can we set up a call?",
  },

  // ── Chatbot (card UI labels) ────────────────────────────────
  "chat.directions": { es: "Cómo llegar", en: "Get directions" },
  "chat.viewMap": { es: "Ver en mapa", en: "View on map" },

  // ═══════════════════════════════════════════════════════════
  // ── SEGMENT OVERRIDES ──────────────────────────────────────
  // Keys use the pattern "baseKey@segment".
  // The i18n context tries "{key}@{segment}" first, then "{key}".
  // Only overrides need to be defined here; everything else falls
  // back to the default (clinic-focused) copy above.
  // ═══════════════════════════════════════════════════════════

  // ── PROVIDER (healthcare clinics) ──────────────────────────
  // These are the SAME as defaults — but we include a few tweaks
  // that lean even harder into clinic-owner language.

  "hero.badge@provider": {
    es: "Nuevo: Turnos con MercadoPago, push notifications y gestión de disponibilidad",
    en: "New: Bookings with MercadoPago, push notifications & availability management",
  },
  "hero.title1@provider": {
    es: "Gestioná tu clínica.",
    en: "Run your clinic.",
  },
  "hero.title2@provider": {
    es: "Sin perder un peso.",
    en: "Without losing a dime.",
  },
  "hero.subtitle@provider": {
    es: "Turnos online con cobro MercadoPago, notificaciones push en tiempo real, recordatorios automáticos y gestión de disponibilidad. Todo integrado con PAMI, obras sociales y prepagas.",
    en: "Online bookings with MercadoPago checkout, real-time push notifications, automated reminders and availability management. All integrated with PAMI, social plans and private insurers.",
  },
  "hero.cta1@provider": {
    es: "Empezar gratis — 14 días",
    en: "Start free — 14 days",
  },
  "hero.cta2@provider": {
    es: "Ver demo del dashboard",
    en: "Watch dashboard demo",
  },
  "hero.fine@provider": {
    es: "Sin tarjeta de crédito · Setup en 2 minutos · Cancelá cuando quieras",
    en: "No credit card · 2-minute setup · Cancel anytime",
  },

  "problem.label@provider": { es: "El problema", en: "The problem" },
  "problem.title@provider": {
    es: "Tu clínica pierde plata ",
    en: "Your clinic loses money ",
  },
  "problem.titleEm@provider": {
    es: "todos los días",
    en: "every single day",
  },
  "problem.subtitle@provider": {
    es: "Rechazos de facturación, demoras de pago que se comen la inflación, y horas de trabajo manual verificando padrones por teléfono. Cóndor Salud automatiza todo.",
    en: "Billing rejections, payment delays eaten by inflation, and hours of manual work verifying enrollment by phone. Cóndor Salud automates it all.",
  },

  "features.title@provider": {
    es: "Todo lo que tu clínica necesita. ",
    en: "Everything your clinic needs. ",
  },
  "features.titleEm@provider": {
    es: "Turnos, pagos, IA y más.",
    en: "Bookings, payments, AI & more.",
  },

  "how.title@provider": { es: "Empezá a facturar ", en: "Start billing " },
  "how.titleEm@provider": { es: "el mismo día", en: "the same day" },
  "how.subtitle@provider": {
    es: "Registrate, conectá tus financiadores y empezá a verificar cobertura y facturar sin errores. Todo en el primer día.",
    en: "Sign up, connect your payers and start verifying coverage and billing without errors. All on day one.",
  },

  "cta.title1@provider": {
    es: "Tu clínica merece cobrar lo que le corresponde.",
    en: "Your clinic deserves to get paid what it's owed.",
  },
  "cta.title2@provider": { es: "Sin rechazos. Sin demoras.", en: "No rejections. No delays." },
  "cta.subtitle@provider": {
    es: "Probá gratis durante 14 días y empezá a facturar sin errores desde el primer día.",
    en: "Try free for 14 days and start billing without errors from day one.",
  },

  "wl.title@provider": {
    es: "Unite al waitlist para tu clínica",
    en: "Join the waitlist for your clinic",
  },
  "wl.subtitle@provider": {
    es: "Dejá el email institucional de tu clínica y te contactamos para el onboarding. Los primeros 50 arrancan con 30 días gratis.",
    en: "Leave your clinic's business email and we'll contact you for onboarding. First 50 start with 30 days free.",
  },

  // ── TOURIST (individuals / patients) ───────────────────────

  "hero.badge@tourist": {
    es: "Nuevo: Reservá turnos online, pagá con MercadoPago y recibí alertas push",
    en: "New: Book appointments online, pay with MercadoPago & get push alerts",
  },
  "hero.title1@tourist": {
    es: "Tu salud en Argentina.",
    en: "Your health in Argentina.",
  },
  "hero.title2@tourist": {
    es: "Resuelta en minutos.",
    en: "Sorted in minutes.",
  },
  "hero.subtitle@tourist": {
    es: "Reservá turno, pagá con MercadoPago, recibí confirmación push al instante y recordatorio 24h antes. Buscá médicos con GPS, verificá cobertura y pedí remedios. Todo gratis.",
    en: "Book an appointment, pay with MercadoPago, get instant push confirmation and a 24h reminder. Find doctors with GPS, verify coverage and order meds. All free.",
  },
  "hero.cta1@tourist": {
    es: "Buscar médico cerca mío",
    en: "Find a doctor near me",
  },
  "hero.cta2@tourist": {
    es: "Hablar con Cora (asistente)",
    en: "Talk to Cora (assistant)",
  },
  "hero.fine@tourist": {
    es: "Gratis · Sin registro · Funciona con tu obra social o prepaga",
    en: "Free · No signup · Works with your health plan",
  },
  "hero.trust@tourist": {
    es: "Funciona con las principales obras sociales y prepagas",
    en: "Works with Argentina's major health plans",
  },

  "hero.mockBilled@tourist": { es: "Turnos", en: "Appointments" },
  "hero.mockCollected@tourist": { es: "Teleconsultas", en: "Teleconsults" },
  "hero.mockRejections@tourist": { es: "Farmacias", en: "Pharmacies" },
  "hero.mockDelay@tourist": { es: "Respuesta", en: "Response" },
  "hero.mockChartTitle@tourist": {
    es: "Consultas y Teleconsultas — Mar 2026",
    en: "Visits & Teleconsults — Mar 2026",
  },

  // Tourist dashboard mockup – KPI values
  "hero.mockBilledVal@tourist": { es: "3 próximos", en: "3 upcoming" },
  "hero.mockBilledChange@tourist": { es: "Pagados con MP", en: "Paid via MP" },
  "hero.mockCollectedVal@tourist": { es: "24/7", en: "24/7" },
  "hero.mockCollectedChange@tourist": { es: "Cora disponible", en: "Cora available" },
  "hero.mockRejectionsVal@tourist": { es: "12 cerca", en: "12 nearby" },
  "hero.mockRejectionsChange@tourist": { es: "< 1 km", en: "< 1 km" },
  "hero.mockDelayVal@tourist": { es: "< 30s", en: "< 30s" },
  "hero.mockDelayChange@tourist": { es: "Push instantáneo", en: "Instant push" },
  "hero.mockPatients@tourist": { es: "Cobertura", en: "Coverage" },
  "hero.mockPatientsVal@tourist": { es: "Activa", en: "Active" },
  "hero.mockPatientsChange@tourist": { es: "OSDE 310 verificada", en: "OSDE 310 verified" },
  "hero.mockAgenda@tourist": { es: "Recetas", en: "Prescriptions" },
  "hero.mockAgendaVal@tourist": { es: "2", en: "2" },
  "hero.mockAgendaChange@tourist": { es: "Listas para retirar", en: "Ready for pickup" },
  "hero.mockCoraUser@tourist": {
    es: "Necesito un clínico cerca de Palermo que atienda hoy",
    en: "I need a GP near Palermo available today",
  },
  "hero.mockCoraReply@tourist": {
    es: "Encontré 3 clínicos disponibles hoy a menos de 1 km. El más cercano es la Dra. López en Av. Santa Fe 3200, turno a las 16:30. ¿Reservo? También podés pedir un Uber o Cabify para llegar.",
    en: "I found 3 GPs available today within 1 km. The closest is Dr. López at Av. Santa Fe 3200, slot at 4:30 PM. Shall I book? You can also grab an Uber or Cabify to get there.",
  },
  "hero.mockCoverageTitle@tourist": { es: "Tu cobertura", en: "Your coverage" },
  "hero.mockCoveragePlan@tourist": { es: "OSDE 310", en: "OSDE 310" },
  "hero.mockCoverageStatus@tourist": { es: "Activa · Copago $0", en: "Active · Copay $0" },
  // Tourist dashboard mockup – appointment list
  "hero.mockUrl@tourist": { es: "condorsalud.com/paciente", en: "condorsalud.com/paciente" },
  "hero.mockApptTitle@tourist": { es: "Próximos turnos", en: "Upcoming appointments" },
  "hero.mockAppt1.doctor@tourist": { es: "Dra. María López", en: "Dr. María López" },
  "hero.mockAppt1.spec@tourist": {
    es: "Clínica médica · Teleconsulta",
    en: "General practice · Teleconsult",
  },
  "hero.mockAppt1.time@tourist": { es: "Hoy, 16:30", en: "Today, 4:30 PM" },
  "hero.mockAppt2.doctor@tourist": { es: "Dr. Alejandro Ruiz", en: "Dr. Alejandro Ruiz" },
  "hero.mockAppt2.spec@tourist": { es: "Dermatología · Presencial", en: "Dermatology · In-person" },
  "hero.mockAppt2.time@tourist": { es: "Mié 19, 10:00", en: "Wed 19, 10:00 AM" },
  "hero.mockAppt3.doctor@tourist": { es: "Dra. Carla Benítez", en: "Dr. Carla Benítez" },
  "hero.mockAppt3.spec@tourist": { es: "Odontología · Presencial", en: "Dentistry · In-person" },
  "hero.mockAppt3.time@tourist": { es: "Vie 21, 14:00", en: "Fri 21, 2:00 PM" },
  "hero.mockCoraTitle@tourist": {
    es: "Cora — Tu asistente de salud",
    en: "Cora — Your health assistant",
  },
  "hero.mockCoraMsg@tourist": {
    es: "¡Hola! Soy Cora. ¿En qué te puedo ayudar? Puedo buscar médicos, verificar cobertura, pedir remedios o llamarte un Uber al consultorio.",
    en: "Hi! I'm Cora. How can I help? I can find doctors, verify coverage, order meds or get you an Uber to the clinic.",
  },
  "hero.mockCoraInput@tourist": {
    es: "Necesito un médico cerca mío...",
    en: "I need a doctor near me...",
  },

  // Provider dashboard mockup – new keys
  "hero.mockUrl@provider": { es: "condorsalud.com/dashboard", en: "condorsalud.com/dashboard" },
  "hero.mockBilledVal@provider": { es: "$12.4M", en: "$12.4M" },
  "hero.mockBilledChange@provider": { es: "+18% vs mes ant.", en: "+18% vs last month" },
  "hero.mockCollectedVal@provider": { es: "$9.8M", en: "$9.8M" },
  "hero.mockCollectedChange@provider": { es: "+24% vs mes ant.", en: "+24% vs last month" },
  "hero.mockRejectionsVal@provider": { es: "3.2%", en: "3.2%" },
  "hero.mockRejectionsChange@provider": { es: "-62% rechazos", en: "-62% rejections" },
  "hero.mockDelayVal@provider": { es: "22 días", en: "22 days" },
  "hero.mockDelayChange@provider": { es: "-45 días demora", en: "-45 days delay" },
  "hero.mockAlertsTitle@provider": { es: "Alertas de hoy", en: "Today's alerts" },
  "hero.mockAlert1@provider": {
    es: "MercadoPago: 12 pagos de consultas acreditados — $186.000",
    en: "MercadoPago: 12 consultation payments credited — $186,000",
  },
  "hero.mockAlert2@provider": {
    es: "Cron: 31 recordatorios de turno enviados (email + push)",
    en: "Cron: 31 appointment reminders sent (email + push)",
  },
  "hero.mockAlert3@provider": {
    es: "Push: 52 confirmaciones de turno entregadas en tiempo real",
    en: "Push: 52 booking confirmations delivered in real time",
  },
  "hero.mockAutoTitle@provider": { es: "Automatizaciones activas", en: "Active automations" },
  "hero.mockAuto1@provider": { es: "Cobro MercadoPago auto", en: "Auto MercadoPago checkout" },
  "hero.mockAuto2@provider": { es: "Push confirmación turno", en: "Push booking confirmation" },
  "hero.mockAuto3@provider": { es: "Recordatorio 24h cron", en: "24h cron reminder" },
  "hero.mockAuto4@provider": { es: "Sync disponibilidad", en: "Availability sync" },
  "hero.mockAlert4@provider": {
    es: "Disponibilidad: 3 médicos actualizaron 96 slots esta semana",
    en: "Availability: 3 doctors updated 96 slots this week",
  },
  "hero.mockPatients@provider": { es: "Pacientes hoy", en: "Patients today" },
  "hero.mockPatientsVal@provider": { es: "47", en: "47" },
  "hero.mockPatientsChange@provider": { es: "+12 vs ayer", en: "+12 vs yesterday" },
  "hero.mockAgenda@provider": { es: "Agenda", en: "Schedule" },
  "hero.mockAgendaVal@provider": { es: "94%", en: "94%" },
  "hero.mockAgendaChange@provider": { es: "3 slots libres", en: "3 slots free" },
  "hero.mockRevenueTitle@provider": { es: "Meta mensual", en: "Monthly target" },
  "hero.mockRevenuePercent@provider": { es: "78%", en: "78%" },
  "hero.mockRevenueLabel@provider": {
    es: "$12.4M de $15.9M facturado",
    en: "$12.4M of $15.9M billed",
  },

  "problem.label@tourist": { es: "El problema", en: "The problem" },
  "problem.title@tourist": {
    es: "Necesitás atención médica ",
    en: "You need medical care ",
  },
  "problem.titleEm@tourist": {
    es: "y no sabés por dónde empezar",
    en: "and don't know where to start",
  },
  "problem.subtitle@tourist": {
    es: "Estás en Argentina — sea como turista, residente o visitante — y te sentís mal. No conocés el sistema de salud, no sabés qué te cubre, y cada hospital tiene reglas diferentes.",
    en: "You're in Argentina — as a tourist, resident or visitor — and you're not feeling well. You don't know the health system, your coverage, or each hospital's rules.",
  },

  "problem.card0.title@tourist": { es: "No conocés el sistema", en: "Unfamiliar system" },
  "problem.card0.desc@tourist": {
    es: "Obras sociales, prepagas, PAMI, hospitales públicos — Argentina tiene un sistema de salud fragmentado que confunde incluso a los locales.",
    en: "Social plans, private insurers, PAMI, public hospitals — Argentina has a fragmented health system that confuses even locals.",
  },
  "problem.card0.stats@tourist": {
    es: "300+ financiadores · Reglas distintas · Sin guía clara",
    en: "300+ payers · Different rules · No clear guide",
  },
  "problem.card1.title@tourist": { es: "Barrera del idioma", en: "Language barrier" },
  "problem.card1.desc@tourist": {
    es: "Muchos médicos y sistemas solo hablan español. Los formularios de admisión, recetas y autorizaciones son complicados si no dominás el idioma.",
    en: "Many doctors and systems only speak Spanish. Admission forms, prescriptions and authorizations are complicated if you don't speak the language.",
  },
  "problem.card1.stats@tourist": {
    es: "Formularios en español · Recetas médicas · Autorizaciones",
    en: "Spanish-only forms · Prescriptions · Authorizations",
  },
  "problem.card2.title@tourist": { es: "No sabés qué te cubre", en: "Coverage confusion" },
  "problem.card2.desc@tourist": {
    es: "¿Tu seguro de viaje cubre esa consulta? ¿Cuánto vas a pagar de copago? ¿Necesitás autorización previa? Sin Cóndor, estás a ciegas.",
    en: "Does your travel insurance cover that visit? How much is the copay? Do you need prior authorization? Without Cóndor, you're flying blind.",
  },
  "problem.card2.stats@tourist": {
    es: "Copagos variables · Autorizaciones · Topes de cobertura",
    en: "Variable copays · Authorizations · Coverage limits",
  },
  "problem.card3.title@tourist": { es: "Emergencias sin GPS", en: "Emergencies without GPS" },
  "problem.card3.desc@tourist": {
    es: "Necesitás una guardia YA y no sabés dónde queda la más cercana ni si acepta tu cobertura. Con Cóndor encontrás la guardia y pedís un Uber en segundos.",
    en: "You need an ER NOW and don't know where the closest one is or if it accepts your insurance. With Cóndor you find the ER and grab an Uber in seconds.",
  },
  "problem.card3.stats@tourist": {
    es: "Guardias · Farmacias 24h · GPS + Uber/Cabify",
    en: "Emergency rooms · 24h pharmacies · GPS + Uber/Cabify",
  },

  "problem.consequence.title@tourist": {
    es: "¿El resultado? Perdés tiempo cuando más necesitás ayuda:",
    en: "The result? You waste time when you need help most:",
  },
  "problem.cons0@tourist": {
    es: "Horas buscando qué hospital acepta tu cobertura",
    en: "Hours searching which hospital accepts your insurance",
  },
  "problem.cons1@tourist": {
    es: "Pagás de más porque no verificaste el copago antes",
    en: "Overpaying because you didn't verify copay first",
  },
  "problem.cons2@tourist": {
    es: "Recetas que no sabés dónde comprar ni cuánto cuestan",
    en: "Prescriptions you don't know where to buy or how much they cost",
  },
  "problem.cons3@tourist": {
    es: "Guardias lejos o que no aceptan tu seguro de viaje",
    en: "ERs far away or that don't accept your travel insurance",
  },
  "problem.cons4@tourist": {
    es: "Médicos que no hablan tu idioma, sin traductor",
    en: "Doctors who don't speak your language, no translator",
  },
  "problem.cons5@tourist": {
    es: "Síntomas que no sabés si son urgentes o pueden esperar",
    en: "Symptoms you're not sure are urgent or can wait",
  },

  "features.label@tourist": { es: "Tu solución", en: "Your solution" },
  "features.title@tourist": {
    es: "Todo para cuidar tu salud. ",
    en: "Everything for your health. ",
  },
  "features.titleEm@tourist": {
    es: "Desde tu celular.",
    en: "From your phone.",
  },
  "features.subtitle@tourist": {
    es: "Reservá turnos con MercadoPago, chatbot Cora con IA, mapa interactivo de médicos, WhatsApp directo al consultorio, Uber/Cabify al médico, teleconsultas y remedios a domicilio. Todo gratis, en español e inglés.",
    en: "Book with MercadoPago, AI chatbot Cora, interactive doctor map, direct WhatsApp to clinic, Uber/Cabify to doctor, teleconsults and meds delivered. All free, in Spanish & English.",
  },
  "features.core0.title@tourist": { es: "Turnos online con pago", en: "Online bookings + payment" },
  "features.core0.desc@tourist": {
    es: "Elegí médico, reservá turno y pagá con MercadoPago. Recibí confirmación push al instante y recordatorio 24h antes por email y notificación.",
    en: "Choose a doctor, book and pay with MercadoPago. Get instant push confirmation and a 24h reminder via email and notification.",
  },
  "features.core0.hl@tourist": { es: "MercadoPago + Push", en: "MercadoPago + Push" },
  "features.core1.title@tourist": {
    es: "Verificá tu cobertura al instante",
    en: "Verify coverage instantly",
  },
  "features.core1.desc@tourist": {
    es: "Ingresá tu obra social o seguro de viaje y sabé al toque qué te cubre, cuánto vas a pagar de copago y si necesitás autorización.",
    en: "Enter your health plan or travel insurance and instantly know what's covered, your copay, and if you need prior authorization.",
  },
  "features.core1.hl@tourist": { es: "Respuesta en segundos", en: "Answers in seconds" },
  "features.core2.title@tourist": { es: "Teleconsulta por video", en: "Video teleconsult" },
  "features.core2.desc@tourist": {
    es: "Hablá con un médico desde tu hotel, depto o donde estés. En español o inglés. Sin esperas, sin ir a ningún lado.",
    en: "Talk to a doctor from your hotel, apartment or wherever you are. In Spanish or English. No waiting, no travel.",
  },
  "features.core2.hl@tourist": { es: "Desde donde estés", en: "From anywhere" },
  "features.core3.title@tourist": { es: "Remedios a domicilio", en: "Meds to your door" },
  "features.core3.desc@tourist": {
    es: "Pedí medicamentos por Rappi o PedidosYa directo a tu puerta. Buscá precios, compará farmacias y ahorrá con genéricos.",
    en: "Order medication via Rappi or PedidosYa straight to your door. Compare prices, pharmacies and save with generics.",
  },
  "features.core3.hl@tourist": { es: "Rappi · PedidosYa", en: "Rappi · PedidosYa" },
  "features.core4.title@tourist": { es: "Guardias y farmacias 24h", en: "ERs & 24h pharmacies" },
  "features.core4.desc@tourist": {
    es: "Encontrá la guardia o farmacia más cercana en tiempo real. Con dirección, teléfono, Google Maps y opción de pedir Uber, Cabify o InDrive.",
    en: "Find the nearest ER or pharmacy in real time. With address, phone, Google Maps and Uber, Cabify or InDrive ride options.",
  },
  "features.core4.hl@tourist": { es: "GPS + Uber/Cabify/InDrive", en: "GPS + Uber/Cabify/InDrive" },
  "features.core5.title@tourist": {
    es: "Cora — Tu enfermera virtual",
    en: "Cora — Your virtual nurse",
  },
  "features.core5.desc@tourist": {
    es: "Contale a Cora qué te pasa y te orienta al médico indicado, te recomienda qué tomar, te busca atención cerca y te pide un Uber o Cabify para llegar. Como hablar con una enfermera.",
    en: "Tell Cora what's wrong and she'll guide you to the right doctor, recommend what to take, find care nearby and get you an Uber or Cabify to get there. Like talking to a nurse.",
  },
  "features.core5.hl@tourist": { es: "Chat 24/7 en ES + EN", en: "24/7 chat in ES + EN" },
  "features.core6.title@tourist": {
    es: "Mapa interactivo de médicos",
    en: "Interactive doctor map",
  },
  "features.core6.desc@tourist": {
    es: "Mapa GPS con todos los médicos cerca tuyo. Filtrá por especialidad, rating y disponibilidad. Tocá un pin y veé horarios, teléfono y cómo llegar.",
    en: "GPS map with all doctors near you. Filter by specialty, rating and availability. Tap a pin to see hours, phone and directions.",
  },
  "features.core6.hl@tourist": { es: "Google Maps + Pins en vivo", en: "Google Maps + Live Pins" },
  "features.core7.title@tourist": {
    es: "WhatsApp directo al médico",
    en: "Direct WhatsApp to doctor",
  },
  "features.core7.desc@tourist": {
    es: "Contacta al médico por WhatsApp con un solo toque. Mensaje pre-armado con tu nombre, especialidad y disponibilidad. Sin esperar llamadas.",
    en: "Contact the doctor via WhatsApp in one tap. Pre-filled message with your name, specialty and availability. No phone calls needed.",
  },
  "features.core7.hl@tourist": { es: "1 toque = WhatsApp", en: "1 tap = WhatsApp" },
  "features.core8.title@tourist": { es: "Uber, Cabify e InDrive", en: "Uber, Cabify & InDrive" },
  "features.core8.desc@tourist": {
    es: "Pedí un viaje al consultorio, guardia o farmacia con un toque. Cora te muestra la dirección y te abre Uber, Cabify o InDrive directo.",
    en: "Get a ride to the clinic, ER or pharmacy in one tap. Cora shows the address and opens Uber, Cabify or InDrive directly.",
  },
  "features.core8.hl@tourist": { es: "Viaje en 1 toque", en: "Ride in 1 tap" },
  "features.cta@tourist": { es: "Probá el chatbot ahora", en: "Try the chatbot now" },
  "features.extraTitle@tourist": {
    es: "Todo lo que necesitás como paciente",
    en: "Everything you need as a patient",
  },
  "features.extraSubtitle@tourist": {
    es: "Turnos, pagos, push, mapa, WhatsApp, transporte, teleconsulta y farmacia — todo gratis",
    en: "Bookings, payments, push, map, WhatsApp, transport, teleconsult & pharmacy — all free",
  },
  "features.extra0.title@tourist": { es: "Notificaciones push", en: "Push notifications" },
  "features.extra0.desc@tourist": {
    es: "Confirmación y recordatorio directo a tu celular",
    en: "Confirmation and reminder straight to your phone",
  },
  "features.extra1.title@tourist": { es: "Pago MercadoPago", en: "MercadoPago payment" },
  "features.extra1.desc@tourist": {
    es: "Pagá la consulta online al reservar el turno",
    en: "Pay the consultation fee online when booking",
  },
  "features.extra2.title@tourist": { es: "Recordatorios auto", en: "Auto reminders" },
  "features.extra2.desc@tourist": {
    es: "Email + push 24h antes de tu turno",
    en: "Email + push 24h before your appointment",
  },
  "features.extra3.title@tourist": { es: "Cora 24/7", en: "Cora 24/7" },
  "features.extra3.desc@tourist": {
    es: "Tu enfermera virtual con IA, siempre disponible",
    en: "Your AI virtual nurse, always available",
  },
  "features.extra4.title@tourist": { es: "Modo offline PWA", en: "Offline PWA mode" },
  "features.extra4.desc@tourist": {
    es: "Usá la app sin conexión desde tu celular",
    en: "Use the app offline from your phone",
  },
  "features.extra5.title@tourist": {
    es: "Datos del médico enriquecidos",
    en: "Enriched doctor data",
  },
  "features.extra5.desc@tourist": {
    es: "WhatsApp, seguros, turnos online y telemedicina detectados",
    en: "WhatsApp, insurance, online bookings & telehealth detected",
  },
  "features.extra6.title@tourist": { es: "Bilingüe ES + EN", en: "Bilingual ES + EN" },
  "features.extra6.desc@tourist": {
    es: "Todo en español e inglés, ideal para turistas",
    en: "Everything in Spanish & English, perfect for tourists",
  },
  "features.extra7.title@tourist": { es: "Seguro de viaje", en: "Travel insurance" },
  "features.extra7.desc@tourist": {
    es: "Verificá cobertura de tu seguro de viaje al instante",
    en: "Verify your travel insurance coverage instantly",
  },

  "faq.label@tourist": { es: "Preguntas frecuentes", en: "Frequently asked questions" },

  "how.label@tourist": { es: "Cómo funciona", en: "How it works" },
  "how.title@tourist": { es: "Conseguí atención ", en: "Get care " },
  "how.titleEm@tourist": { es: "en 3 pasos", en: "in 3 steps" },
  "how.subtitle@tourist": {
    es: "No necesitás registro, no necesitás entender el sistema de salud argentino. Cóndor te guía.",
    en: "No signup needed, no need to understand Argentina's health system. Cóndor guides you.",
  },
  "how.step0.title@tourist": { es: "Contanos qué te pasa", en: "Tell us what's wrong" },
  "how.step0.desc@tourist": {
    es: "Hablale a Cora (nuestro chatbot) o buscá directamente un médico por especialidad. Funciona en español e inglés.",
    en: "Talk to Cora (our chatbot) or search for a doctor by specialty. Works in Spanish and English.",
  },
  "how.step1.title@tourist": { es: "Te conectamos con atención", en: "We connect you with care" },
  "how.step1.desc@tourist": {
    es: "Cora te orienta al médico indicado, verifica tu cobertura y te muestra opciones cerca tuyo con Google Maps y transporte (Uber, Cabify, InDrive).",
    en: "Cora guides you to the right doctor, verifies your coverage and shows options near you with Google Maps and rides (Uber, Cabify, InDrive).",
  },
  "how.step2.title@tourist": { es: "Reservá, pagá y listo", en: "Book, pay & done" },
  "how.step2.desc@tourist": {
    es: "Pagá con MercadoPago, recibí push de confirmación al instante y recordatorio 24h antes. Todo automático.",
    en: "Pay with MercadoPago, get instant push confirmation and a 24h reminder. Fully automated.",
  },

  "pricing.title@tourist": {
    es: "Gratis para pacientes. Siempre.",
    en: "Free for patients. Always.",
  },

  "cta.label@tourist": { es: "Empezá ahora", en: "Start now" },
  "cta.title1@tourist": {
    es: "No dejes tu salud para después.",
    en: "Don't put your health on hold.",
  },
  "cta.title2@tourist": {
    es: "Encontrá atención en minutos.",
    en: "Find care in minutes.",
  },
  "cta.subtitle@tourist": {
    es: "Hablá con Cora, buscá un médico cerca, pedí un Uber al consultorio o hacé una teleconsulta. Todo gratis, todo ahora.",
    en: "Talk to Cora, find a doctor nearby, grab an Uber to the clinic or do a teleconsult. All free, all now.",
  },
  "cta.hl0@tourist": { es: "Turnos con MercadoPago", en: "Bookings + MercadoPago" },
  "cta.hl1@tourist": { es: "Push de confirmación instant", en: "Instant push confirmation" },
  "cta.hl2@tourist": { es: "Recordatorio automático 24h", en: "Auto 24h reminders" },
  "cta.hl3@tourist": { es: "Cora IA + WhatsApp directo", en: "Cora AI + direct WhatsApp" },
  "cta.hl4@tourist": { es: "Uber/Cabify al consultorio", en: "Uber/Cabify to the clinic" },
  "cta.primary@tourist": { es: "Hablar con Cora", en: "Talk to Cora" },
  "cta.secondary@tourist": { es: "Buscar médico cerca", en: "Find doctor nearby" },
  "cta.bottom@tourist": {
    es: "Gratis · Sin registro · En español e inglés · 24/7",
    en: "Free · No signup · In Spanish & English · 24/7",
  },

  "wl.label@tourist": { es: "Acceso directo", en: "Direct access" },
  "wl.title@tourist": {
    es: "Dejanos tu email y te mandamos un link directo",
    en: "Leave your email and we'll send a direct link",
  },
  "wl.subtitle@tourist": {
    es: "Te mandamos acceso al portal de pacientes y al chatbot de Cora. Si necesitás algo urgente, usá el botón de arriba.",
    en: "We'll send you access to the patient portal and Cora's chatbot. If you need something urgent, use the button above.",
  },

  // ── Partners Page (Enhanced) ─────────────────────────────
  "partners.hero.badge": { es: "Alianza B2B para viajes", en: "B2B Travel Partnership" },
  "partners.hero.label": { es: "PROGRAMA DE PARTNERS", en: "PARTNER PROGRAM" },
  "partners.hero.title1": { es: "Sumá acceso médico", en: "Add healthcare access" },
  "partners.hero.title2": { es: "a cada viaje a Argentina.", en: "to every trip to Argentina." },
  "partners.hero.subtitle": {
    es: "Asociate con Cóndor Salud y ofrecé a tus clientes acceso instantáneo a 2.800+ médicos, teleconsulta 24/7 en inglés, farmacia a domicilio y más — por una tarifa única de USD 30 por viajero. Sin seguros, sin trámites, sin fricciones.",
    en: "Partner with Cóndor Salud and give your customers instant access to 2,800+ doctors, 24/7 English telemedicine, pharmacy delivery and more — for a one-time fee of USD 30 per traveler. No insurance, no paperwork, no friction.",
  },
  "partners.hero.cta": { es: "Convertite en partner", en: "Become a Partner" },
  "partners.hero.ctaSecondary": {
    es: "Ver experiencia del viajero",
    en: "See Traveler Experience",
  },
  "partners.hero.idealLabel": { es: "IDEAL PARA", en: "IDEAL FOR" },
  "partners.hero.ideal0": { es: "Agencias de viaje", en: "Travel agencies" },
  "partners.hero.ideal1": { es: "Aerolíneas", en: "Airlines" },
  "partners.hero.ideal2": { es: "OTAs & plataformas", en: "OTAs & platforms" },
  "partners.hero.ideal3": { es: "DMCs & receptivos", en: "DMCs & receptives" },
  "partners.hero.ideal4": { es: "Aseguradoras", en: "Insurers" },

  "partners.stats.s0.num": { es: "USD 30", en: "USD 30" },
  "partners.stats.s0.label": { es: "Por viajero, una sola vez", en: "Per traveler, one time" },
  "partners.stats.s0.sub": { es: "Sin copagos ni costos ocultos", en: "No copays or hidden costs" },
  "partners.stats.s1.num": { es: "<30s", en: "<30s" },
  "partners.stats.s1.label": { es: "Tiempo de activación", en: "Activation time" },
  "partners.stats.s1.sub": {
    es: "El viajero accede al instante",
    en: "Traveler gets instant access",
  },
  "partners.stats.s2.num": { es: "20%", en: "20%" },
  "partners.stats.s2.label": { es: "Revenue share", en: "Revenue share" },
  "partners.stats.s2.sub": {
    es: "USD 6 por cada viajero activado",
    en: "USD 6 per activated traveler",
  },
  "partners.stats.s3.num": { es: "2.800+", en: "2,800+" },
  "partners.stats.s3.label": { es: "Médicos en la red", en: "Doctors in network" },
  "partners.stats.s3.sub": {
    es: "45+ especialidades en 120+ ciudades",
    en: "45+ specialties in 120+ cities",
  },

  "partners.demo.kicker": { es: "EXPERIENCIA DEL VIAJERO", en: "TRAVELER EXPERIENCE" },
  "partners.demo.title": { es: "Mirá cómo funciona.", en: "See how it works." },
  "partners.demo.titleEm": { es: "En 4 pasos.", en: "In 4 steps." },
  "partners.demo.subtitle": {
    es: "Desde la reserva hasta la consulta médica — así vive tu viajero la experiencia de Cóndor Salud.",
    en: "From booking to medical consultation — this is how your traveler experiences Cóndor Salud.",
  },
  "partners.demo.step0.label": { es: "Reserva", en: "Booking" },
  "partners.demo.step0.desc": {
    es: "El viajero agrega Cóndor Salud durante el checkout de tu plataforma. Un click, USD 30, listo.",
    en: "The traveler adds Cóndor Salud during your platform checkout. One click, USD 30, done.",
  },
  "partners.demo.step1.label": { es: "Activación", en: "Activation" },
  "partners.demo.step1.desc": {
    es: "Recibe confirmación instantánea con su ID de miembro y acceso al portal de pacientes.",
    en: "Receives instant confirmation with their member ID and access to the patient portal.",
  },
  "partners.demo.step2.label": { es: "Búsqueda", en: "Search" },
  "partners.demo.step2.desc": {
    es: "Busca médicos cercanos por especialidad, disponibilidad e idioma — todo en inglés.",
    en: "Searches nearby doctors by specialty, availability and language — all in English.",
  },
  "partners.demo.step3.label": { es: "Turno", en: "Appointment" },
  "partners.demo.step3.desc": {
    es: "Reserva un turno gratis (cubierto), recibe recordatorio y va al médico. Así de simple.",
    en: "Books a free appointment (covered), gets a reminder, and sees the doctor. That simple.",
  },
  "partners.demo.prev": { es: "← Anterior", en: "← Previous" },
  "partners.demo.next": { es: "Siguiente →", en: "Next →" },
  "partners.demo.benefit0.title": { es: "100% en inglés", en: "100% in English" },
  "partners.demo.benefit0.desc": {
    es: "Toda la plataforma, el chatbot IA y los filtros de médico funcionan en inglés.",
    en: "The entire platform, AI chatbot and doctor filters work in English.",
  },
  "partners.demo.benefit1.title": { es: "GPS de salud", en: "Healthcare GPS" },
  "partners.demo.benefit1.desc": {
    es: "Mapa en tiempo real con farmacias, hospitales y clínicas cercanas al viajero.",
    en: "Real-time map with pharmacies, hospitals and clinics near the traveler.",
  },
  "partners.demo.benefit2.title": { es: "Teleconsulta 24/7", en: "Telemedicine 24/7" },
  "partners.demo.benefit2.desc": {
    es: "Videollamada con médicos a cualquier hora. Ideal para urgencias nocturnas.",
    en: "Video call with doctors at any hour. Perfect for late-night emergencies.",
  },
  "partners.demo.benefit3.title": { es: "Sin reclamos de seguro", en: "No insurance claims" },
  "partners.demo.benefit3.desc": {
    es: "A diferencia de los seguros de viaje, no hay formularios ni reembolsos. Todo está cubierto.",
    en: "Unlike travel insurance, there are no forms or reimbursements. Everything is covered.",
  },
  "partners.demo.benefit4.title": { es: "Soporte dedicado", en: "Dedicated support" },
  "partners.demo.benefit4.desc": {
    es: "Chatbot IA bilingüe (Cora) + WhatsApp de emergencia para ayuda inmediata.",
    en: "Bilingual AI chatbot (Cora) + emergency WhatsApp for immediate help.",
  },

  "partners.features.kicker": { es: "PLATAFORMA COMPLETA", en: "FULL PLATFORM" },
  "partners.features.title": { es: "Todo lo que necesitan.", en: "Everything they need." },
  "partners.features.titleEm": { es: "En una sola app.", en: "In one app." },
  "partners.features.subtitle": {
    es: "Tus viajeros acceden a un ecosistema de salud completo — no un simple directorio.",
    en: "Your travelers access a complete health ecosystem — not just a directory.",
  },
  "partners.features.f0.title": { es: "Red de 2.800+ médicos", en: "2,800+ doctor network" },
  "partners.features.f0.desc": {
    es: "Médicos verificados en 120+ ciudades argentinas. Búsqueda por especialidad, idioma y ubicación.",
    en: "Verified doctors in 120+ Argentine cities. Search by specialty, language and location.",
  },
  "partners.features.f0.tag": { es: "Red verificada", en: "Verified network" },
  "partners.features.f1.title": { es: "Teleconsulta 24/7", en: "24/7 Telemedicine" },
  "partners.features.f1.desc": {
    es: "Videollamada con médicos disponibles las 24 horas. Perfecto para urgencias fuera de horario.",
    en: "Video call with doctors available 24 hours. Perfect for after-hours emergencies.",
  },
  "partners.features.f1.tag": { es: "Incluido", en: "Included" },
  "partners.features.f2.title": { es: "Chatbot IA bilingüe", en: "Bilingual AI chatbot" },
  "partners.features.f2.desc": {
    es: "Cora responde preguntas de salud, ayuda con triaje y guía al viajero en español e inglés.",
    en: "Cora answers health questions, helps with triage and guides the traveler in Spanish and English.",
  },
  "partners.features.f2.tag": { es: "IA avanzada", en: "Advanced AI" },
  "partners.features.f3.title": { es: "Farmacia a domicilio", en: "Pharmacy delivery" },
  "partners.features.f3.desc": {
    es: "Medicamentos pedidos por Rappi o PedidosYa directo al hotel o Airbnb. Compará precios, farmacias y ahorrá con genéricos.",
    en: "Medications ordered via Rappi or PedidosYa straight to the hotel or Airbnb. Compare prices, pharmacies and save with generics.",
  },
  "partners.features.f3.tag": { es: "Rappi · PedidosYa", en: "Rappi · PedidosYa" },
  "partners.features.f4.title": { es: "Mapa GPS de salud", en: "Healthcare GPS map" },
  "partners.features.f4.desc": {
    es: "Farmacias, hospitales y guardias más cercanos en tiempo real con Google Maps. Tocá un pin y veé horarios, teléfono y cómo llegar.",
    en: "Nearest pharmacies, hospitals and ERs in real time with Google Maps. Tap a pin to see hours, phone and directions.",
  },
  "partners.features.f4.tag": { es: "Google Maps en vivo", en: "Live Google Maps" },
  "partners.features.f5.title": { es: "Evaluador de síntomas IA", en: "AI symptom checker" },
  "partners.features.f5.desc": {
    es: "Triaje inteligente que evalúa síntomas y recomienda el siguiente paso antes de la consulta.",
    en: "Smart triage that evaluates symptoms and recommends next steps before the consultation.",
  },
  "partners.features.f5.tag": { es: "Triaje IA", en: "AI triage" },
  "partners.features.f6.title": { es: "Uber, Cabify & InDrive", en: "Uber, Cabify & InDrive" },
  "partners.features.f6.desc": {
    es: "Pedí un viaje al consultorio, guardia o farmacia con un toque. Cora muestra la dirección y abre Uber, Cabify o InDrive directo.",
    en: "Get a ride to the clinic, ER or pharmacy in one tap. Cora shows the address and opens Uber, Cabify or InDrive directly.",
  },
  "partners.features.f6.tag": { es: "Viaje en 1 toque", en: "Ride in 1 tap" },
  "partners.features.f7.title": { es: "Pago con MercadoPago", en: "MercadoPago payment" },
  "partners.features.f7.desc": {
    es: "Reservá turno y pagá online al instante. Acepta Visa, Mastercard, Amex y MercadoPago. Sin efectivo.",
    en: "Book and pay online instantly. Accepts Visa, Mastercard, Amex and MercadoPago. No cash needed.",
  },
  "partners.features.f7.tag": { es: "Pago online", en: "Online payment" },
  "partners.features.f8.title": {
    es: "WhatsApp directo al médico",
    en: "Direct WhatsApp to doctor",
  },
  "partners.features.f8.desc": {
    es: "Contactá al médico por WhatsApp con un solo toque. Mensaje pre-armado con nombre, especialidad y disponibilidad.",
    en: "Contact the doctor via WhatsApp in one tap. Pre-filled message with name, specialty and availability.",
  },
  "partners.features.f8.tag": { es: "1 toque = WhatsApp", en: "1 tap = WhatsApp" },
  "partners.features.f9.title": { es: "Push + recordatorios", en: "Push + reminders" },
  "partners.features.f9.desc": {
    es: "Confirmación push instantánea al reservar y recordatorio automático 24h antes por email y notificación.",
    en: "Instant push confirmation on booking and automatic 24h reminder via email and notification.",
  },
  "partners.features.f9.tag": { es: "Automático", en: "Automated" },
  "partners.features.f10.title": { es: "Verificación de cobertura", en: "Coverage verification" },
  "partners.features.f10.desc": {
    es: "El viajero ingresa su seguro de viaje y sabe al instante qué cubre, copago y si necesita autorización.",
    en: "Traveler enters their travel insurance and instantly knows what's covered, copay and if prior auth is needed.",
  },
  "partners.features.f10.tag": { es: "Respuesta en segundos", en: "Answers in seconds" },
  "partners.features.f11.title": { es: "Modo offline PWA", en: "Offline PWA mode" },
  "partners.features.f11.desc": {
    es: "Funciona sin conexión desde el celular. Ideal para turistas sin datos móviles o en zonas con señal limitada.",
    en: "Works offline from the phone. Ideal for tourists without mobile data or in areas with limited signal.",
  },
  "partners.features.f11.tag": { es: "Sin conexión", en: "Works offline" },
  "partners.cora.kicker": { es: "CONOCÉ A CORA", en: "MEET CORA" },
  "partners.cora.title": { es: "Así hablan tus viajeros", en: "This is how your travelers talk" },
  "partners.cora.titleEm": { es: "con Cora.", en: "to Cora." },
  "partners.cora.subtitle": {
    es: "Cora es la enfermera virtual con IA de Cóndor Salud. Habla español e inglés, hace triaje, busca médicos, pide remedios y hasta coordina un Uber al consultorio. Así se ven las conversaciones reales.",
    en: "Cora is Cóndor Salud's AI virtual nurse. She speaks Spanish and English, does triage, finds doctors, orders medication and even coordinates an Uber to the clinic. Here's what real conversations look like.",
  },
  "partners.cora.tab0": { es: "🤒 Síntomas", en: "🤒 Symptoms" },
  "partners.cora.tab1": { es: "💊 Farmacia", en: "💊 Pharmacy" },
  "partners.cora.tab2": { es: "🚗 Transporte", en: "🚗 Transport" },
  "partners.cora.badge": {
    es: "IA + 20 intenciones · ES/EN · 24/7",
    en: "AI + 20 intents · ES/EN · 24/7",
  },

  "partners.integrations.kicker": { es: "INTEGRACIONES", en: "INTEGRATIONS" },
  "partners.integrations.title": { es: "Conectado con todo.", en: "Connected to everything." },
  "partners.integrations.titleEm": { es: "18+ integraciones.", en: "18+ integrations." },
  "partners.integrations.subtitle": {
    es: "Cóndor Salud no es un directorio estático. Es una plataforma viva que se conecta con los servicios que tus viajeros ya usan.",
    en: "Cóndor Salud isn't a static directory. It's a living platform connected to the services your travelers already use.",
  },

  "partners.why.kicker": { es: "POR QUÉ ASOCIARSE", en: "WHY PARTNER" },
  "partners.why.title": { es: "Más ingresos.", en: "More revenue." },
  "partners.why.titleEm": { es: "Mejor experiencia.", en: "Better experience." },
  "partners.why.w0.title": { es: "Revenue share del 20%", en: "20% revenue share" },
  "partners.why.w0.desc": {
    es: "Ganá USD 6 por cada viajero que activa Cóndor Salud. Dashboard con métricas en tiempo real.",
    en: "Earn USD 6 per traveler who activates Cóndor Salud. Dashboard with real-time metrics.",
  },
  "partners.why.w1.title": { es: "Diferenciación competitiva", en: "Competitive differentiation" },
  "partners.why.w1.desc": {
    es: "Ofrecé algo que tu competencia no tiene: acceso médico completo incluido en la reserva.",
    en: "Offer something your competitors don't: full medical access included in the booking.",
  },
  "partners.why.w2.title": { es: "Integración en días", en: "Integration in days" },
  "partners.why.w2.desc": {
    es: "API REST, widget embebible o link de referido. Elegí el método que se adapte a tu plataforma.",
    en: "REST API, embeddable widget or referral link. Choose the method that fits your platform.",
  },
  "partners.why.w3.title": { es: "Cero riesgo operativo", en: "Zero operational risk" },
  "partners.why.w3.desc": {
    es: "Nosotros manejamos la red médica, el soporte y la tecnología. Vos solo integrás una vez.",
    en: "We handle the medical network, support and technology. You integrate once.",
  },
  "partners.why.w4.title": { es: "Satisfacción del viajero", en: "Traveler satisfaction" },
  "partners.why.w4.desc": {
    es: "Los viajeros valoran tener salud resuelta. Mejores reviews, más rebooking.",
    en: "Travelers value having healthcare sorted. Better reviews, more rebooking.",
  },
  "partners.why.w5.title": { es: "Soporte dedicado", en: "Dedicated support" },
  "partners.why.w5.desc": {
    es: "Account manager dedicado, onboarding asistido y línea directa para partners.",
    en: "Dedicated account manager, assisted onboarding and direct partner line.",
  },

  "partners.calc.label": { es: "CALCULADORA", en: "CALCULATOR" },
  "partners.calc.title": {
    es: "Estimá tus ingresos mensuales",
    en: "Estimate your monthly earnings",
  },
  "partners.calc.perMonth": { es: "Viajeros por mes", en: "Travelers per month" },
  "partners.calc.resultLabel": { es: "Tu ingreso estimado", en: "Your estimated earnings" },
  "partners.calc.resultSub": {
    es: "viajeros × USD 6 revenue share",
    en: "travelers × USD 6 revenue share",
  },
  "partners.calc.disclaimer": {
    es: "* Basado en 20% revenue share sobre USD 30 por viajero. Ingreso real puede variar.",
    en: "* Based on 20% revenue share on USD 30 per traveler. Actual earnings may vary.",
  },

  "partners.how.kicker": { es: "CÓMO EMPEZAR", en: "HOW TO START" },
  "partners.how.step0.title": { es: "Aplicá como partner", en: "Apply as partner" },
  "partners.how.step0.desc": {
    es: "Completá el formulario y te contactamos en 24hs.",
    en: "Fill out the form and we contact you within 24h.",
  },
  "partners.how.step1.title": { es: "Elegí tu integración", en: "Choose your integration" },
  "partners.how.step1.desc": {
    es: "API REST, widget o link de referido.",
    en: "REST API, widget or referral link.",
  },
  "partners.how.step2.title": { es: "Probá en sandbox", en: "Test in sandbox" },
  "partners.how.step2.desc": {
    es: "Ambiente de pruebas con datos ficticios.",
    en: "Test environment with mock data.",
  },
  "partners.how.step3.title": { es: "Lanzá en producción", en: "Launch in production" },
  "partners.how.step3.desc": {
    es: "Activá viajeros y empezá a generar ingresos.",
    en: "Activate travelers and start earning.",
  },
  "partners.how.badge": {
    es: "⚡ Tiempo promedio de integración: 3–5 días hábiles",
    en: "⚡ Average integration time: 3–5 business days",
  },

  "partners.form.kicker": { es: "EMPEZÁ AHORA", en: "GET STARTED" },
  "partners.form.title": { es: "Aplicá como", en: "Apply as a" },
  "partners.form.titleEm": { es: "partner.", en: "partner." },
  "partners.form.subtitle": {
    es: "Completá el formulario y nuestro equipo te contacta en menos de 24 horas.",
    en: "Fill out the form and our team will contact you within 24 hours.",
  },
  "partners.form.benefit0": { es: "Respuesta en 24hs", en: "24h response" },
  "partners.form.benefit1": { es: "Sin compromiso", en: "No commitment" },
  "partners.form.benefit2": { es: "Onboarding asistido", en: "Assisted onboarding" },
  "partners.form.company": { es: "Nombre de la empresa", en: "Company name" },
  "partners.form.name": { es: "Tu nombre completo", en: "Your full name" },
  "partners.form.email": { es: "Email corporativo", en: "Corporate email" },
  "partners.form.type": { es: "Tipo de empresa", en: "Company type" },
  "partners.form.type0": { es: "Agencia de viajes", en: "Travel agency" },
  "partners.form.type1": { es: "Aerolínea", en: "Airline" },
  "partners.form.type2": { es: "OTA / Plataforma online", en: "OTA / Online platform" },
  "partners.form.type3": { es: "DMC / Receptivo", en: "DMC / Receptive" },
  "partners.form.type4": { es: "Otro", en: "Other" },
  "partners.form.volume": { es: "Viajeros mensuales", en: "Monthly travelers" },
  "partners.form.vol0": { es: "Menos de 50", en: "Less than 50" },
  "partners.form.vol1": { es: "50 – 200", en: "50 – 200" },
  "partners.form.vol2": { es: "200 – 500", en: "200 – 500" },
  "partners.form.vol3": { es: "500 – 2.000", en: "500 – 2,000" },
  "partners.form.vol4": { es: "Más de 2.000", en: "More than 2,000" },
  "partners.form.message": { es: "Mensaje (opcional)", en: "Message (optional)" },
  "partners.form.submit": { es: "Enviar solicitud", en: "Submit application" },
  "partners.form.legal": {
    es: "Al enviar, aceptás nuestra",
    en: "By submitting, you agree to our",
  },
  "partners.form.legalLink": { es: "Política de Privacidad", en: "Privacy Policy" },
  "partners.form.successTitle": { es: "¡Solicitud enviada!", en: "Application sent!" },
  "partners.form.successSub": {
    es: "Nuestro equipo de partnerships te va a contactar en menos de 24 horas hábiles.",
    en: "Our partnerships team will contact you within 24 business hours.",
  },

  "partners.faq.kicker": { es: "PREGUNTAS FRECUENTES", en: "FAQ" },
  "partners.faq.title": { es: "Preguntas frecuentes de partners", en: "Partner FAQ" },
  "partners.faq.q0": {
    es: "¿Qué incluye el acceso de USD 30 por viajero?",
    en: "What does the USD 30 per traveler access include?",
  },
  "partners.faq.a0": {
    es: "Todo: directorio de 2.800+ médicos, teleconsulta 24/7, farmacia a domicilio, chatbot IA bilingüe (Cora), mapa GPS de salud, evaluador de síntomas y transporte al consultorio. Sin límites, sin copagos.",
    en: "Everything: 2,800+ doctor directory, 24/7 telemedicine, pharmacy delivery, bilingual AI chatbot (Cora), healthcare GPS map, symptom checker and ride to appointment. No limits, no copays.",
  },
  "partners.faq.q1": { es: "¿Cómo es el revenue share?", en: "How does the revenue share work?" },
  "partners.faq.a1": {
    es: "Recibís el 20% de cada activación (USD 6 por viajero). Los pagos se liquidan mensualmente vía transferencia bancaria o PayPal. Dashboard en tiempo real para ver tus métricas.",
    en: "You receive 20% of each activation (USD 6 per traveler). Payments are settled monthly via bank transfer or PayPal. Real-time dashboard for your metrics.",
  },
  "partners.faq.q2": {
    es: "¿Cuánto tiempo lleva la integración?",
    en: "How long does integration take?",
  },
  "partners.faq.a2": {
    es: "Depende del método: un link de referido se activa en minutos, un widget en 1–2 días, y la API REST completa en 3–5 días hábiles. Damos soporte técnico durante todo el proceso.",
    en: "Depends on the method: a referral link activates in minutes, a widget in 1–2 days, and the full REST API in 3–5 business days. We provide technical support throughout.",
  },
  "partners.faq.q3": {
    es: "¿Funciona para viajeros de cualquier país?",
    en: "Does it work for travelers from any country?",
  },
  "partners.faq.a3": {
    es: "Sí. La plataforma está en español e inglés, acepta tarjetas internacionales y MercadoPago. Cualquier turista que viaje a Argentina puede usarla.",
    en: "Yes. The platform is in Spanish and English, accepts international cards and MercadoPago. Any tourist traveling to Argentina can use it.",
  },
  "partners.faq.q4": { es: "¿Es un seguro de viaje?", en: "Is this travel insurance?" },
  "partners.faq.a4": {
    es: "No. Es acceso directo a una red médica — sin pólizas, sin reclamos, sin reembolsos. El viajero reserva un turno como cualquier paciente local y todo está cubierto por los USD 30.",
    en: "No. It's direct access to a medical network — no policies, no claims, no reimbursements. The traveler books an appointment like any local patient and everything is covered by the USD 30.",
  },
  "partners.faq.q5": {
    es: "¿Qué pasa si el viajero tiene una emergencia?",
    en: "What if the traveler has an emergency?",
  },
  "partners.faq.a5": {
    es: "Puede usar teleconsulta 24/7 para atención inmediata, el chatbot IA para triaje, o el mapa GPS para encontrar la guardia más cercana. También tiene WhatsApp de emergencia con nuestro equipo.",
    en: "They can use 24/7 telemedicine for immediate care, the AI chatbot for triage, or the GPS map to find the nearest ER. They also have emergency WhatsApp with our team.",
  },

  "partners.cta.kicker": { es: "EMPEZÁ HOY", en: "START TODAY" },
  "partners.cta.title": { es: "¿Listo para proteger", en: "Ready to protect" },
  "partners.cta.titleEm": { es: "a tus viajeros?", en: "your travelers?" },
  "partners.cta.subtitle": {
    es: "Sumá Cóndor Salud a tu oferta de viajes y dales a tus clientes la tranquilidad de tener salud cubierta en Argentina.",
    en: "Add Cóndor Salud to your travel offering and give your customers peace of mind with healthcare coverage in Argentina.",
  },
  "partners.cta.primary": { es: "Aplicar como partner", en: "Apply as Partner" },
  "partners.cta.secondary": { es: "Agendar una demo", en: "Schedule a Demo" },
  "partners.cta.note": {
    es: "Sin compromiso · Respuesta en 24hs · Soporte dedicado",
    en: "No commitment · 24h response · Dedicated support",
  },

  // ── American Travelers (Embassy) Page ──────────────────────
  "embassy.banner.text": {
    es: "Preparado para la Embajada de los Estados Unidos en Argentina · División de Servicios al Ciudadano",
    en: "Prepared for the United States Embassy in Argentina · Citizen Services Division",
  },
  "embassy.hero.label": { es: "PARA VIAJEROS ESTADOUNIDENSES", en: "FOR AMERICAN TRAVELERS" },
  "embassy.hero.title1": { es: "Salud para ciudadanos", en: "Healthcare for American" },
  "embassy.hero.title2": { es: "estadounidenses en Argentina.", en: "citizens in Argentina." },
  "embassy.hero.subtitle": {
    es: "Cóndor Salud ofrece a los ciudadanos estadounidenses que visitan Argentina acceso inmediato a una red de más de 2.800 médicos, telemedicina 24/7 en inglés, farmacia a domicilio y coordinación de emergencias — todo por una tarifa única de USD 30.",
    en: "Cóndor Salud provides American citizens visiting Argentina with immediate access to a network of over 2,800 doctors, 24/7 telemedicine in English, pharmacy delivery and emergency coordination — all for a one-time fee of USD 30.",
  },
  "embassy.hero.metric0": { es: "2.800+ médicos", en: "2,800+ doctors" },
  "embassy.hero.metric1": { es: "USD 30 tarifa única", en: "USD 30 one-time fee" },
  "embassy.hero.metric2": { es: "Inglés nativo", en: "Native English" },
  "embassy.hero.cta": { es: "Contactar para aval", en: "Contact for Endorsement" },
  "embassy.hero.ctaSecondary": { es: "Ver la plataforma", en: "See the Platform" },

  "embassy.problem.kicker": { es: "EL DESAFÍO", en: "THE CHALLENGE" },
  "embassy.problem.title": { es: "Los viajeros estadounidenses", en: "American travelers" },
  "embassy.problem.titleEm": { es: "enfrentan barreras reales.", en: "face real barriers." },
  "embassy.problem.subtitle": {
    es: "Más de 300.000 ciudadanos estadounidenses visitan Argentina cada año. Cuando necesitan atención médica, se enfrentan a un sistema desconocido, en otro idioma, sin saber a quién recurrir.",
    en: "Over 300,000 American citizens visit Argentina each year. When they need medical care, they face an unfamiliar system, in another language, with no idea where to turn.",
  },
  "embassy.problem.p0.title": { es: "Barrera idiomática", en: "Language barrier" },
  "embassy.problem.p0.desc": {
    es: "La mayoría de los profesionales médicos en Argentina hablan poco o nada de inglés. En una emergencia, la comunicación es crítica.",
    en: "Most medical professionals in Argentina speak little to no English. In an emergency, communication is critical.",
  },
  "embassy.problem.p1.title": { es: "Burocracia de seguros", en: "Insurance bureaucracy" },
  "embassy.problem.p1.desc": {
    es: "Los seguros de viaje requieren formularios, reclamos y reembolsos que pueden tardar semanas. El viajero paga de su bolsillo y espera.",
    en: "Travel insurance requires forms, claims and reimbursements that can take weeks. The traveler pays out of pocket and waits.",
  },
  "embassy.problem.p2.title": { es: "Sistema fragmentado", en: "Fragmented system" },
  "embassy.problem.p2.desc": {
    es: "No existe un punto único de acceso al sistema de salud argentino para turistas. Cada hospital, clínica y farmacia opera independientemente.",
    en: "There is no single point of access to Argentina's healthcare system for tourists. Every hospital, clinic and pharmacy operates independently.",
  },
  "embassy.problem.p3.title": { es: "Costos impredecibles", en: "Unpredictable costs" },
  "embassy.problem.p3.desc": {
    es: "Sin cobertura local, una consulta puede costar entre USD 50 y USD 300+. Medicamentos, estudios y traslados se suman rápidamente.",
    en: "Without local coverage, a consultation can cost between USD 50 and USD 300+. Medications, tests and transport add up quickly.",
  },
  "embassy.problem.stat.num": { es: "300.000+", en: "300,000+" },
  "embassy.problem.stat.desc": {
    es: "ciudadanos estadounidenses visitan Argentina anualmente (U.S. Department of State)",
    en: "American citizens visit Argentina annually (U.S. Department of State)",
  },

  "embassy.solution.kicker": { es: "LA SOLUCIÓN", en: "THE SOLUTION" },
  "embassy.solution.title": { es: "Un único punto de acceso.", en: "One point of access." },
  "embassy.solution.titleEm": { es: "Todo en inglés.", en: "All in English." },
  "embassy.solution.subtitle": {
    es: "Cóndor Salud es una plataforma digital que conecta a turistas con la red de salud argentina — con interfaz en inglés, precios en dólares y cero burocracia.",
    en: "Cóndor Salud is a digital platform that connects tourists to Argentina's healthcare network — with an English interface, USD pricing and zero bureaucracy.",
  },
  "embassy.solution.f0.title": { es: "Red de 2.800+ médicos", en: "2,800+ doctor network" },
  "embassy.solution.f0.desc": {
    es: "Profesionales verificados en 45+ especialidades y 120+ ciudades. Filtro por idioma inglés.",
    en: "Verified professionals in 45+ specialties and 120+ cities. English language filter.",
  },
  "embassy.solution.f1.title": { es: "Telemedicina 24/7", en: "24/7 Telemedicine" },
  "embassy.solution.f1.desc": {
    es: "Videollamada con médicos disponibles las 24 horas, los 7 días. Ideal para emergencias nocturnas.",
    en: "Video call with doctors available 24/7. Ideal for late-night emergencies.",
  },
  "embassy.solution.f2.title": { es: "Farmacia a domicilio", en: "Pharmacy delivery" },
  "embassy.solution.f2.desc": {
    es: "Medicamentos pedidos por Rappi o PedidosYa directo al hotel o Airbnb. Compará precios, farmacias y ahorrá con genéricos.",
    en: "Medications ordered via Rappi or PedidosYa straight to the hotel or Airbnb. Compare prices, pharmacies and save with generics.",
  },
  "embassy.solution.f3.title": { es: "Mapa GPS de salud", en: "Healthcare GPS map" },
  "embassy.solution.f3.desc": {
    es: "Geolocalización en tiempo real de farmacias, hospitales y guardias con Google Maps. Dirección, teléfono y cómo llegar.",
    en: "Real-time geolocation of nearest pharmacies, hospitals and ERs with Google Maps. Address, phone and directions.",
  },
  "embassy.solution.f4.title": { es: "Chatbot IA bilingüe", en: "Bilingual AI chatbot" },
  "embassy.solution.f4.desc": {
    es: "Cora responde consultas en inglés y español, guía triaje, busca atención cerca y pide un Uber o Cabify para llegar.",
    en: "Cora answers queries in English and Spanish, guides triage, finds nearby care and gets an Uber or Cabify to get there.",
  },
  "embassy.solution.f5.title": { es: "Pago en USD", en: "Payment in USD" },
  "embassy.solution.f5.desc": {
    es: "Acepta Visa, Mastercard, American Express y MercadoPago. Sin conversiones sorpresa.",
    en: "Accepts Visa, Mastercard, American Express and MercadoPago. No surprise conversions.",
  },
  "embassy.solution.f6.title": { es: "Uber, Cabify & InDrive", en: "Uber, Cabify & InDrive" },
  "embassy.solution.f6.desc": {
    es: "Viaje al consultorio, guardia o farmacia con un toque. Cora muestra la dirección y abre Uber, Cabify o InDrive directo.",
    en: "Ride to the clinic, ER or pharmacy in one tap. Cora shows the address and opens Uber, Cabify or InDrive directly.",
  },
  "embassy.solution.f7.title": {
    es: "WhatsApp directo al médico",
    en: "Direct WhatsApp to doctor",
  },
  "embassy.solution.f7.desc": {
    es: "Contactá al médico por WhatsApp con un solo toque. Mensaje pre-armado con nombre y especialidad.",
    en: "Contact the doctor via WhatsApp in one tap. Pre-filled message with name and specialty.",
  },
  "embassy.solution.f8.title": { es: "Push + recordatorios", en: "Push + reminders" },
  "embassy.solution.f8.desc": {
    es: "Confirmación push instantánea al reservar y recordatorio automático 24h antes por email y notificación.",
    en: "Instant push confirmation on booking and automatic 24h reminder via email and notification.",
  },
  "embassy.solution.f9.title": { es: "Verificación de cobertura", en: "Coverage verification" },
  "embassy.solution.f9.desc": {
    es: "El ciudadano ingresa su seguro de viaje y sabe al instante qué cubre, copago y si necesita autorización.",
    en: "The citizen enters their travel insurance and instantly knows what's covered, copay and if prior auth is needed.",
  },
  "embassy.solution.f10.title": { es: "Evaluador de síntomas IA", en: "AI symptom checker" },
  "embassy.solution.f10.desc": {
    es: "Triaje inteligente que evalúa síntomas y recomienda el siguiente paso antes de la consulta.",
    en: "Smart triage that evaluates symptoms and recommends next steps before the consultation.",
  },
  "embassy.solution.f11.title": { es: "Modo offline PWA", en: "Offline PWA mode" },
  "embassy.solution.f11.desc": {
    es: "Funciona sin conexión desde el celular. Ideal para ciudadanos sin datos móviles o en zonas con señal limitada.",
    en: "Works offline from the phone. Ideal for citizens without mobile data or in areas with limited signal.",
  },
  "embassy.cora.kicker": { es: "CONOCÉ A CORA", en: "MEET CORA" },
  "embassy.cora.title": { es: "Así funciona para", en: "This is how it works for" },
  "embassy.cora.titleEm": { es: "los ciudadanos.", en: "citizens." },
  "embassy.cora.subtitle": {
    es: "Cora es la enfermera virtual con IA de Cóndor Salud. Habla inglés y español, hace triaje, busca médicos, pide remedios y coordina transporte. Conversaciones reales de ciudadanos estadounidenses.",
    en: "Cora is Cóndor Salud's AI virtual nurse. She speaks English and Spanish, does triage, finds doctors, orders medication and coordinates transport. Real conversations from American citizens.",
  },
  "embassy.cora.tab0": { es: "🤒 Emergencia", en: "🤒 Emergency" },
  "embassy.cora.tab1": { es: "💊 Medicamentos", en: "💊 Medication" },
  "embassy.cora.tab2": { es: "🚗 Transporte", en: "🚗 Transport" },
  "embassy.cora.badge": {
    es: "IA + Inglés nativo · Triaje clínico · 24/7",
    en: "AI + Native English · Clinical triage · 24/7",
  },

  "embassy.integrations.kicker": { es: "INTEGRACIONES", en: "INTEGRATIONS" },
  "embassy.integrations.title": { es: "Conectado con todo.", en: "Connected to everything." },
  "embassy.integrations.titleEm": { es: "18+ integraciones.", en: "18+ integrations." },
  "embassy.integrations.subtitle": {
    es: "No es un directorio estático. Es una plataforma viva conectada con los servicios que los ciudadanos ya usan.",
    en: "Not a static directory. A living platform connected to the services citizens already use.",
  },
  "embassy.solution.priceLabel": { es: "TARIFA ÚNICA", en: "ONE-TIME FEE" },
  "embassy.solution.priceDesc": {
    es: "Acceso completo a toda la red por 30 días. Sin copagos.",
    en: "Full access to the entire network for 30 days. No copays.",
  },

  "embassy.protocol.kicker": { es: "PROTOCOLO DE EMERGENCIA", en: "EMERGENCY PROTOCOL" },
  "embassy.protocol.title": {
    es: "Qué pasa cuando un ciudadano",
    en: "What happens when a citizen",
  },
  "embassy.protocol.titleEm": { es: "necesita atención médica.", en: "needs medical care." },
  "embassy.protocol.subtitle": {
    es: "Este es el recorrido paso a paso que sigue un viajero estadounidense desde el primer síntoma hasta la resolución completa.",
    en: "This is the step-by-step journey an American traveler follows from the first symptom to full resolution.",
  },
  "embassy.protocol.s0.time": { es: "Inmediato", en: "Immediate" },
  "embassy.protocol.s0.title": { es: "Contacto inicial", en: "Initial contact" },
  "embassy.protocol.s0.desc": {
    es: "El viajero abre la app o contacta a Cora (chatbot IA) por WhatsApp en inglés. Describe sus síntomas y recibe una evaluación de triaje inmediata.",
    en: "The traveler opens the app or contacts Cora (AI chatbot) via WhatsApp in English. Describes symptoms and receives an immediate triage assessment.",
  },
  "embassy.protocol.s1.time": { es: "< 5 minutos", en: "< 5 minutes" },
  "embassy.protocol.s1.title": { es: "Evaluación y derivación", en: "Assessment and referral" },
  "embassy.protocol.s1.desc": {
    es: "Según la gravedad, Cora conecta al viajero con teleconsulta inmediata o agenda un turno presencial con un médico cercano que habla inglés.",
    en: "Based on severity, Cora connects the traveler with immediate telemedicine or books an in-person appointment with a nearby English-speaking doctor.",
  },
  "embassy.protocol.s2.time": { es: "< 30 minutos", en: "< 30 minutes" },
  "embassy.protocol.s2.title": { es: "Atención médica", en: "Medical care" },
  "embassy.protocol.s2.desc": {
    es: "El viajero recibe atención médica — por video o presencial. La consulta está 100% cubierta, sin costos adicionales.",
    en: "The traveler receives medical care — via video or in person. The consultation is 100% covered, with no additional costs.",
  },
  "embassy.protocol.s3.time": { es: "< 2 horas", en: "< 2 hours" },
  "embassy.protocol.s3.title": { es: "Medicamentos y seguimiento", en: "Medication and follow-up" },
  "embassy.protocol.s3.desc": {
    es: "Si se recetan medicamentos, se entregan en el hotel vía farmacia a domicilio. El viajero recibe un resumen médico digital en inglés.",
    en: "If medications are prescribed, they are delivered to the hotel via pharmacy delivery. The traveler receives a digital medical summary in English.",
  },
  "embassy.protocol.s4.time": { es: "Continuo", en: "Ongoing" },
  "embassy.protocol.s4.title": { es: "Soporte continuo", en: "Continuous support" },
  "embassy.protocol.s4.desc": {
    es: "Cora hace seguimiento post-consulta, coordina estudios adicionales si son necesarios, y está disponible 24/7 durante toda la estadía.",
    en: "Cora provides post-consultation follow-up, coordinates additional tests if needed, and is available 24/7 throughout the stay.",
  },
  "embassy.protocol.result": {
    es: "✓ Resultado: atención médica completa en menos de 2 horas",
    en: "✓ Result: complete medical care in under 2 hours",
  },
  "embassy.protocol.resultDesc": {
    es: "Sin papeles, sin reclamos de seguros, sin barrera idiomática.",
    en: "No paperwork, no insurance claims, no language barrier.",
  },

  "embassy.network.kicker": { es: "RED DE SALUD", en: "HEALTHCARE NETWORK" },
  "embassy.network.title": { es: "La red médica más grande", en: "Argentina's largest medical" },
  "embassy.network.titleEm": { es: "de Argentina para turistas.", en: "network for tourists." },
  "embassy.network.n0.num": { es: "2.800+", en: "2,800+" },
  "embassy.network.n0.label": { es: "Médicos verificados", en: "Verified doctors" },
  "embassy.network.n1.num": { es: "45+", en: "45+" },
  "embassy.network.n1.label": { es: "Especialidades", en: "Specialties" },
  "embassy.network.n2.num": { es: "120+", en: "120+" },
  "embassy.network.n2.label": { es: "Ciudades cubiertas", en: "Cities covered" },
  "embassy.network.n3.num": { es: "24/7", en: "24/7" },
  "embassy.network.n3.label": { es: "Telemedicina disponible", en: "Telemedicine available" },
  "embassy.network.badge0": { es: "Credenciales verificadas", en: "Verified credentials" },
  "embassy.network.badge1": { es: "CUIT registrado", en: "CUIT registered" },
  "embassy.network.badge2": { es: "Datos encriptados (AES-256)", en: "Encrypted data (AES-256)" },
  "embassy.network.badge3": { es: "Cumplimiento HIPAA-ready", en: "HIPAA-ready compliance" },

  "embassy.endorsement.kicker": { es: "SOLICITUD DE AVAL", en: "ENDORSEMENT REQUEST" },
  "embassy.endorsement.title": { es: "Cómo la Embajada puede", en: "How the Embassy can" },
  "embassy.endorsement.titleEm": { es: "ayudar a sus ciudadanos.", en: "help its citizens." },
  "embassy.endorsement.subtitle": {
    es: "Proponemos tres formas concretas en las que la Embajada de los Estados Unidos puede facilitar el acceso de sus ciudadanos a atención médica de calidad en Argentina.",
    en: "We propose three concrete ways the United States Embassy can facilitate access to quality medical care for its citizens in Argentina.",
  },
  "embassy.endorsement.ask0.title": {
    es: "Lista de recursos recomendados",
    en: "Recommended resource list",
  },
  "embassy.endorsement.ask0.desc": {
    es: "Incluir a Cóndor Salud en la lista de recursos médicos recomendados para ciudadanos estadounidenses que viajan a Argentina, junto con hospitales y clínicas de referencia.",
    en: "Include Cóndor Salud in the recommended medical resource list for American citizens traveling to Argentina, alongside reference hospitals and clinics.",
  },
  "embassy.endorsement.ask1.title": { es: "Materiales pre-viaje", en: "Pre-travel materials" },
  "embassy.endorsement.ask1.desc": {
    es: "Mencionar la plataforma en los materiales de preparación de viaje que la sección consular distribuye a ciudadanos que planean visitar Argentina.",
    en: "Mention the platform in travel preparation materials that the consular section distributes to citizens planning to visit Argentina.",
  },
  "embassy.endorsement.ask2.title": {
    es: "Partnership con Citizen Services",
    en: "Citizen Services partnership",
  },
  "embassy.endorsement.ask2.desc": {
    es: "Explorar una alianza formal con la División de Servicios al Ciudadano para ofrecer acceso preferencial a viajeros estadounidenses registrados en el sistema STEP.",
    en: "Explore a formal partnership with the Citizen Services Division to offer preferential access to American travelers registered in the STEP system.",
  },

  "embassy.cta.kicker": { es: "CONTACTO", en: "CONTACT" },
  "embassy.cta.title": { es: "Protejamos juntos a los", en: "Let's protect American" },
  "embassy.cta.titleEm": { es: "ciudadanos estadounidenses.", en: "citizens together." },
  "embassy.cta.subtitle": {
    es: "Estamos a disposición de la Embajada de los Estados Unidos para presentar la plataforma, compartir datos y explorar una colaboración formal.",
    en: "We are at the disposal of the United States Embassy to present the platform, share data and explore a formal collaboration.",
  },
  "embassy.cta.contactTitle": { es: "Línea directa para la Embajada", en: "Direct Embassy line" },
  "embassy.cta.contactSub": {
    es: "Respuesta garantizada en 24 horas hábiles",
    en: "Guaranteed response within 24 business hours",
  },
  "embassy.cta.cuit": {
    es: "CUIT: 20-XXXXXXXX-X · Empresa argentina registrada",
    en: "CUIT: 20-XXXXXXXX-X · Registered Argentine company",
  },
  "embassy.cta.primary": { es: "Contactar para aval", en: "Contact for Endorsement" },
  "embassy.cta.secondary": { es: "WhatsApp de emergencia", en: "Emergency WhatsApp" },
  "embassy.cta.note": {
    es: "embassy@condorsalud.com.ar · Confidencial · Disponible lunes a viernes",
    en: "embassy@condorsalud.com.ar · Confidential · Available Monday to Friday",
  },

  // ── Segment switcher labels ────────────────────────────────
  "seg.label": { es: "Estoy buscando como:", en: "I'm looking as a:" },
  "seg.provider": { es: "Clínica / Profesional", en: "Clinic / Provider" },
  "seg.tourist": { es: "Paciente / Turista", en: "Patient / Tourist" },
};

export default translations;
