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

  // ── Hero ────────────────────────────────────────────────────
  "hero.badge": {
    es: "Nuevo: Integración con Google Calendar y Doctoraliar.com",
    en: "New: Google Calendar & Doctoraliar.com integration",
  },
  "hero.title1": { es: "Todo tu sistema de salud.", en: "Your entire health system." },
  "hero.title2": { es: "Una sola vista.", en: "One single view." },
  "hero.subtitle": {
    es: "Conectamos PAMI, obras sociales, prepagas y AFIP en una plataforma unificada. Verificá cobertura, facturá automáticamente, y dejá de perder plata por inflación.",
    en: "We connect PAMI, social health plans, private insurers and AFIP in one unified platform. Verify coverage, bill automatically, and stop losing money to inflation.",
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
    es: "PAMI rechazó 3 facturas por código inválido — Reprocesar",
    en: "PAMI rejected 3 invoices for invalid code — Reprocess",
  },
  "hero.mockAlert2": {
    es: "Swiss Medical pagó $2.1M — Cobro acreditado",
    en: "Swiss Medical paid $2.1M — Payment credited",
  },
  "hero.mockAlert3": {
    es: "12 verificaciones de cobertura completadas automáticamente",
    en: "12 coverage verifications completed automatically",
  },
  "hero.mockPatients": { es: "Pacientes hoy", en: "Patients today" },
  "hero.mockPatientsVal": { es: "47", en: "47" },
  "hero.mockPatientsChange": { es: "+12 vs ayer", en: "+12 vs yesterday" },
  "hero.mockAgenda": { es: "Agenda", en: "Schedule" },
  "hero.mockAgendaVal": { es: "94%", en: "94%" },
  "hero.mockAgendaChange": { es: "3 slots libres", en: "3 slots free" },
  "hero.mockAutoTitle": { es: "Automatizaciones activas", en: "Active automations" },
  "hero.mockAuto1": { es: "Verificación de padrón", en: "Registry verification" },
  "hero.mockAuto2": { es: "Facturación electrónica", en: "Electronic billing" },
  "hero.mockAuto3": { es: "Ajuste por inflación", en: "Inflation adjustment" },
  "hero.mockAuto4": { es: "Alertas de vencimiento", en: "Expiry alerts" },
  "hero.mockAlert4": {
    es: "Galeno: 5 autorizaciones pendientes vencen mañana",
    en: "Galeno: 5 pending authorizations expire tomorrow",
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
    es: "Profesionales disponibles para turnos, teleconsulta y guardia en toda Argentina.",
    en: "Professionals available for appointments, teleconsults and ER across Argentina.",
  },
  "pstats.label1": { es: "Tiempo de respuesta", en: "Response time" },
  "pstats.detail1": {
    es: "Desde que escribís a Cora hasta que tenés un turno confirmado o teleconsulta.",
    en: "From messaging Cora to having a confirmed appointment or teleconsult.",
  },
  "pstats.label2": { es: "Farmacias con delivery", en: "Pharmacies with delivery" },
  "pstats.detail2": {
    es: "Farmacias habilitadas que envían medicamentos a tu domicilio en CABA y GBA.",
    en: "Licensed pharmacies delivering medications to your door in Buenos Aires metro.",
  },
  "pstats.label3": { es: "Idiomas disponibles", en: "Languages available" },
  "pstats.detail3": {
    es: "Todo el sistema funciona en español e inglés. Cora atiende 24/7 en ambos idiomas.",
    en: "The entire system works in Spanish and English. Cora is available 24/7 in both.",
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
    es: "19 módulos integrados que cubren desde la verificación de cobertura hasta el reporte directivo. Sin módulos sueltos, sin integraciones extra, sin costos ocultos.",
    en: "19 integrated modules covering from coverage verification to executive reporting. No loose modules, no extra integrations, no hidden costs.",
  },
  "features.core0.title": { es: "Verificación Tiempo Real", en: "Real-Time Verification" },
  "features.core0.desc": {
    es: "Verificá cobertura de PAMI, obras sociales y prepagas antes de atender al paciente. Padrón actualizado, copago estimado y autorización online en segundos.",
    en: "Verify PAMI, social plan and private insurer coverage before seeing the patient. Updated enrollment, estimated copay and online authorization in seconds.",
  },
  "features.core0.hl": { es: "Ahorrá 3hs/día en llamadas", en: "Save 3hrs/day on calls" },
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
    es: "AFIP factura electrónica, receta digital PAMI, SISA, REFEPS y conexión directa con Swiss Medical, OSDE, IOMA, Galeno, Medifé y más de 280 obras sociales.",
    en: "AFIP electronic invoicing, PAMI digital prescriptions, SISA, REFEPS and direct connection with Swiss Medical, OSDE, IOMA, Galeno, Medifé and 280+ social plans.",
  },
  "features.core4.hl": { es: "330+ integraciones", en: "330+ integrations" },
  "features.core5.title": { es: "Dashboard Directivo", en: "Executive Dashboard" },
  "features.core5.desc": {
    es: "Ingresos, rechazos, demoras y rendimiento por financiador en una sola vista. Alertas automáticas cuando algo se desvía. Exportá reportes en PDF y Excel.",
    en: "Revenue, rejections, delays and payer performance in one view. Automatic alerts when something deviates. Export PDF & Excel reports.",
  },
  "features.core5.hl": { es: "Decisiones con datos reales", en: "Data-driven decisions" },
  "features.extra0.title": { es: "Agenda inteligente", en: "Smart scheduling" },
  "features.extra0.desc": {
    es: "Turnos con verificación automática de cobertura",
    en: "Appointments with automatic coverage verification",
  },
  "features.extra1.title": { es: "Farmacia Online", en: "Online Pharmacy" },
  "features.extra1.desc": {
    es: "Receta digital + cobertura PAMI integrada",
    en: "Digital prescription + integrated PAMI coverage",
  },
  "features.extra2.title": { es: "Telemedicina", en: "Telemedicine" },
  "features.extra2.desc": {
    es: "Videoconsulta con facturación automática",
    en: "Video consultation with automatic billing",
  },
  "features.extra3.title": { es: "Triage IA", en: "AI Triage" },
  "features.extra3.desc": {
    es: "Clasificación de urgencias con inteligencia artificial",
    en: "Urgency classification with artificial intelligence",
  },
  "features.extraTitle": {
    es: "Y mucho más incluido en tu plan",
    en: "And much more included in your plan",
  },
  "features.extraSubtitle": {
    es: "19 módulos totales — todos integrados entre sí, sin costo adicional",
    en: "19 total modules — all integrated, no extra cost",
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
  "how.step2.title": { es: "Facturá y cobrá más rápido", en: "Bill and collect faster" },
  "how.step2.desc": {
    es: "Verificá cobertura en tiempo real, facturá sin errores y hacé seguimiento de cada peso. Reducí rechazos desde el primer día.",
    en: "Verify coverage in real time, bill without errors and track every dollar. Reduce rejections from day one.",
  },

  // ── Integrations ────────────────────────────────────────────
  "int.label": { es: "Integraciones", en: "Integrations" },
  "int.title": {
    es: "Conectado con todo el ecosistema de salud argentino",
    en: "Connected with the entire Argentine health ecosystem",
  },
  "int.subtitle": {
    es: "No necesitás integraciones manuales ni archivos CSV. Cóndor se comunica directamente con cada financiador y organismo regulador.",
    en: "No manual integrations or CSV files needed. Cóndor communicates directly with every payer and regulatory body.",
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
    es: "Usá el buscador con GPS o hablá con Cora (nuestro chatbot). Te mostramos médicos disponibles por especialidad, distancia y horario, con mapa y cómo llegar.",
    en: "Use the GPS-powered search or talk to Cora (our chatbot). We show available doctors by specialty, distance and schedule, with a map and directions.",
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
  "cta.hl0": { es: "Reducí rechazos 40–60%", en: "Reduce rejections 40–60%" },
  "cta.hl1": { es: "Cobrá 45 días antes", en: "Collect 45 days sooner" },
  "cta.hl2": { es: "14 días gratis, sin tarjeta", en: "14 days free, no card" },
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
    es: "Nuevo: Integración con PAMI, receta digital y Doctoraliar",
    en: "New: PAMI integration, digital prescriptions & Doctoraliar",
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
    es: "Conectamos PAMI, obras sociales, prepagas y AFIP en una plataforma unificada. Verificá cobertura, facturá automáticamente, y dejá de perder plata por inflación.",
    en: "We connect PAMI, social health plans, private insurers and AFIP in one unified platform. Verify coverage, bill automatically, and stop losing money to inflation.",
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
    es: "Facturación, rechazos, inflación.",
    en: "Billing, rejections, inflation.",
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
    es: "Nuevo: Buscá médicos, farmacias y guardias cerca tuyo",
    en: "New: Find doctors, pharmacies & ERs near you",
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
    es: "¿Necesitás un médico, una farmacia o una guardia? Cóndor Salud te conecta al instante con profesionales, te verifica la cobertura y te permite pedir remedios a domicilio. Todo desde tu celular.",
    en: "Need a doctor, pharmacy or ER? Cóndor Salud connects you instantly with professionals, verifies your coverage and lets you order medicine to your door. All from your phone.",
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
  "hero.mockBilledChange@tourist": { es: "Hoy y esta semana", en: "Today & this week" },
  "hero.mockCollectedVal@tourist": { es: "24/7", en: "24/7" },
  "hero.mockCollectedChange@tourist": { es: "Cora disponible", en: "Cora available" },
  "hero.mockRejectionsVal@tourist": { es: "12 cerca", en: "12 nearby" },
  "hero.mockRejectionsChange@tourist": { es: "< 1 km", en: "< 1 km" },
  "hero.mockDelayVal@tourist": { es: "< 30s", en: "< 30s" },
  "hero.mockDelayChange@tourist": { es: "IA instantánea", en: "Instant AI" },
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
    es: "Encontré 3 clínicos disponibles hoy a menos de 1 km. El más cercano es la Dra. López en Av. Santa Fe 3200, con turno a las 16:30. ¿Reservo?",
    en: "I found 3 GPs available today within 1 km. The closest is Dr. López at Av. Santa Fe 3200, with a slot at 4:30 PM. Shall I book?",
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
    es: "¡Hola! Soy Cora. ¿En qué te puedo ayudar hoy? Puedo buscar médicos, verificar tu cobertura o pedir medicamentos.",
    en: "Hi! I'm Cora. How can I help today? I can find doctors, verify your coverage or order medication.",
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
    es: "PAMI rechazó 3 facturas por código inválido — Reprocesar",
    en: "PAMI rejected 3 invoices for invalid code — Reprocess",
  },
  "hero.mockAlert2@provider": {
    es: "Swiss Medical pagó $2.1M — Cobro acreditado",
    en: "Swiss Medical paid $2.1M — Payment credited",
  },
  "hero.mockAlert3@provider": {
    es: "12 verificaciones de cobertura completadas automáticamente",
    en: "12 coverage verifications completed automatically",
  },
  "hero.mockAutoTitle@provider": { es: "Automatizaciones activas", en: "Active automations" },
  "hero.mockAuto1@provider": { es: "Verificación de padrón", en: "Registry verification" },
  "hero.mockAuto2@provider": { es: "Facturación electrónica", en: "Electronic billing" },
  "hero.mockAuto3@provider": { es: "Ajuste por inflación", en: "Inflation adjustment" },
  "hero.mockAuto4@provider": { es: "Alertas de vencimiento", en: "Expiry alerts" },
  "hero.mockAlert4@provider": {
    es: "Galeno: 5 autorizaciones pendientes vencen mañana",
    en: "Galeno: 5 pending authorizations expire tomorrow",
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
    es: "Necesitás una guardia YA y no sabés dónde queda la más cercana ni si acepta tu cobertura. Cada minuto cuenta.",
    en: "You need an ER NOW and don't know where the closest one is or if it accepts your insurance. Every minute counts.",
  },
  "problem.card3.stats@tourist": {
    es: "Guardias · Farmacias 24h · Ubicación GPS",
    en: "Emergency rooms · 24h pharmacies · GPS location",
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
    es: "Buscá médicos, verificá cobertura, hacé teleconsultas, pedí remedios a domicilio y encontrá guardias cerca. Todo gratis, todo en español e inglés.",
    en: "Find doctors, verify coverage, do teleconsults, order meds to your door and find ERs nearby. All free, all in Spanish & English.",
  },
  "features.core0.title@tourist": { es: "Buscá médicos cerca tuyo", en: "Find nearby doctors" },
  "features.core0.desc@tourist": {
    es: "Médicos verificados con turnos disponibles hoy. Filtrá por especialidad, idioma, obra social y distancia. Con indicaciones de Google Maps.",
    en: "Verified doctors with appointments available today. Filter by specialty, language, health plan and distance. With Google Maps directions.",
  },
  "features.core0.hl@tourist": { es: "Con GPS y Google Maps", en: "GPS + Google Maps" },
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
    es: "Encontrá la guardia o farmacia más cercana en tiempo real. Con dirección, teléfono y cómo llegar en Google Maps.",
    en: "Find the nearest ER or pharmacy in real time. With address, phone and Google Maps directions.",
  },
  "features.core4.hl@tourist": { es: "GPS en tiempo real", en: "Real-time GPS" },
  "features.core5.title@tourist": {
    es: "Cora — Tu enfermera virtual",
    en: "Cora — Your virtual nurse",
  },
  "features.core5.desc@tourist": {
    es: "Contale a Cora qué te pasa y te orienta al médico indicado, te recomienda qué tomar y te busca atención cerca. Como hablar con una enfermera.",
    en: "Tell Cora what's wrong and she'll guide you to the right doctor, recommend what to take, and find care nearby. Like talking to a nurse.",
  },
  "features.core5.hl@tourist": { es: "Chat 24/7 en ES + EN", en: "24/7 chat in ES + EN" },
  "features.cta@tourist": { es: "Probá el chatbot ahora", en: "Try the chatbot now" },
  "features.extraTitle@tourist": {
    es: "Todo lo que necesitás como paciente",
    en: "Everything you need as a patient",
  },
  "features.extraSubtitle@tourist": {
    es: "Servicios integrados, sin costo, desde tu celular",
    en: "Integrated services, free of charge, from your phone",
  },
  "features.extra0.title@tourist": { es: "Turnos online", en: "Online appointments" },
  "features.extra0.desc@tourist": {
    es: "Reservá turno con el médico que necesitás",
    en: "Book an appointment with the doctor you need",
  },
  "features.extra1.title@tourist": { es: "Remedios a domicilio", en: "Meds delivery" },
  "features.extra1.desc@tourist": {
    es: "Pedí medicamentos directo a tu puerta",
    en: "Order medications delivered to your door",
  },
  "features.extra2.title@tourist": { es: "Videoconsulta", en: "Video consult" },
  "features.extra2.desc@tourist": {
    es: "Hablá con un médico desde donde estés",
    en: "Talk to a doctor from wherever you are",
  },
  "features.extra3.title@tourist": { es: "Cora 24/7", en: "Cora 24/7" },
  "features.extra3.desc@tourist": {
    es: "Tu enfermera virtual, siempre disponible",
    en: "Your virtual nurse, always available",
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
    es: "Cora te orienta al médico indicado, verifica tu cobertura y te muestra opciones cerca tuyo con Google Maps.",
    en: "Cora guides you to the right doctor, verifies your coverage and shows options near you with Google Maps.",
  },
  "how.step2.title@tourist": { es: "Resolvé y sentite mejor", en: "Resolve it & feel better" },
  "how.step2.desc@tourist": {
    es: "Sacá turno, hacé una teleconsulta o pedí remedios a tu puerta. Todo sin moverte de donde estés.",
    en: "Book an appointment, do a teleconsult or order meds to your door. All without leaving where you are.",
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
    es: "Hablá con Cora, buscá un médico cerca o hacé una teleconsulta. Todo gratis, todo ahora.",
    en: "Talk to Cora, find a doctor nearby or do a teleconsult. All free, all now.",
  },
  "cta.hl0@tourist": { es: "Médicos cerca tuyo", en: "Doctors near you" },
  "cta.hl1@tourist": { es: "Teleconsulta sin espera", en: "Teleconsult, no wait" },
  "cta.hl2@tourist": { es: "Remedios a domicilio", en: "Meds delivered" },
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

  // ── Segment switcher labels ────────────────────────────────
  "seg.label": { es: "Estoy buscando como:", en: "I'm looking as a:" },
  "seg.provider": { es: "Clínica / Profesional", en: "Clinic / Provider" },
  "seg.tourist": { es: "Paciente / Turista", en: "Patient / Tourist" },
};

export default translations;
