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

  // ── Hero ────────────────────────────────────────────────────
  "hero.badge": {
    es: "Nuevo: Integración con Google Calendar y TopDoctors.com.ar",
    en: "New: Google Calendar & TopDoctors.com.ar integration",
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
};

export default translations;
