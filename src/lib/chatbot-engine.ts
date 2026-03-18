/**
 * Cóndor Salud — Patient Chatbot Engine (Cora)
 *
 * Conversational symptom checker in plain everyday Spanish.
 * - Asks simple layman's-terms questions to understand what's wrong
 * - Routes patients to the correct type of doctor
 * - Recommends specific OTC medicines available at Argentine pharmacies
 * - Handles coverage, appointment booking, and general FAQ
 *
 * DISCLAIMER: This is informational guidance, not a medical diagnosis.
 */

import { whatsappUrl } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: number;
  quickReplies?: QuickReply[];
  cards?: InfoCard[];
  /** Whether the response came from Claude AI or the rule-based engine */
  source?: "ai" | "rules";
  /** Triage context key for conversation continuity (e.g. "pain_head") */
  triageContext?: string;
}

export interface QuickReply {
  label: string;
  value: string;
}

export interface InfoCard {
  title: string;
  body: string;
  icon?: string;
  action?: { label: string; url: string };
  /** Google Maps directions URL (opens in new tab, not an embed) */
  directionsUrl?: string;
  /** Google Maps link for viewing a place */
  mapUrl?: string;
  /** If true, auto-open the action URL when the card is rendered (delivery deep-links) */
  autoOpen?: boolean;
}

interface IntentMatch {
  intent: string;
  confidence: number;
  entities: Record<string, string>;
}

// ─── Intent Patterns ─────────────────────────────────────────
const INTENTS: {
  intent: string;
  patterns: RegExp[];
  entities?: { key: string; pattern: RegExp }[];
}[] = [
  {
    intent: "greeting",
    patterns: [
      /^(hola|buenas?|hey|buen(os|as)\s+(d[ií]as?|tardes?|noches?))/i,
      /^(hi|hello|que\s+tal|c[oó]mo\s+(and[aá]s?|est[aá]s?))/i,
    ],
  },
  {
    intent: "farewell",
    patterns: [
      /^(chau|adi[oó]s|hasta\s+luego|nos\s+vemos|gracias.*chau)/i,
      /^(bye|goodbye|see\s+you)/i,
    ],
  },
  {
    intent: "thanks",
    patterns: [/^(gracias|muchas\s+gracias|genial|perfecto|excelente|buenísimo)/i],
  },
  // UM-10/UM-11: COVID intent
  {
    intent: "covid",
    patterns: [
      /covid/i,
      /coronavirus/i,
      /(?:creo|puede|tengo).*(?:covid|corona)/i,
      /(?:test|hisopado|pcr).*covid/i,
      /(?:tos|fiebre|perdida.+(?:olfato|gusto)).*covid/i,
    ],
  },
  // ── Body-part / symptom intents (plain language) ──────────
  {
    intent: "pain_head",
    patterns: [
      /(?:dolor|me\s+duele)\s+(?:(?:de|en)\s+)?(?:la\s+)?cabeza/i,
      /(?:jaqueca|migraña|puntada.+cabeza)/i,
      /cabeza.+(?:duele|dolor|explota|molest|pesa)/i,
    ],
  },
  {
    intent: "pain_chest",
    patterns: [
      /(?:dolor|me\s+duele|presión|aprieta|oprime)\s+(?:(?:de|en)\s+)?(?:el\s+)?(?:pecho|torax|tórax)/i,
      /pecho.+(?:duele|dolor|aprieta|presión)/i,
      /(?:me\s+cuesta\s+respirar|no\s+puedo\s+respirar|falta\s+(?:de\s+)?aire)/i,
    ],
  },
  {
    intent: "pain_belly",
    patterns: [
      /(?:dolor|me\s+duele)\s+(?:(?:de|en)\s+)?(?:la\s+)?(?:panza|barriga|estómago|est[oó]mago|abdomen|tripa)/i,
      /(?:panza|barriga|estómago|est[oó]mago).+(?:duele|dolor|hinch|inflam)/i,
      /(?:acidez|reflujo|gastritis|n[aá]usea|v[oó]mito|vomit)/i,
      /(?:diarrea|estre[nñ]imiento|no\s+puedo\s+ir\s+al\s+baño|indigesti)/i,
    ],
  },
  {
    intent: "pain_throat",
    patterns: [
      /(?:dolor|me\s+duele)\s+(?:(?:de|en)\s+)?(?:la\s+)?garganta/i,
      /garganta.+(?:duele|dolor|irrit|rasp|inflam)/i,
      /(?:angina|no\s+puedo\s+tragar|tragar.+duele)/i,
    ],
  },
  {
    intent: "pain_back",
    patterns: [
      /(?:dolor|me\s+duele)\s+(?:(?:de|en)\s+)?(?:la\s+)?(?:espalda|cintura|columna|lumbares?)/i,
      /(?:espalda|cintura|columna).+(?:duele|dolor|trabar?|contractur)/i,
      /(?:ciática|ci[aá]tica|lumbago|contractura)/i,
    ],
  },
  {
    intent: "pain_joints",
    patterns: [
      /(?:dolor|me\s+duele)\s+(?:(?:de|en)\s+)?(?:la\s+|el\s+)?(?:rodilla|tobillo|muñeca|codo|hombro|cadera)/i,
      /(?:rodilla|tobillo|muñeca|codo|hombro|cadera).+(?:duele|dolor|inflam|hinch)/i,
      /(?:articulaci|hueso|me\s+duelen\s+los\s+huesos)/i,
      /(?:esguince|torced|me\s+dobl[eé]|me\s+golp[eé])/i,
    ],
  },
  {
    intent: "skin_issue",
    patterns: [
      /(?:sarpullido|erupci[oó]n|ronchas|granitos?|acn[eé]|picaz[oó]n|me\s+pica)/i,
      /(?:mancha|lunar|verruga|hongo|piel.+(?:seca|roja|irrit))/i,
      /(?:quemadura\s+(?:de\s+)?sol|ampolla)/i,
    ],
  },
  {
    intent: "eye_issue",
    patterns: [
      /(?:me\s+duele|dolor|molest).+(?:ojo|ojos|vista)/i,
      /(?:ojo|ojos).+(?:rojo|seco|lagrim|irrit|hinch|pica)/i,
      /(?:veo\s+borroso|no\s+veo\s+bien|perdí?\s+vista|me\s+arden?\s+los\s+ojos)/i,
      /(?:conjuntivitis|orzuelo)/i,
    ],
  },
  {
    intent: "ear_issue",
    patterns: [
      /(?:me\s+duele|dolor|molest).+(?:oído|oreja)/i,
      /(?:oído|oreja).+(?:duele|dolor|tapad|zumbid|pica)/i,
      /(?:otitis|zumbido|no\s+escucho\s+bien|escucho\s+mal)/i,
    ],
  },
  {
    intent: "fever",
    patterns: [
      /(?:tengo\s+)?fiebre/i,
      /(?:temperatura\s+alta|estoy\s+(?:caliente|levantando\s+temperatura))/i,
      /(?:escalofr[ií]o|me\s+tiembla\s+el\s+cuerpo|transpir.+mucho)/i,
    ],
  },
  {
    intent: "cold_flu",
    patterns: [
      /(?:gripe|resfrí?[iao]|resfriado|catarro)/i,
      /(?:mocos?|congesti[oó]n|nariz\s+(?:tapada|congestionada)|estornudo)/i,
      /(?:tos\s+(?:seca|con\s+flema)|no\s+paro\s+de\s+toser|toso\s+mucho)/i,
    ],
  },
  {
    intent: "allergy",
    patterns: [
      /(?:alergia|al[eé]rgic[oa]|me\s+(?:broto|broté)|me\s+sale.+roncha)/i,
      /(?:estornudo.+mucho|ojos.+(?:llor|lagrim|pic).+nariz)/i,
    ],
  },
  {
    intent: "anxiety_stress",
    patterns: [
      /(?:ansiedad|ansios[oa]|estresad[oa]|estrés|nervios[oa]|angustia)/i,
      /(?:ataque\s+de\s+pánico|no\s+puedo\s+dormir|insomnio|me\s+siento\s+mal\s+emocionalmente)/i,
      /(?:depresi[oó]n|triste|lloro\s+mucho|no\s+tengo\s+ganas\s+de\s+nada)/i,
    ],
  },
  {
    intent: "blood_pressure",
    patterns: [
      /(?:presión\s+(?:alta|baja)|hipertensi[oó]n|hipotensi[oó]n)/i,
      /(?:se\s+me\s+subi[oó]\s+la\s+presi[oó]n|mareo.+presi[oó]n)/i,
    ],
  },
  {
    intent: "kids",
    patterns: [
      /(?:mi\s+(?:hijo|hija|nene|nena|beb[eé]|chico|chica))/i,
      /(?:el\s+nene|la\s+nena|el\s+beb[eé]).+(?:tiene|le\s+duele|está)/i,
      /(?:pediatra|para\s+(?:mi\s+)?(?:hijo|hija|chico|nene))/i,
    ],
  },
  {
    intent: "women_health",
    patterns: [
      /(?:ginec[oó]log|menstruaci[oó]n|regla|per[ií]odo|embaraz|anticonceptiv)/i,
      /(?:dolor\s+menstrual|c[oó]lic[oa].+menstrual|atraso|test\s+de\s+embarazo)/i,
      /(?:pap|mamograf[ií]a|control\s+ginecol[oó]gic)/i,
    ],
  },
  {
    intent: "dental",
    patterns: [
      /(?:dolor\s+de\s+muela|me\s+duele.+muela|me\s+duele.+diente)/i,
      /(?:dentista|odont[oó]log|caries|enc[ií]a|sangr.+enc[ií]a)/i,
    ],
  },
  // ── Generic symptom catch-all ─────────────────────────────
  {
    intent: "triage_generic",
    patterns: [
      /(?:tengo|siento|me\s+duele|me\s+siento|me\s+molesta|padezco|sufro)\s+(.+)/i,
      /(?:s[ií]ntoma|malestar|enferm|no\s+me\s+siento\s+bien)/i,
      /(?:me\s+siento\s+mal|me\s+siento\s+(?:raro|rara)|algo\s+me\s+pasa)/i,
      /(?:emergencia|urgencia|grave|necesito\s+(?:un\s+)?m[eé]dic)/i,
    ],
  },
  // ── Non-symptom intents ───────────────────────────────────
  {
    intent: "coverage",
    patterns: [
      /(?:cobertura|obra\s+social|prepaga|pami|osde|swiss\s*medical|galeno|medif[eé])/i,
      /(?:cubre|cubr[ií]|reintegr|autorizaci[oó]n|coseguro)/i,
      /(?:qu[eé]\s+(?:me\s+)?cubre|plan(?:es)?)/i,
    ],
    entities: [
      {
        key: "provider",
        pattern:
          /(?:pami|osde|swiss\s*medical|galeno|medif[eé]|osprera|accord\s*salud|uni[oó]n\s*personal)/i,
      },
    ],
  },
  {
    intent: "appointment",
    patterns: [
      /(?:turno|cita|reserv|agend|sacar\s+turno|pedir\s+turno)/i,
      /(?:cu[aá]ndo|disponib|horario|agenda)/i,
    ],
  },
  {
    intent: "medication",
    patterns: [
      /(?:medicamento|remedio|receta|pastilla|medicaci[oó]n)/i,
      /(?:farmacia|comprar|retir|entreg)/i,
      /(?:gen[eé]rico|marca|precio|descuento)/i,
    ],
  },
  {
    intent: "delivery",
    patterns: [
      /(?:rappi|pedidos\s*ya|pedir.*(?:casa|domicilio|delivery))/i,
      /(?:delivery.*(?:farmacia|remedio|medicamento|pastilla))/i,
      /(?:(?:que|quiero).*(?:traigan|env[ií]en|lleven).*(?:remedio|medicamento|farmacia|casa))/i,
      /(?:(?:remedio|medicamento|pastilla).*(?:domicilio|casa|delivery|envío|envio))/i,
      /(?:pedir.*(?:rappi|pedidos\s*ya))/i,
      /(?:comprar.*(?:online|app|aplicaci[oó]n).*(?:remedio|medicamento|farmacia))/i,
    ],
  },
  {
    intent: "telemedicine",
    patterns: [
      /(?:telemedicina|teleconsulta|video\s*consulta|videollamada)/i,
      /(?:consulta\s+(?:por|en)\s+(?:video|l[ií]nea|internet))/i,
      /(?:hablar\s+con\s+(?:un\s+)?(?:m[eé]dico|doctor)\s+(?:ahora|ya|online))/i,
    ],
  },
  {
    intent: "pricing",
    patterns: [
      /(?:precio|costo|cu[aá]nto\s+(?:sale|cuesta|vale)|tarifa|abono)/i,
      /(?:plan(?:es)?|suscripci[oó]n|pag[oa]|mercado\s*pago)/i,
    ],
  },
  {
    intent: "how_it_works",
    patterns: [
      /(?:c[oó]mo\s+funciona|qu[eé]\s+(?:es|hace)|para\s+qu[eé]\s+sirve)/i,
      /(?:explicame|cont[aá]me|qu[eé]\s+ofrece)/i,
    ],
  },
  {
    intent: "register",
    patterns: [
      /(?:registr|inscrib|crear\s+cuenta|darme\s+de\s+alta|unirme)/i,
      /(?:c[oó]mo\s+(?:me\s+)?(?:registro|inscribo|empiezo))/i,
    ],
  },
  {
    intent: "contact_human",
    patterns: [
      /(?:hablar\s+con\s+(?:alguien|una?\s+persona|humano|agente|operador))/i,
      /(?:atenci[oó]n\s+(?:al\s+)?cliente|soporte|ayuda\s+humana)/i,
    ],
  },
  {
    intent: "location",
    patterns: [
      /(?:d[oó]nde\s+(?:est[aá]n?|queda)|direcci[oó]n|sucursal|oficina)/i,
      /(?:(?:qu[eé]\s+)?(?:zona|barrio|localidad|provincia))/i,
    ],
  },
  // ── Geolocation-aware intents ─────────────────────────────
  {
    intent: "nearby_doctor",
    patterns: [
      /(?:m[eé]dico|doctor|profesional|consultor).*(?:cerca|cercan|pr[oó]xim|al\s+lado)/i,
      /(?:cerca|cercan|pr[oó]xim).*(?:m[eé]dico|doctor|profesional|consultor)/i,
      /(?:buscar|encontrar).*(?:m[eé]dico|doctor).*(?:cerca|zona)/i,
      /(?:consultor|cl[ií]nica|centro\s+m[eé]dico).*(?:cerca|pr[oó]xim)/i,
    ],
  },
  {
    intent: "nearby_pharmacy",
    patterns: [
      /(?:farmacia|farmacias).*(?:cerca|cercan|pr[oó]xim|guardia|turno)/i,
      /(?:cerca|cercan|pr[oó]xim).*farmacia/i,
      /(?:farmacia\s+de\s+(?:turno|guardia))/i,
      /(?:d[oó]nde.*(?:compro|consigo).*(?:remedio|medicamento))/i,
    ],
  },
  {
    intent: "nearby_guardia",
    patterns: [
      /(?:guardia|emergencia|urgencia|hospital).*(?:cerca|cercan|pr[oó]xim|m[aá]s\s+cercan)/i,
      /(?:cerca|cercan|pr[oó]xim).*(?:guardia|emergencia|urgencia|hospital)/i,
      /(?:d[oó]nde.*guardia|guardia.*d[oó]nde)/i,
      /(?:necesito.*(?:guardia|hospital|emergencia))/i,
    ],
  },
  {
    intent: "directions",
    patterns: [
      /(?:c[oó]mo\s+llego|c[oó]mo\s+llegar|indicaciones|ruta|camino)/i,
      /(?:direcciones|navegaci[oó]n|GPS|google\s*maps)/i,
      /(?:llev[aá]me|guiame|gui[aá]me|ir\s+(?:a|al|hasta))/i,
      /(?:abrir\s+google\s*maps|farmacias?\s+en\s+google|m[eé]dicos?\s+en\s+google)/i,
    ],
  },
  {
    intent: "shared_location",
    patterns: [
      /(?:compart[ií]\s+(?:mi\s+)?ubicaci[oó]n)/i,
      /(?:ya\s+compart[ií]|activ[eé]\s+(?:la\s+)?ubicaci[oó]n|habilit[eé]\s+(?:el\s+)?GPS)/i,
    ],
  },
];

// ─── Symptom Triage Database ─────────────────────────────────
// Plain-language advice, OTC meds (Argentine brand names), and doctor routing
interface TriageEntry {
  severity: "leve" | "moderado" | "serio" | "emergencia";
  doctorType: string;
  doctorLabel: string; // plain language name
  advice: string;
  otcMeds: { name: string; dose: string; note: string }[];
  redFlags: string;
  homeRemedies?: string;
}

const TRIAGE: Record<string, TriageEntry> = {
  pain_head: {
    severity: "leve",
    doctorType: "Clínica General",
    doctorLabel: "médico clínico (médico de cabecera)",
    advice:
      "El dolor de cabeza más común es por tensión, cansancio o falta de agua. Si te pasa seguido, un médico clínico puede ayudarte a encontrar la causa.",
    otcMeds: [
      {
        name: "Tafirol (paracetamol) 500mg",
        dose: "1 comprimido cada 6-8 horas",
        note: "No más de 4 por día. Es suave para el estómago.",
      },
      {
        name: "Ibupirac (ibuprofeno) 400mg",
        dose: "1 comprimido cada 8 horas, con comida",
        note: "Mejor si hay inflamación. No tomar con el estómago vacío.",
      },
    ],
    redFlags:
      "Andá a la guardia urgente si: el dolor es el peor de tu vida, apareció de golpe, tenés fiebre alta, vómitos, rigidez en el cuello o visión borrosa.",
    homeRemedies:
      "Mientras tanto: descansá en un lugar oscuro y tranquilo, tomá mucha agua, y ponete un paño frío en la frente.",
  },
  pain_chest: {
    severity: "emergencia",
    doctorType: "Guardia / Cardiología",
    doctorLabel: "guardia de emergencia o cardiólogo (médico del corazón)",
    advice:
      "[URGENTE] El dolor en el pecho puede ser algo del corazón. No esperes — llamá al 107 (SAME) o andá a la guardia más cercana YA.\n\nNo te automediques con nada para el dolor de pecho.",
    otcMeds: [],
    redFlags:
      "Llamá al 107 AHORA si sentís: presión o peso fuerte en el pecho, dolor que va hacia el brazo izquierdo, mandíbula o espalda, falta de aire, sudor frío, o mareos.",
  },
  pain_belly: {
    severity: "moderado",
    doctorType: "Gastroenterología",
    doctorLabel: "gastroenterólogo (médico del estómago y la digestión)",
    advice:
      "El dolor de panza puede ser por muchas cosas: algo que comiste, estrés, acidez, o algo que necesita atención. Si es leve, se puede aliviar en casa. Si es fuerte o no se va, necesitás ver a un médico.",
    otcMeds: [
      {
        name: "Buscapina (hioscina) 10mg",
        dose: "1-2 comprimidos cada 6 horas",
        note: "Para retortijones y calambres en la panza. Relaja los músculos del estómago.",
      },
      {
        name: "Sertal Compuesto",
        dose: "1 comprimido cada 6-8 horas",
        note: "Bueno para dolor de panza con calambres. Se consigue sin receta.",
      },
      {
        name: "Alka-Seltzer o Mylanta",
        dose: "Según el envase",
        note: "Si sentís acidez, ardor o reflujo. Alivia rápido.",
      },
      {
        name: "Imodium (loperamida) 2mg",
        dose: "1 cápsula después de cada deposición suelta, máx 4/día",
        note: "Solo para diarrea. No usar si tenés fiebre o sangre en la materia fecal.",
      },
    ],
    redFlags:
      "Andá a la guardia si: el dolor es muy fuerte y no para, tenés fiebre, vomitás sangre, tenés la panza dura como una tabla, o no podés ir al baño hace varios días.",
    homeRemedies:
      "Mientras tanto: comé liviano (arroz, pollo hervido, galletitas), tomá mucho líquido, evitá frituras y lácteos, y descansá.",
  },
  pain_throat: {
    severity: "leve",
    doctorType: "Otorrinolaringología / Clínica General",
    doctorLabel: "médico clínico o un otorrino (médico de garganta, nariz y oído)",
    advice:
      "El dolor de garganta la mayoría de las veces es viral (como un resfrío). Si ves placas blancas, tenés fiebre alta o no podés tragar, puede ser una infección que necesita antibióticos con receta.",
    otcMeds: [
      {
        name: "Estrepsils pastillas",
        dose: "1 pastilla cada 2-3 horas, disolver en la boca",
        note: "Alivia la irritación y el dolor. Tienen un poco de anestesia local.",
      },
      {
        name: "Tafirol (paracetamol) 500mg",
        dose: "1 comprimido cada 6-8 horas",
        note: "Para el dolor y la fiebre.",
      },
      {
        name: "Ibupirac (ibuprofeno) 400mg",
        dose: "1 comprimido cada 8 horas, con comida",
        note: "Baja la inflamación de la garganta.",
      },
    ],
    redFlags:
      "Vé al médico si: no podés tragar ni agua, tenés fiebre mayor a 38.5°C por más de 2 días, ves puntitos blancos en la garganta, o te cuesta respirar.",
    homeRemedies:
      "Mientras tanto: hacé gárgaras con agua tibia y sal (1 cucharadita en un vaso), tomá líquidos tibios como té con miel y limón, evitá bebidas heladas.",
  },
  pain_back: {
    severity: "leve",
    doctorType: "Traumatología / Kinesiología",
    doctorLabel: "traumatólogo (médico de huesos y músculos) o kinesiólogo",
    advice:
      "El dolor de espalda más común es muscular, por mala postura, esfuerzo o estrés. Casi siempre mejora en unos días con descanso y medicación. Si baja por la pierna, puede ser un nervio pinzado.",
    otcMeds: [
      {
        name: "Ibupirac (ibuprofeno) 600mg",
        dose: "1 comprimido cada 8 horas, con comida",
        note: "Desinflama y calma el dolor. El más usado para dolores musculares.",
      },
      {
        name: "Diclofenac gel (Voltaren Emulgel)",
        dose: "Aplicar en la zona 3-4 veces al día",
        note: "Crema antiinflamatoria. Se pone directamente donde duele.",
      },
      {
        name: "Relaxyl (ciclobenzaprina) 5mg",
        dose: "1 comprimido a la noche",
        note: "Relaja los músculos contracturados. Puede dar sueño — ojo al manejar.",
      },
    ],
    redFlags:
      "Vé a la guardia si: perdés fuerza en las piernas, sentís hormigueo o adormecimiento que baja por la pierna, o perdés el control de la vejiga o intestinos.",
    homeRemedies:
      "Mientras tanto: poné calor local (bolsa de agua caliente, 15-20 min), evitá levantar cosas pesadas, hacé movimientos suaves, y no te quedes quieto todo el día.",
  },
  pain_joints: {
    severity: "moderado",
    doctorType: "Traumatología",
    doctorLabel: "traumatólogo (médico de huesos, articulaciones y músculos)",
    advice:
      "Si te golpeaste o te doblaste algo, lo más probable es un esguince o una torcedura. Si la hinchazón o el dolor son fuertes, conviene sacar una placa para descartar una fractura.",
    otcMeds: [
      {
        name: "Ibupirac (ibuprofeno) 600mg",
        dose: "1 comprimido cada 8 horas, con comida",
        note: "Baja la hinchazón y el dolor.",
      },
      {
        name: "Diclofenac gel (Voltaren Emulgel)",
        dose: "Aplicar en la zona 3-4 veces al día",
        note: "Crema antiinflamatoria. No usar sobre heridas abiertas.",
      },
    ],
    redFlags:
      "Andá a la guardia si: no podés mover la articulación, está muy hinchada y caliente, se ve una deformidad, o el dolor no cede con nada.",
    homeRemedies:
      "Mientras tanto: poné hielo envuelto en un trapo (15 min cada hora), mantené la zona elevada, usá una venda elástica si podés, y descansá.",
  },
  skin_issue: {
    severity: "leve",
    doctorType: "Dermatología",
    doctorLabel: "dermatólogo (médico de la piel)",
    advice:
      "Los problemas de piel pueden ser alergias, picaduras, hongos, o irritaciones. Para cosas leves podés empezar con algo de la farmacia, pero si no mejora en unos días o empeora, un dermatólogo te da el tratamiento exacto.",
    otcMeds: [
      {
        name: "Loratadina 10mg (Clarytil, Alergin)",
        dose: "1 comprimido por día",
        note: "Para picazón, ronchas y alergias de piel. No da sueño.",
      },
      {
        name: "Calamina loción",
        dose: "Aplicar en la zona afectada varias veces al día",
        note: "Alivia la picazón y refresca la piel. Ideal para picaduras y sarpullido.",
      },
      {
        name: "Dermaglos crema con vitamina A",
        dose: "Aplicar 2-3 veces al día",
        note: "Hidrata y ayuda a reparar piel irritada o seca.",
      },
    ],
    redFlags:
      "Vé al médico urgente si: la erupción se expande rápido, tenés fiebre, la zona está caliente y con pus, o tenés hinchazón en cara/labios/lengua (puede ser alergia grave).",
    homeRemedies:
      "Mientras tanto: no te rasques (empeora), usá ropa suelta de algodón, lavá la zona con agua tibia y jabón neutro.",
  },
  eye_issue: {
    severity: "moderado",
    doctorType: "Oftalmología",
    doctorLabel: "oftalmólogo (médico de los ojos)",
    advice:
      "Los ojos rojos, secos o con lagrimeo pueden ser por cansancio, alergia o conjuntivitis. Si usás pantallas mucho rato, puede ser fatiga visual. Un oftalmólogo puede chequearte bien.",
    otcMeds: [
      {
        name: "Systane o Refresh (lágrimas artificiales)",
        dose: "1-2 gotas en cada ojo, varias veces al día",
        note: "Para ojos secos, cansados o irritados. Sin receta.",
      },
      {
        name: "Oftalmol Alergia (nafazolina + antihistamínico)",
        dose: "1-2 gotas, 2-3 veces al día, máx 5 días",
        note: "Para ojos rojos por alergia. No usar más de 5 días seguidos.",
      },
    ],
    redFlags:
      "Andá al oftalmólogo urgente si: ves luces o manchas flotantes de repente, perdés visión, sentís dolor fuerte adentro del ojo, o te cayó un producto químico en el ojo.",
    homeRemedies:
      "Mientras tanto: no te frotes los ojos, descansá la vista de la pantalla cada 20 min, y ponete compresas frías si están hinchados.",
  },
  ear_issue: {
    severity: "moderado",
    doctorType: "Otorrinolaringología",
    doctorLabel: "otorrino (médico de oídos, nariz y garganta)",
    advice:
      "El dolor de oído puede ser por infección, taponamiento de cera, o por sonarte mucho la nariz estando congestionado. No metas nada adentro del oído (ni hisopos).",
    otcMeds: [
      {
        name: "Tafirol (paracetamol) 500mg",
        dose: "1 comprimido cada 6-8 horas",
        note: "Para el dolor. Las gotas para oído necesitan receta en la mayoría de los casos.",
      },
      {
        name: "Ibupirac (ibuprofeno) 400mg",
        dose: "1 comprimido cada 8 horas, con comida",
        note: "Si hay inflamación o dolor fuerte.",
      },
    ],
    redFlags:
      "Vé al médico ya si: te sale líquido o pus del oído, perdiste audición de golpe, tenés fiebre alta, o el dolor es insoportable.",
    homeRemedies:
      "Mientras tanto: poné un paño tibio sobre la oreja, no metas agua ni hisopos, y evitá ruidos fuertes.",
  },
  fever: {
    severity: "moderado",
    doctorType: "Clínica General",
    doctorLabel: "médico clínico (médico de cabecera)",
    advice:
      "Tener fiebre significa que tu cuerpo está peleando contra algo — una infección o virus generalmente. Se puede manejar en casa si es menor de 39°C y no dura más de 2-3 días.",
    otcMeds: [
      {
        name: "Tafirol (paracetamol) 500-1000mg",
        dose: "1 comprimido cada 6-8 horas",
        note: "Es el mejor para bajar la fiebre. Seguro y efectivo.",
      },
      {
        name: "Ibupirac (ibuprofeno) 400mg",
        dose: "1 comprimido cada 8 horas, con comida",
        note: "Alternativa al paracetamol. No tomar los dos juntos sin indicación médica.",
      },
    ],
    redFlags:
      "Andá a la guardia si: la fiebre pasa de 39.5°C y no baja con medicación, dura más de 3 días, tenés rigidez en el cuello, sarpullido que no desaparece al apretar, o confusión.",
    homeRemedies:
      "Mientras tanto: tomá mucho líquido (agua, jugos, caldo), usá ropa liviana, no te abrigues de más, y descansá.",
  },
  cold_flu: {
    severity: "leve",
    doctorType: "Clínica General",
    doctorLabel: "médico clínico (médico de cabecera)",
    advice:
      "La gripe y los resfríos son virales — no necesitan antibióticos. Duran 5-7 días y se van solos. Lo que se puede hacer es aliviar las molestias para sentirte mejor.",
    otcMeds: [
      {
        name: "Tafirol Gripe (paracetamol + pseudoefedrina + clorfeniramina)",
        dose: "1 comprimido cada 6-8 horas",
        note: "Alivia fiebre, dolor, congestión nasal y estornudos. Todo en uno.",
      },
      {
        name: "Nastizol (pseudoefedrina + clorfeniramina)",
        dose: "1 comprimido cada 8 horas",
        note: "Para la congestión y los mocos. Puede dar un poco de sueño.",
      },
      {
        name: "Miel con limón en agua caliente",
        dose: "Varias veces al día",
        note: "No es medicamento pero funciona para calmar la garganta y la tos.",
      },
      {
        name: "Pectorán o Mucosolván (ambroxol) jarabe",
        dose: "10ml, 3 veces al día",
        note: "Afloja la flema si tenés tos con moco espeso.",
      },
    ],
    redFlags:
      "Vé al médico si: te cuesta respirar, la fiebre dura más de 5 días, escupís flema verdosa o con sangre, o sos mayor de 65 o tenés enfermedades crónicas.",
    homeRemedies:
      "Mientras tanto: descansá mucho, tomá líquidos calientes, hacé vahos con agua caliente (respirar el vapor), y mantené la nariz limpia con solución fisiológica.",
  },
  allergy: {
    severity: "leve",
    doctorType: "Alergia e Inmunología",
    doctorLabel: "alergista (médico de alergias)",
    advice:
      "Las alergias son re comunes: polvo, polen, pelos de mascota, o alimentos pueden provocarlas. Hay remedios de farmacia que alivian rápido. Si te pasa seguido, un alergista puede hacerte tests para saber qué te provoca la alergia.",
    otcMeds: [
      {
        name: "Loratadina 10mg (Clarytil, Alergin)",
        dose: "1 comprimido por día",
        note: "El antialérgico más común. No da sueño. Ideal para estornudos, mocos y picazón.",
      },
      {
        name: "Cetirizina 10mg (Zyrtec, Alerfast)",
        dose: "1 comprimido por día, a la noche",
        note: "Un poco más fuerte que la loratadina. Puede dar algo de sueño.",
      },
      {
        name: "Solución fisiológica nasal (Nasalub, Marimer)",
        dose: "2-3 aplicaciones por fosa nasal, varias veces al día",
        note: "Limpia la nariz de alérgenos. Sin contraindicaciones.",
      },
    ],
    redFlags:
      "Llamá al 107 URGENTE si: se te hinchan los labios, la lengua o la garganta, te cuesta respirar, o sentís que te vas a desmayar (puede ser anafilaxia).",
    homeRemedies:
      "Mientras tanto: mantené las ventanas cerradas si hay viento, lavate las manos y la cara al llegar a casa, duchate antes de dormir para sacar el polen del pelo.",
  },
  anxiety_stress: {
    severity: "moderado",
    doctorType: "Psicología / Psiquiatría",
    doctorLabel: "psicólogo o psiquiatra (profesionales de salud mental)",
    advice:
      "Sentir ansiedad, estrés o angustia es más común de lo que pensás, y tiene solución. Hablar con un profesional de salud mental es el primer paso. No es de débil — es de inteligente cuidarse.",
    otcMeds: [
      {
        name: "Tilo / Valeriana en saquitos o gotas",
        dose: "1-2 tazas de té por día, especialmente a la noche",
        note: "Son hierbas naturales que relajan. Se consiguen en cualquier farmacia o supermercado.",
      },
      {
        name: "Melatonina 3mg (si no podés dormir)",
        dose: "1 comprimido 30 min antes de acostarte",
        note: "Ayuda a regular el sueño. No es adictiva. Se vende sin receta.",
      },
    ],
    redFlags:
      "Buscá ayuda ahora si: sentís que querés hacerte daño, pensás en quitarte la vida, o tenés un ataque de pánico que no para. Línea de crisis: 135 (atención 24hs).",
    homeRemedies:
      "Mientras tanto: respirá despacio (inhalá 4 seg, retené 4 seg, exhalá 6 seg), salí a caminar aunque sea 10 minutos, reducí la cafeína, y trata de dormir 7-8 horas.",
  },
  blood_pressure: {
    severity: "serio",
    doctorType: "Cardiología / Clínica General",
    doctorLabel: "cardiólogo (médico del corazón) o médico clínico",
    advice:
      "La presión alta o baja necesita control médico. Si ya tomás medicación, no la dejes por tu cuenta. Si te sentís mal (dolor de cabeza fuerte, mareos, visión borrosa), puede ser una emergencia.",
    otcMeds: [],
    redFlags:
      "Andá a urgencias YA si: tenés dolor de cabeza muy fuerte con presión alta, visión borrosa, dolor de pecho, náuseas, o confusión. Puede ser una crisis hipertensiva.",
    homeRemedies:
      "Mientras tanto: sentate tranquilo/a, respirá profundo, evitá la sal, y medí la presión si tenés tensiómetro. Si supera 180/120, andá a la guardia.",
  },
  kids: {
    severity: "moderado",
    doctorType: "Pediatría",
    doctorLabel: "pediatra (médico de niños)",
    advice:
      "Para los chicos siempre conviene consultar con un pediatra, sobre todo si son bebés o menores de 2 años. Los nenes se deshidratan más rápido y las fiebres hay que controlarlas con cuidado.",
    otcMeds: [
      {
        name: "Tafirol Pediátrico (paracetamol) gotas o jarabe",
        dose: "Según el peso del niño (ver envase). Cada 6-8 horas",
        note: "Lo más seguro para fiebre y dolor en chicos. Verificá la dosis por peso, no por edad.",
      },
      {
        name: "Ibupirac Pediátrico (ibuprofeno) jarabe",
        dose: "Según el peso del niño (ver envase). Cada 8 horas",
        note: "A partir de los 6 meses. No dar con el estómago vacío.",
      },
    ],
    redFlags:
      "Llevá al nene a urgencias si: es menor de 3 meses y tiene fiebre, llora sin parar y no se calma, tiene dificultad para respirar, está somnoliento o no responde, o tiene manchas que no desaparecen al apretar la piel.",
    homeRemedies:
      "Mientras tanto: dale mucho líquido (agua, leche, jugos), vestilo con ropa liviana si tiene fiebre, y controlá la temperatura cada hora.",
  },
  women_health: {
    severity: "leve",
    doctorType: "Ginecología",
    doctorLabel: "ginecólogo/a (médico/a de salud de la mujer)",
    advice:
      "Temas de menstruación, anticonceptivos, controles de rutina y embarazo los maneja el/la ginecólogo/a. Es importante hacer un control anual incluso si no tenés molestias.",
    otcMeds: [
      {
        name: "Ibupirac (ibuprofeno) 400mg",
        dose: "1 comprimido cada 8 horas, con comida",
        note: "Para los cólicos menstruales. Empezá a tomarlo cuando empiece el dolor, no esperes a que sea fuerte.",
      },
      {
        name: "Buscapina Fem (hioscina + paracetamol)",
        dose: "1-2 comprimidos cada 6 horas",
        note: "Diseñado para dolor menstrual. Relaja los calambres y quita el dolor.",
      },
    ],
    redFlags:
      "Consultá urgente si: tenés sangrado muy abundante que no para, dolor pélvico fuerte y repentino, o creés que podés estar embarazada y tenés sangrado o dolor.",
    homeRemedies:
      "Para los cólicos: poné una bolsa de agua caliente en la panza, tomá infusiones de manzanilla, y hacé ejercicio liviano (caminar ayuda).",
  },
  dental: {
    severity: "moderado",
    doctorType: "Odontología",
    doctorLabel: "dentista u odontólogo",
    advice:
      "El dolor de muela puede ser muy fuerte y casi siempre necesita que te vea un dentista. Mientras tanto podés aliviarlo un poco con medicación de farmacia, pero no va a resolver la causa.",
    otcMeds: [
      {
        name: "Ibupirac (ibuprofeno) 600mg",
        dose: "1 comprimido cada 8 horas, con comida",
        note: "Lo más efectivo para dolor de muela por la inflamación.",
      },
      {
        name: "Tafirol (paracetamol) 1g",
        dose: "1 comprimido cada 6-8 horas",
        note: "Si no podés tomar ibuprofeno (problemas de estómago, etc).",
      },
      {
        name: "Listerine o Plax (enjuague bucal con antiséptico)",
        dose: "Enjuagar 30 seg, 2-3 veces al día",
        note: "Ayuda a mantener la zona limpia y reduce bacterias.",
      },
    ],
    redFlags:
      "Andá al dentista de urgencia si: tenés la cara hinchada, fiebre, no podés abrir la boca, o el dolor es insoportable y no cede con nada.",
    homeRemedies:
      "Mientras tanto: enjuagate con agua tibia y sal, evitá cosas muy frías, calientes o dulces, y no toques la zona.",
  },
};

// ─── Language helper ─────────────────────────────────────────

function en(lang?: string): boolean {
  return !!lang && lang.startsWith("en");
}

// ─── Response Generators ─────────────────────────────────────

function generateGreeting(lang?: string): Partial<ChatMessage> {
  if (en(lang)) {
    return {
      text: "Hi! I'm Cora, your virtual nurse\n\nI'm glad you reached out. Tell me what's going on — I'll ask a few questions like a nurse would to understand your situation and guide you to the right doctor.\n\nIf something hurts or you're not feeling well, start there. Take your time.",
      quickReplies: [
        { label: "I'm not feeling well", value: "I'm not feeling well" },
        { label: "Book an appointment", value: "I want to book an appointment" },
        { label: "Check my coverage", value: "I want to check my insurance coverage" },
        { label: "How does it work?", value: "How does Cóndor Salud work?" },
      ],
    };
  }
  return {
    text: "¡Hola! Soy Cora, tu enfermera virtual\n\nQué bueno que me escribiste. Contame con confianza qué te está pasando — te voy a hacer algunas preguntas como haría una enfermera para entender bien tu situación y orientarte con el médico que necesitás.\n\nSi te duele algo o no te sentís bien, arrancá por ahí. Sin apuro.",
    quickReplies: [
      { label: "No me siento bien", value: "No me siento bien" },
      { label: "Necesito un turno", value: "Quiero sacar un turno" },
      { label: "Consultar mi cobertura", value: "Quiero consultar mi cobertura" },
      { label: "¿Cómo funciona esto?", value: "¿Cómo funciona Cóndor Salud?" },
    ],
  };
}

function generateFarewell(lang?: string): Partial<ChatMessage> {
  return {
    text: en(lang)
      ? "Take care! Remember: if symptoms get worse or don't improve in 24-48 hours, don't hesitate to see a doctor. I'm here 24/7 — come back anytime, even for a small question."
      : "¡Cuidate mucho! Acordate: si los síntomas empeoran o no mejoran en 24-48 horas, no dudes en consultar con un médico. Acá estoy las 24 horas, los 7 días — volvé cuando quieras, aunque sea solo para preguntarme algo chiquito.",
  };
}

function generateThanks(lang?: string): Partial<ChatMessage> {
  return {
    text: en(lang)
      ? "Happy to help! Is there anything else you'd like to ask? Don't hesitate."
      : "¡Me alegra poder ayudarte! ¿Hay algo más que te preocupe o que quieras preguntarme? No me molesta para nada.",
    quickReplies: en(lang)
      ? [
          { label: "Yes, something else", value: "I have another question" },
          { label: "No, bye!", value: "Bye, thanks" },
        ]
      : [
          { label: "Sí, otra cosa", value: "Tengo otra consulta" },
          { label: "No, chau!", value: "Chau, gracias" },
        ],
  };
}

// UM-10/UM-11: COVID/Coronavirus response
function generateCovidResponse(lang?: string): Partial<ChatMessage> {
  if (en(lang)) {
    return {
      text: "I understand your concern about COVID-19. Here are the recommended steps:\n\n1. If you have fever, cough, sore throat, or loss of smell/taste, isolate yourself and contact your doctor.\n2. You can get a rapid antigen test (at pharmacies) or a PCR test.\n3. If you have difficulty breathing, call 107 (SAME) immediately.\n\nHere's some useful info:",
      cards: [
        {
          title: "SAME (Emergency)",
          body: "If you have severe breathing difficulty, chest pain, or confusion",
          action: { label: "Call 107", url: "tel:107" },
        },
        {
          title: "COVID Hotline Argentina",
          body: "Official information from the Ministry of Health",
          action: { label: "Call 120", url: "tel:120" },
        },
        {
          title: "Pharmacy tests",
          body: "Over-the-counter antigen self-tests available at licensed pharmacies",
          action: { label: "Find pharmacy", url: "/paciente/medicamentos" },
        },
      ],
      quickReplies: [
        { label: "I have symptoms", value: "I have fever and cough" },
        { label: "Where to get tested", value: "Where can I get a COVID test" },
        { label: "Telemedicine", value: "I want a telemedicine consultation" },
      ],
    };
  }
  return {
    text: "Entiendo tu preocupación por COVID-19. Estos son los pasos recomendados:\n\n1. Si tenés fiebre, tos, dolor de garganta, o pérdida de olfato/gusto, aislate y contactá a tu médico.\n2. Podés hacerte un test rápido de antígenos (en farmacias) o un PCR.\n3. Si tenés dificultad para respirar, llamá al 107 (SAME) inmediatamente.\n\nTe dejo información útil:",
    cards: [
      {
        title: "SAME (Emergencias)",
        body: "Si tenés dificultad respiratoria severa, dolor de pecho o confusión",
        action: { label: "Llamar al 107", url: "tel:107" },
      },
      {
        title: "Línea COVID Argentina",
        body: "Información oficial del Ministerio de Salud",
        action: { label: "Llamar al 120", url: "tel:120" },
      },
      {
        title: "Test en farmacias",
        body: "Autotest de antígenos disponible sin receta en farmacias habilitadas",
        action: { label: "Buscar farmacia", url: "/paciente/medicamentos" },
      },
    ],
    quickReplies: [
      { label: "Tengo síntomas", value: "Tengo fiebre y tos" },
      { label: "Dónde hisoparte", value: "Dónde puedo hacerme un test de COVID" },
      { label: "Teleconsulta", value: "Quiero hacer una teleconsulta" },
    ],
  };
}

// ── Build triage response from TriageEntry ──────────────────
function buildTriageResponse(entry: TriageEntry, lang?: string): Partial<ChatMessage> {
  const isEnglish = en(lang);
  // Nurse-like empathetic prefix based on severity
  const empathyPrefix =
    entry.severity === "emergencia"
      ? isEnglish
        ? "I understand this can be scary, but it's important to act fast.\n\n"
        : "Entiendo que esto puede asustar, pero es importante actuar rápido.\n\n"
      : entry.severity === "serio"
        ? isEnglish
          ? "I hear you. Let's take this seriously.\n\n"
          : "Te escucho. Vamos a tomarnos esto con seriedad.\n\n"
        : isEnglish
          ? "I understand, let's see how I can help.\n\n"
          : "Te entiendo, vamos a ver cómo te ayudo.\n\n";
  let text = empathyPrefix + entry.advice;

  // OTC Medicine recommendations
  if (entry.otcMeds.length > 0) {
    text += isEnglish
      ? "\n\nOver-the-counter medications you can buy at a pharmacy:"
      : "\n\nLo que podés comprar en la farmacia sin receta:";
    for (const med of entry.otcMeds) {
      text += isEnglish
        ? `\n\n• ${med.name}\n  Dose: ${med.dose}\n  ${med.note}`
        : `\n\n• ${med.name}\n  Dosis: ${med.dose}\n  ${med.note}`;
    }
  }

  // Home remedies
  if (entry.homeRemedies) {
    text += `\n\n${entry.homeRemedies}`;
  }

  // Red flags
  text += isEnglish
    ? `\n\nWhen to see a doctor urgently:\n${entry.redFlags}`
    : `\n\nCuándo ir al médico urgente:\n${entry.redFlags}`;

  // Doctor routing
  text += isEnglish
    ? `\n\nThe right specialist for you: ${entry.doctorLabel}.`
    : `\n\nEl profesional indicado para vos: ${entry.doctorLabel}.`;

  // Nurse follow-up
  if (entry.severity !== "emergencia") {
    text += isEnglish
      ? "\n\nHow long have you been feeling this way? Is this the first time or has it happened before? That helps me guide you better."
      : "\n\n¿Hace cuánto te sentís así? ¿Es la primera vez o te pasó antes? Eso me ayuda a orientarte mejor.";
  }

  // Disclaimer
  text += isEnglish
    ? "\n\nThis is general guidance — it does not replace a medical consultation."
    : "\n\nEsto es orientación general — no reemplaza una consulta médica.";

  const quickReplies: QuickReply[] =
    entry.severity === "emergencia"
      ? isEnglish
        ? [
            { label: "Call 107 (emergency)", value: "I need the emergency number" },
            { label: "Nearest ER", value: "Where is the nearest ER?" },
          ]
        : [
            { label: "Llamar al 107 (emergencias)", value: "Necesito el número de emergencias" },
            { label: "Guardia más cercana", value: "¿Dónde queda la guardia más cercana?" },
          ]
      : isEnglish
        ? [
            {
              label: `Book ${entry.doctorType.split(" / ")[0]}`,
              value: `I want an appointment with ${entry.doctorType.split(" / ")[0]}`,
            },
            { label: "Talk to a doctor now", value: "I want a telemedicine consultation now" },
            ...(entry.otcMeds.length > 0
              ? [{ label: "Deliver to me", value: "I want home delivery of medications" }]
              : []),
            { label: "Another issue", value: "I'm not feeling well" },
          ]
        : [
            {
              label: `Turno con ${entry.doctorType.split(" / ")[0]}`,
              value: `Quiero un turno con ${entry.doctorType.split(" / ")[0]}`,
            },
            { label: "Hablar con un médico ya", value: "Quiero una teleconsulta ahora" },
            ...(entry.otcMeds.length > 0
              ? [{ label: "Que me lo traigan", value: "Quiero pedir remedios a domicilio" }]
              : []),
            { label: "Tengo otro problema", value: "No me siento bien" },
          ];

  // PS-02: Crisis hotline card for mental health intents
  const isMentalHealth =
    entry.doctorType.includes("Psicología") || entry.doctorType.includes("Psiquiatría");

  const crisisCard: InfoCard = isEnglish
    ? {
        title: "Crisis Hotline — 135",
        body: "24/7 emotional crisis support. Confidential and free.",
        icon: "phone",
        action: { label: "Call 135", url: "tel:135" },
      }
    : {
        title: "Línea de Crisis — 135",
        body: "Atención en crisis emocional las 24 horas, los 365 días. Confidencial y gratuita.",
        icon: "phone",
        action: { label: "Llamar al 135", url: "tel:135" },
      };

  const cards: InfoCard[] | undefined =
    entry.severity === "emergencia"
      ? [
          isEnglish
            ? {
                title: "Emergency — SAME",
                body: "Line 107 — 24/7 emergency medical care nationwide.",
                icon: "phone",
                action: { label: "Call 107", url: "tel:107" },
              }
            : {
                title: "Emergencias - SAME",
                body: "Línea 107 - Atención médica de emergencia 24/7 en todo el país.",
                icon: "phone",
                action: { label: "Llamar al 107", url: "tel:107" },
              },
        ]
      : isMentalHealth
        ? [
            crisisCard,
            isEnglish
              ? {
                  title: `Find a ${entry.doctorLabel}`,
                  body: "Find professionals near you with available appointments.",
                  icon: "search",
                  action: { label: "View professionals", url: "/paciente/medicos" },
                }
              : {
                  title: `Buscá un ${entry.doctorLabel}`,
                  body: "Encontrá profesionales cerca tuyo con turnos disponibles.",
                  icon: "search",
                  action: { label: "Ver profesionales", url: "/paciente/medicos" },
                },
          ]
        : [
            isEnglish
              ? {
                  title: `Find a ${entry.doctorLabel}`,
                  body: "Find professionals near you with available appointments.",
                  icon: "search",
                  action: { label: "View professionals", url: "/paciente/medicos" },
                }
              : {
                  title: `Buscá un ${entry.doctorLabel}`,
                  body: "Encontrá profesionales cerca tuyo con turnos disponibles.",
                  icon: "search",
                  action: { label: "Ver profesionales", url: "/paciente/medicos" },
                },
            ...(entry.otcMeds.length > 0
              ? (() => {
                  const medQuery = entry.otcMeds.map((m) => m.name).join(", ");
                  const firstMedName = entry.otcMeds[0]?.name ?? medQuery;
                  const rappiQ = `https://www.rappi.com.ar/farmacias?q=${encodeURIComponent(firstMedName)}`;
                  const pedidosQ = `https://www.pedidosya.com.ar/farmacias?q=${encodeURIComponent(firstMedName)}`;
                  return [
                    {
                      title: isEnglish ? `Rappi — Order ${medQuery}` : `Rappi — Pedí ${medQuery}`,
                      body: isEnglish
                        ? "Opens Rappi with your medicine pre-loaded. Delivered in 30-60 min."
                        : "Abre Rappi con tu medicamento pre-cargado. Llega en 30-60 min.",
                      icon: "truck" as const,
                      action: {
                        label: isEnglish ? "Order on Rappi" : "Pedir en Rappi",
                        url: rappiQ,
                      },
                      autoOpen: true,
                    },
                    {
                      title: isEnglish
                        ? `PedidosYa — Order ${medQuery}`
                        : `PedidosYa — Pedí ${medQuery}`,
                      body: isEnglish
                        ? "Opens PedidosYa with your medicine pre-loaded."
                        : "Abre PedidosYa con tu medicamento pre-cargado.",
                      icon: "truck" as const,
                      autoOpen: true,
                      action: {
                        label: isEnglish ? "Order on PedidosYa" : "Pedir en PedidosYa",
                        url: pedidosQ,
                      },
                    },
                  ];
                })()
              : []),
          ];

  return { text, quickReplies, cards };
}

// ── Symptom picker (body-part based, plain language) ────────
function generateSymptomPicker(lang?: string): Partial<ChatMessage> {
  if (en(lang)) {
    return {
      text: "Alright, let's figure out what's going on. Like a nurse would, I'll ask some questions to understand your situation.\n\nWhere do you feel the discomfort? Tap the closest match:",
      quickReplies: [
        { label: "Headache", value: "I have a headache" },
        { label: "Sore throat", value: "I have a sore throat" },
        { label: "Chest pain", value: "I have chest pain" },
        { label: "Stomach pain", value: "I have stomach pain" },
        { label: "Back pain", value: "I have back pain" },
        { label: "Skin issue", value: "I have a skin problem" },
        { label: "Cold or flu", value: "I have the flu" },
        { label: "Fever", value: "I have a fever" },
        { label: "Allergy", value: "I have an allergy" },
        { label: "Anxiety or stress", value: "I have anxiety" },
        { label: "For my child", value: "My child isn't feeling well" },
        { label: "Women's health", value: "Gynecology consultation" },
        { label: "Toothache", value: "I have a toothache" },
        { label: "Eyes", value: "My eyes bother me" },
        { label: "Ears", value: "My ear hurts" },
        { label: "Injury or sprain", value: "I hurt my joint" },
      ],
    };
  }
  return {
    text: "Bueno, vamos a ver qué te pasa. Como haría una enfermera, te voy a ir preguntando para entender bien.\n\n¿En qué parte del cuerpo sentís la molestia? Tocá la que más se acerque:",
    quickReplies: [
      { label: "Me duele la cabeza", value: "Me duele la cabeza" },
      { label: "Me duele la garganta", value: "Me duele la garganta" },
      { label: "Me duele el pecho", value: "Me duele el pecho" },
      { label: "Me duele la panza", value: "Me duele la panza" },
      { label: "Me duele la espalda", value: "Me duele la espalda" },
      { label: "Problemas de piel", value: "Tengo un problema de piel" },
      { label: "Gripe o resfrío", value: "Tengo gripe" },
      { label: "Fiebre", value: "Tengo fiebre" },
      { label: "Alergia", value: "Tengo alergia" },
      { label: "Ansiedad o estrés", value: "Tengo ansiedad" },
      { label: "Es para mi hijo/a", value: "Mi hijo no se siente bien" },
      { label: "Tema ginecológico", value: "Consulta ginecológica" },
      { label: "Dolor de muela", value: "Me duele una muela" },
      { label: "Ojos", value: "Me molestan los ojos" },
      { label: "Oídos", value: "Me duele el oído" },
      { label: "Golpe o torcedura", value: "Me lastimé una articulación" },
    ],
  };
}

function generateCoverageResponse(
  entities: Record<string, string>,
  lang?: string,
): Partial<ChatMessage> {
  const provider = entities.provider;

  if (provider) {
    const name = provider.charAt(0).toUpperCase() + provider.slice(1);
    if (en(lang)) {
      return {
        text: `Cóndor Salud works with ${name} and many other insurance providers. Here's what you can do right now:\n\n• Browse our provider directory to find doctors that accept your plan\n• Book appointments with covered specialists\n• Use telemedicine for video consultations\n\nWant to browse the directory?`,
        quickReplies: [
          { label: "Search directory", value: "I want to see the doctor directory" },
          { label: "View plans", value: "What plans do you have?" },
          { label: "Talk to someone", value: "I want to talk to an agent" },
        ],
      };
    }
    return {
      text: `Cóndor Salud trabaja con ${name} y muchas otras obras sociales y prepagas. Lo que podés hacer ahora:\n\n• Buscar en nuestro directorio médicos que acepten tu plan\n• Sacar turnos con especialistas cubiertos\n• Usar teleconsulta para atenderte por videollamada\n\n¿Querés buscar en el directorio?`,
      quickReplies: [
        { label: "Buscar directorio", value: "Quiero ver el directorio médico" },
        { label: "Ver planes", value: "¿Qué planes tienen?" },
        { label: "Hablar con alguien", value: "Quiero hablar con un agente" },
      ],
    };
  }

  if (en(lang)) {
    return {
      text: "We work with the largest health insurance providers in Argentina:\n\n• PAMI\n• OSDE\n• Swiss Medical\n• Galeno\n• Medifé\n• Accord Salud\n• And many more\n\nWhich one do you have?",
      quickReplies: [
        { label: "PAMI", value: "I have PAMI, what does it cover?" },
        { label: "OSDE", value: "I have OSDE, what does it cover?" },
        { label: "Swiss Medical", value: "I have Swiss Medical, what does it cover?" },
        { label: "Other", value: "I have a different insurance" },
      ],
    };
  }

  return {
    text: "Trabajamos con las obras sociales y prepagas más grandes de Argentina:\n\n• PAMI\n• OSDE\n• Swiss Medical\n• Galeno\n• Medifé\n• Accord Salud\n• Y muchas más\n\n¿Cuál tenés vos?",
    quickReplies: [
      { label: "PAMI", value: "Tengo PAMI, ¿qué me cubre?" },
      { label: "OSDE", value: "Tengo OSDE, ¿qué me cubre?" },
      { label: "Swiss Medical", value: "Tengo Swiss Medical, ¿qué me cubre?" },
      { label: "Otra", value: "Tengo otra obra social" },
    ],
  };
}

function generateAppointmentResponse(lang?: string): Partial<ChatMessage> {
  if (en(lang)) {
    return {
      text: "Let's find you an appointment. Do you know what type of doctor you need, or would you rather tell me what's going on and I'll guide you? Don't worry if you're not sure — that's what I'm here for",
      quickReplies: [
        { label: "General doctor", value: "Appointment with a general doctor" },
        { label: "Heart doctor", value: "Appointment with a cardiologist" },
        { label: "Skin doctor", value: "Appointment with a dermatologist" },
        { label: "Bone/joint doctor", value: "Appointment with an orthopedist" },
        { label: "For my child", value: "Appointment with a pediatrician" },
        { label: "Gynecologist", value: "Appointment with a gynecologist" },
        { label: "Dentist", value: "Appointment with a dentist" },
        { label: "Not sure which I need", value: "I'm not feeling well" },
      ],
    };
  }

  return {
    text: "¡Perfecto! Vamos a buscarte un turno. ¿Sabés qué tipo de médico necesitás, o preferís contarme qué te pasa y yo te oriento? No te preocupes si no sabés, para eso estoy",
    quickReplies: [
      { label: "Médico general", value: "Turno con médico clínico" },
      { label: "Del corazón", value: "Turno con cardiólogo" },
      { label: "De la piel", value: "Turno con dermatólogo" },
      { label: "De los huesos", value: "Turno con traumatólogo" },
      { label: "Para mi hijo/a", value: "Turno con pediatra" },
      { label: "Ginecólogo/a", value: "Turno con ginecóloga" },
      { label: "Dentista", value: "Turno con dentista" },
      { label: "No sé cuál necesito", value: "No me siento bien" },
    ],
  };
}

function generateAppointmentBooking(specialty: string, lang?: string): Partial<ChatMessage> {
  if (en(lang)) {
    return {
      text: `Done! You can search for ${specialty} in our provider directory. Browse professionals near you and book an appointment directly.\n\nIf you'd rather be seen right now from home, telemedicine is also available.`,
      quickReplies: [
        { label: "Search appointments", value: "I want to see the doctor directory" },
        { label: "Telemedicine now", value: "I want a telemedicine consultation now" },
        { label: "Different specialty", value: "I want to book an appointment" },
      ],
      cards: [
        {
          title: "Provider Directory",
          body: "Search by specialty, area, and insurance. Appointments available 24/7.",
          icon: "search",
          action: { label: "Search appointments", url: "/paciente/medicos" },
        },
      ],
    };
  }

  return {
    text: `¡Listo! Podés buscar ${specialty} en nuestro directorio de profesionales. Explorá profesionales cerca tuyo y sacá turno directamente.\n\nSi preferís atenderte ahora desde tu casa, también hay teleconsulta.`,
    quickReplies: [
      { label: "Buscar turnos", value: "Quiero ver el directorio médico" },
      { label: "Teleconsulta ahora", value: "Quiero una teleconsulta ahora" },
      { label: "Otra especialidad", value: "Quiero sacar un turno" },
    ],
    cards: [
      {
        title: "Directorio de Profesionales",
        body: "Buscá por especialidad, zona y obra social. Turnos disponibles las 24hs.",
        icon: "search",
        action: { label: "Buscar turnos", url: "/paciente/medicos" },
      },
    ],
  };
}

function generateMedicationResponse(lang?: string): Partial<ChatMessage> {
  if (en(lang)) {
    return {
      text: "With Cóndor Salud you can manage your medications:\n\n• Get over-the-counter meds delivered via Rappi or PedidosYa\n• Find on-duty pharmacies nearby\n• Tell me your symptoms and I'll suggest what you can buy at the pharmacy\n\nWhat do you need?",
      quickReplies: [
        { label: "What can I take?", value: "I'm not feeling well" },
        { label: "On-duty pharmacy", value: "Where is there an on-duty pharmacy?" },
        { label: "Order via Rappi", value: "I want to order meds via Rappi" },
        { label: "Order via PedidosYa", value: "I want to order meds via PedidosYa" },
        { label: "Find nearby", value: "Find a pharmacy near me" },
      ],
      cards: [
        {
          title: "Rappi — Pharmacy Delivery",
          body: "Order over-the-counter medications delivered in minutes.",
          icon: "truck",
          autoOpen: true,
          action: {
            label: "Open Rappi",
            url: "https://www.rappi.com.ar/farmacias",
          },
        },
        {
          title: "PedidosYa — Pharmacy Delivery",
          body: "Buy non-prescription meds and get them delivered home.",
          icon: "truck",
          autoOpen: true,
          action: { label: "Open PedidosYa", url: "https://www.pedidosya.com.ar/farmacias" },
        },
      ],
    };
  }

  return {
    text: "Desde Cóndor Salud podés manejar tus remedios:\n\n• Pedir medicamentos de venta libre a tu casa con Rappi o PedidosYa\n• Buscar farmacias de guardia cerca tuyo\n• Contame qué te pasa y te digo qué podés comprar en la farmacia\n\n¿Qué necesitás?",
    quickReplies: [
      { label: "¿Qué puedo tomar?", value: "No me siento bien" },
      { label: "Farmacia de guardia", value: "¿Dónde hay una farmacia de guardia?" },
      { label: "Pedir por Rappi", value: "Quiero pedir remedios por Rappi" },
      { label: "Pedir por PedidosYa", value: "Quiero pedir remedios por PedidosYa" },
      { label: "Buscar cerca", value: "Buscar farmacia cerca mío" },
    ],
    cards: [
      {
        title: "Rappi — Farmacia a domicilio",
        body: "Pedí medicamentos de venta libre y te los llevan en minutos.",
        icon: "truck",
        autoOpen: true,
        action: {
          label: "Abrir Rappi",
          url: "https://www.rappi.com.ar/farmacias",
        },
      },
      {
        title: "PedidosYa — Farmacia a domicilio",
        body: "Comprá remedios sin receta y recibilos en tu casa.",
        icon: "truck",
        autoOpen: true,
        action: { label: "Abrir PedidosYa", url: "https://www.pedidosya.com.ar/farmacias" },
      },
    ],
  };
}

// ─── Delivery (Rappi / PedidosYa) ───────────────────────────

function generateDeliveryResponse(
  coords?: { lat: number; lng: number } | null,
  lang?: string,
  /** OTC medication names from triage context for smart deep-links */
  medNames?: string[],
): Partial<ChatMessage> {
  // Smart deep-links: pre-fill search with medication name if available
  const allMeds = medNames?.length ? medNames.join(", ") : null;
  const rappiUrl = allMeds
    ? `https://www.rappi.com.ar/farmacias?q=${encodeURIComponent(allMeds)}${coords ? `&lat=${coords.lat}&lng=${coords.lng}` : ""}`
    : coords
      ? `https://www.rappi.com.ar/farmacias?lat=${coords.lat}&lng=${coords.lng}`
      : "https://www.rappi.com.ar/farmacias";
  const allMedQuery = medNames?.length ? medNames.join(", ") : null;
  const pedidosYaUrl = allMedQuery
    ? `https://www.pedidosya.com.ar/farmacias?q=${encodeURIComponent(allMedQuery)}`
    : "https://www.pedidosya.com.ar/farmacias";

  if (en(lang)) {
    let text = medNames?.length
      ? `Based on what we discussed, here are delivery options for ${medNames.join(", ")}:\n`
      : "You can order over-the-counter medications (no prescription needed) straight to your door with these apps:\n";
    text += "\nRappi — Delivered in 30–60 min. Pay by card, cash, or Mercado Pago.";
    text += "\nPedidosYa — Delivery from partner pharmacies with real-time tracking.";
    text +=
      '\n\nTip: Search by medication name (e.g., "Tafirol", "Ibupirac") in the app and compare prices across pharmacies.';

    if (!coords) {
      text += "\n\nShare your location and I'll show you the closest pharmacies with delivery.";
    }

    const cards: InfoCard[] = [
      {
        title: "Rappi — Pharmacy",
        body: "Over-the-counter meds delivered to your door in 30–60 min.",
        icon: "truck",
        autoOpen: true,
        action: { label: "Order on Rappi", url: rappiUrl },
      },
      {
        title: "PedidosYa — Pharmacy",
        body: "Nearby pharmacies with delivery. Live tracking.",
        icon: "truck",
        autoOpen: true,
        action: { label: "Order on PedidosYa", url: pedidosYaUrl },
      },
    ];

    if (coords) {
      cards.push({
        title: "Pharmacies near you",
        body: "View all nearby pharmacies on Google Maps.",
        icon: "map-pin",
        mapUrl: mapsSearchNearby(coords.lat, coords.lng, "farmacia"),
      });
    }

    return {
      text,
      cards,
      quickReplies: [
        { label: "Pharmacy nearby", value: "Pharmacy near me" },
        { label: "What can I take?", value: "I'm not feeling well" },
        { label: "Telemedicine", value: "I want a telemedicine consultation" },
      ],
    };
  }

  let text = medNames?.length
    ? `Según lo que hablamos, te muestro opciones de delivery para ${medNames.join(", ")}:\n`
    : "¡Perfecto! Podés pedir medicamentos de venta libre (sin receta) directo a tu casa con estas apps:\n";
  text += "\nRappi — Llega en 30-60 min, pagás con tarjeta, efectivo o Mercado Pago.";
  text += "\nPedidosYa — Delivery de farmacias adheridas, con seguimiento en tiempo real.";
  text +=
    '\n\nConsejo: buscá el medicamento por nombre (ej: "Tafirol", "Ibupirac") en la app y compará precios entre farmacias.';

  if (!coords) {
    text += "\n\nSi compartís tu ubicación, te muestro las farmacias con delivery más cerca tuyo.";
  }

  const cards: InfoCard[] = [
    {
      title: "Rappi — Farmacia",
      body: "Medicamentos sin receta a domicilio. Envío en 30-60 min.",
      icon: "truck",
      autoOpen: true,
      action: { label: "Pedir en Rappi", url: rappiUrl },
    },
    {
      title: "PedidosYa — Farmacia",
      body: "Farmacias cerca tuyo con delivery. Seguimiento en vivo.",
      icon: "truck",
      autoOpen: true,
      action: { label: "Pedir en PedidosYa", url: pedidosYaUrl },
    },
  ];

  // If we have coords, add a Google Maps search for pharmacies
  if (coords) {
    cards.push({
      title: "Farmacias cerca tuyo",
      body: "Ver todas las farmacias cercanas en Google Maps.",
      icon: "map-pin",
      mapUrl: mapsSearchNearby(coords.lat, coords.lng, "farmacia"),
    });
  }

  return {
    text,
    cards,
    quickReplies: [
      { label: "Farmacia cerca", value: "Farmacia cerca mío" },
      { label: "¿Qué puedo tomar?", value: "No me siento bien" },
      { label: "Teleconsulta", value: "Quiero una teleconsulta" },
    ],
  };
}

function generateTelemedicineResponse(lang?: string): Partial<ChatMessage> {
  if (en(lang)) {
    return {
      text: "With telemedicine you can talk to a doctor by video call without leaving home:\n\n• General practitioner, psychologist, nutritionist, and more\n• Digital prescription sent instantly\n• Consultation summary via WhatsApp\n• Monday to Saturday, 8 AM to 10 PM\n\nIf your insurance covers it, it can be free. Otherwise, it’s $4,500.",
      quickReplies: [
        { label: "Talk to a doctor now", value: "I want to start a telemedicine consultation now" },
        {
          label: "Schedule for another day",
          value: "I want to schedule a telemedicine consultation",
        },
        { label: "Does my insurance cover it?", value: "Does telemedicine accept my insurance?" },
      ],
      cards: [
        {
          title: "Telemedicine",
          body: "Talk to a doctor in minutes. From home.",
          icon: "video",
          action: { label: "Start telemedicine", url: "/paciente/teleconsulta" },
        },
      ],
    };
  }

  return {
    text: "Con la teleconsulta podés hablar con un médico por videollamada, sin salir de tu casa:\n\n• Médico clínico, psicólogo, nutricionista y más\n• Te dan la receta digital al toque\n• Resumen de la consulta por WhatsApp\n• De lunes a sábados de 8 a 22hs\n\nSi tu obra social lo cubre, puede ser gratis. Sino, sale $4.500.",
    quickReplies: [
      { label: "Quiero hablar con un médico ya", value: "Quiero iniciar una teleconsulta ahora" },
      { label: "Agendar para otro día", value: "Quiero agendar una teleconsulta" },
      { label: "¿Lo cubre mi obra social?", value: "¿La teleconsulta acepta mi obra social?" },
    ],
    cards: [
      {
        title: "Teleconsulta",
        body: "Hablá con un médico en minutos. Desde tu casa.",
        icon: "video",
        action: { label: "Iniciar teleconsulta", url: "/paciente/teleconsulta" },
      },
    ],
  };
}

function generatePricingResponse(lang?: string): Partial<ChatMessage> {
  if (en(lang)) {
    return {
      text: "We have 3 plans:\n\n• Essential — Free\n  Verify coverage and search for doctors\n\n• Professional — $12,900/month\n  Digital prescriptions, telemedicine, billing\n\n• Institution — $34,900/month\n  All-inclusive, multi-location, dedicated support\n\nAll plans include a 14-day free trial, no credit card required.",
      quickReplies: [
        { label: "Try for free", value: "I want to try it for free" },
        { label: "Compare plans", value: "I want to compare plans in detail" },
        { label: "Talk to someone", value: "I want to talk to someone in sales" },
      ],
      cards: [
        {
          title: "Try free for 14 days",
          body: "No credit card required. Cancel anytime.",
          icon: "star",
          action: { label: "Start for free", url: "/auth/registro" },
        },
      ],
    };
  }

  return {
    text: "Tenemos 3 planes:\n\n• Esencial — Gratis\n  Verificar cobertura y buscar médicos\n\n• Profesional — $12.900/mes\n  Recetas digitales, telemedicina, facturación\n\n• Institución — $34.900/mes\n  Todo incluido, multi-sede, soporte dedicado\n\nTodos tienen 14 días de prueba gratis, sin meter tarjeta.",
    quickReplies: [
      { label: "Probar gratis", value: "Quiero probar gratis" },
      { label: "Comparar planes", value: "Quiero comparar los planes en detalle" },
      { label: "Hablar con alguien", value: "Quiero hablar con alguien de ventas" },
    ],
    cards: [
      {
        title: "Probá gratis 14 días",
        body: "Sin tarjeta de crédito. Cancelá cuando quieras.",
        icon: "star",
        action: { label: "Empezar gratis", url: "/auth/registro" },
      },
    ],
  };
}

function generateHowItWorksResponse(lang?: string): Partial<ChatMessage> {
  if (en(lang)) {
    return {
      text: "Cóndor Salud brings all your healthcare into one place. Here’s what you can do:\n\n1. Search for doctors and book appointments online\n2. Talk to a doctor by video call (telemedicine)\n3. Check your symptoms with Cora (like right now!)\n4. Find pharmacies and emergency rooms nearby\n5. Get over-the-counter meds delivered via Rappi\n\nWorks with PAMI, OSDE, Swiss Medical, Galeno, and many more.",
      quickReplies: [
        { label: "Sign up", value: "I want to sign up" },
        { label: "How much does it cost?", value: "How much does it cost?" },
        { label: "Try the demo", value: "I want to see a demo" },
      ],
    };
  }

  return {
    text: "Cóndor Salud junta todo lo de salud en un solo lugar. Lo que podés hacer:\n\n1. Buscar médicos y sacar turno online\n2. Hablar con un médico por videollamada (teleconsulta)\n3. Chequear tus síntomas con Cora (¡como ahora!)\n4. Encontrar farmacias y guardias cerca tuyo\n5. Pedir remedios de venta libre por Rappi\n\nFunciona con PAMI, OSDE, Swiss Medical, Galeno y muchas más.",
    quickReplies: [
      { label: "Registrarme", value: "Quiero registrarme" },
      { label: "¿Cuánto sale?", value: "¿Cuánto cuesta?" },
      { label: "Probar la demo", value: "Quiero ver una demo" },
    ],
  };
}

function generateRegisterResponse(lang?: string): Partial<ChatMessage> {
  if (en(lang)) {
    return {
      text: "Signing up is free and takes 2 minutes:\n\n1. Enter your email and choose a password\n2. Fill in your details and insurance info\n3. That's it! You're ready to go\n\nNo credit card required.",
      quickReplies: [
        { label: "Let's do it, sign me up", value: "I want to sign up now" },
        { label: "I have a question", value: "I have questions before signing up" },
      ],
      cards: [
        {
          title: "Create a free account",
          body: "2 minutes. No credit card required.",
          icon: "user-plus",
          action: { label: "Sign up", url: "/auth/registro" },
        },
      ],
    };
  }

  return {
    text: "Registrarte es gratis y tarda 2 minutos:\n\n1. Poné tu email y elegí una contraseña\n2. Completá tus datos y tu obra social\n3. ¡Listo! Ya podés usar todo\n\nNo necesitás tarjeta de crédito.",
    quickReplies: [
      { label: "Dale, registrarme", value: "Quiero registrarme ahora" },
      { label: "Tengo una duda", value: "Tengo dudas antes de registrarme" },
    ],
    cards: [
      {
        title: "Crear cuenta gratis",
        body: "2 minutos. Sin tarjeta de crédito.",
        icon: "user-plus",
        action: { label: "Registrarme", url: "/auth/registro" },
      },
    ],
  };
}

function generateContactHumanResponse(lang?: string): Partial<ChatMessage> {
  if (en(lang)) {
    return {
      text: "Of course! Let me connect you with someone from our team:\n\n• WhatsApp: +54 11 5514-0371 (response in minutes)\n• Email: soporte@condorsalud.com.ar\n• Phone: 0800-333-SALUD (Mon–Fri 9 AM to 6 PM)\n\nWould you like me to transfer you to WhatsApp?",
      quickReplies: [
        { label: "Go to WhatsApp", value: "Yes, transfer me to WhatsApp" },
        { label: "I'll stay here", value: "I'd rather stay here" },
      ],
      cards: [
        {
          title: "WhatsApp — We're here to help",
          body: "Talk to a real person. Response time: 3 minutes.",
          icon: "message-circle",
          action: {
            label: "Open WhatsApp",
            url: whatsappUrl("Hola, necesito ayuda con Cóndor Salud"),
          },
        },
      ],
    };
  }

  return {
    text: "¡Claro! Te conecto con una persona de nuestro equipo:\n\n• WhatsApp: +54 11 5514-0371 (te responden en minutos)\n• Email: soporte@condorsalud.com.ar\n• Teléfono: 0800-333-SALUD (lunes a viernes 9 a 18hs)\n\n¿Querés que te pasemos a WhatsApp?",
    quickReplies: [
      { label: "Ir a WhatsApp", value: "Sí, derivame a WhatsApp" },
      { label: "Sigo por acá", value: "Prefiero seguir por acá" },
    ],
    cards: [
      {
        title: "WhatsApp - Te atendemos",
        body: "Hablá con una persona. Tiempo de respuesta: 3 minutos.",
        icon: "message-circle",
        action: {
          label: "Abrir WhatsApp",
          url: whatsappUrl("Hola, necesito ayuda con Cóndor Salud"),
        },
      },
    ],
  };
}

function generateLocationResponse(
  coords?: { lat: number; lng: number } | null,
  lang?: string,
): Partial<ChatMessage> {
  if (en(lang)) {
    if (coords) {
      return {
        text: "I've got your location! I can help you find what you need nearby:\n\n• Doctors and clinics\n• Pharmacies (including on-duty ones)\n• Emergency rooms and hospitals\n• Directions to any of them\n\nWhat are you looking for?",
        quickReplies: [
          { label: "Doctor nearby", value: "Find a doctor near me" },
          { label: "Pharmacy nearby", value: "Pharmacy near me" },
          { label: "Nearest ER", value: "Nearest emergency room" },
          { label: "Directions to...", value: "How do I get to Hospital Italiano" },
        ],
      };
    }
    return {
      text: "Cóndor Salud is 100% online — use it from wherever you are.\n\nIf you share your location, I can find doctors, pharmacies, and emergency rooms near you, and give you directions to get there.\n\nClick the location button below to enable it.",
      quickReplies: [
        { label: "Search nearby", value: "Search clinics nearby" },
        { label: "On-duty pharmacy", value: "Where is there an on-duty pharmacy?" },
      ],
    };
  }

  if (coords) {
    return {
      text: "Ya tengo tu ubicación. Puedo ayudarte a encontrar lo que necesites cerca tuyo:\n\n• Médicos y consultorios\n• Farmacias (de guardia también)\n• Guardias y hospitales\n• Cómo llegar a cualquiera de ellos\n\n¿Qué estás buscando?",
      quickReplies: [
        { label: "Médico cerca", value: "Buscar médico cerca mío" },
        { label: "Farmacia cerca", value: "Farmacia cerca mío" },
        { label: "Guardia más cercana", value: "Guardia más cercana" },
        { label: "Cómo llego a...", value: "Cómo llego al Hospital Italiano" },
      ],
    };
  }

  return {
    text: "Cóndor Salud es 100% online — lo usás desde donde estés.\n\nSi compartís tu ubicación, puedo buscarte médicos, farmacias y guardias cerca tuyo, y darte las indicaciones para llegar.\n\nHacé clic en el botón de ubicación abajo para activarlo.",
    quickReplies: [
      { label: "Buscar cerca mío", value: "Buscar consultorios cerca" },
      { label: "Farmacia de guardia", value: "¿Dónde hay una farmacia de guardia?" },
    ],
  };
}

// ─── Google Maps URL Generators ──────────────────────────────

function mapsDirectionsUrl(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  travelMode: "driving" | "walking" | "transit" = "transit",
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&travelmode=${travelMode}`;
}

function mapsPlaceUrl(lat: number, lng: number, name?: string): string {
  const q = name ? encodeURIComponent(name) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}&center=${lat},${lng}`;
}

function mapsSearchNearby(lat: number, lng: number, query: string): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${lat},${lng},15z`;
}

// ─── Nearby services data (same demo data as useNearbyServices) ──

interface NearbyServiceItem {
  name: string;
  address: string;
  lat: number;
  lng: number;
  specialty?: string;
  phone?: string;
  emergency?: boolean;
  open24h?: boolean;
  openNow?: boolean;
}

const NEARBY_DOCTORS: NearbyServiceItem[] = [
  {
    name: "Dra. Laura Méndez",
    address: "Av. Cabildo 2040, Belgrano",
    lat: -34.5605,
    lng: -58.4563,
    specialty: "Clínica Médica",
  },
  {
    name: "Dr. Carlos Ruiz",
    address: "Av. Santa Fe 3200, Palermo",
    lat: -34.5875,
    lng: -58.4096,
    specialty: "Cardiología",
  },
  {
    name: "Dra. Sofía Peralta",
    address: "Gorriti 4800, Palermo",
    lat: -34.588,
    lng: -58.428,
    specialty: "Dermatología",
  },
  {
    name: "Dra. Valentina Castro",
    address: "Av. Rivadavia 5200, Caballito",
    lat: -34.6186,
    lng: -58.4381,
    specialty: "Pediatría",
  },
];

const NEARBY_PHARMACIES: NearbyServiceItem[] = [
  {
    name: "Farmacity Belgrano",
    address: "Av. Cabildo 1900, Belgrano",
    lat: -34.561,
    lng: -58.455,
    open24h: true,
  },
  {
    name: "Farmacia del Pueblo",
    address: "Av. Corrientes 3500, Almagro",
    lat: -34.605,
    lng: -58.415,
    open24h: false,
  },
  {
    name: "Farmacia Suizo Argentina",
    address: "Av. Santa Fe 2100, Recoleta",
    lat: -34.595,
    lng: -58.396,
    open24h: true,
  },
];

const NEARBY_GUARDIAS: NearbyServiceItem[] = [
  {
    name: "Hospital Italiano",
    address: "Tte. Gral. Juan D. Perón 4190, Almagro",
    lat: -34.6047,
    lng: -58.4215,
    emergency: true,
    phone: "+541149590200",
  },
  {
    name: "Hospital Fernández",
    address: "Av. Cerviño 3356, Palermo",
    lat: -34.579,
    lng: -58.406,
    emergency: true,
    phone: "+541148082600",
  },
  {
    name: "Guardia SAME",
    address: "Av. Entre Ríos 1200, Constitución",
    lat: -34.629,
    lng: -58.387,
    emergency: true,
    phone: "107",
  },
  {
    name: "Hospital de Clínicas",
    address: "Av. Córdoba 2351, Recoleta",
    lat: -34.599,
    lng: -58.398,
    emergency: true,
    phone: "+541159508000",
  },
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sortByDistance(items: NearbyServiceItem[], lat: number, lng: number) {
  return [...items]
    .map((item) => ({
      ...item,
      distKm: Math.round(haversineKm(lat, lng, item.lat, item.lng) * 10) / 10,
    }))
    .sort((a, b) => a.distKm - b.distKm);
}

function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// ─── Geo-aware response generators ──────────────────────────

function generateNearbyDoctorResponse(
  coords?: { lat: number; lng: number } | null,
  lang?: string,
  doctorData: NearbyServiceItem[] = NEARBY_DOCTORS,
): Partial<ChatMessage> {
  if (!coords) {
    if (en(lang)) {
      return {
        text: "To find doctors near you I need your location. Click the location button below the chat to share it.",
        quickReplies: [
          { label: "Search the directory", value: "I want to see the doctor directory" },
          { label: "Telemedicine now", value: "I want a telemedicine consultation" },
        ],
      };
    }
    return {
      text: "Para buscarte médicos cerca tuyo necesito tu ubicación. Hacé clic en el botón de ubicación abajo del chat para compartirla.",
      quickReplies: [
        { label: "Buscar en el directorio", value: "Quiero ver el directorio médico" },
        { label: "Teleconsulta ahora", value: "Quiero una teleconsulta" },
      ],
    };
  }

  const sorted = sortByDistance(doctorData, coords.lat, coords.lng).slice(0, 3);

  if (en(lang)) {
    let text = "I found these providers near you:\n";
    for (const doc of sorted) {
      const status = doc.openNow === true ? " Open" : doc.openNow === false ? " Closed" : "";
      text += `\n${doc.name} — ${doc.specialty}${status}\n   ${doc.address} (${formatDist(doc.distKm)})\n`;
    }
    text += '\nTap "Get directions" on each one to see directions in Google Maps.';

    const cards: InfoCard[] = sorted.map((doc) => {
      const status =
        doc.openNow === true ? " · Open now" : doc.openNow === false ? " · Closed" : "";
      return {
        title: `${doc.name} — ${doc.specialty}`,
        body: `${doc.address} • ${formatDist(doc.distKm)} away${status}`,
        icon: "map-pin",
        action: { label: "Book appointment", url: "/paciente/medicos" },
        directionsUrl: mapsDirectionsUrl(coords.lat, coords.lng, doc.lat, doc.lng),
        mapUrl: mapsPlaceUrl(doc.lat, doc.lng, doc.name),
      };
    });

    return {
      text,
      cards,
      quickReplies: [
        { label: "See more in directory", value: "I want to see the doctor directory" },
        { label: "Telemedicine now", value: "I want a telemedicine consultation" },
        { label: "Pharmacy nearby", value: "Pharmacy near me" },
      ],
    };
  }

  let text = "Encontré estos profesionales cerca tuyo:\n";
  for (const doc of sorted) {
    const status = doc.openNow === true ? " Abierto" : doc.openNow === false ? " Cerrado" : "";
    text += `\n${doc.name} — ${doc.specialty}${status}\n   ${doc.address} (${formatDist(doc.distKm)})\n`;
  }
  text += '\nTocá "Cómo llegar" en cada uno para ver las indicaciones en Google Maps.';

  const cards: InfoCard[] = sorted.map((doc) => {
    const status =
      doc.openNow === true ? " · Abierto ahora" : doc.openNow === false ? " · Cerrado" : "";
    return {
      title: `${doc.name} — ${doc.specialty}`,
      body: `${doc.address} • a ${formatDist(doc.distKm)}${status}`,
      icon: "map-pin",
      action: { label: "Sacar turno", url: "/paciente/medicos" },
      directionsUrl: mapsDirectionsUrl(coords.lat, coords.lng, doc.lat, doc.lng),
      mapUrl: mapsPlaceUrl(doc.lat, doc.lng, doc.name),
    };
  });

  return {
    text,
    cards,
    quickReplies: [
      { label: "Ver más en directorio", value: "Quiero ver el directorio médico" },
      { label: "Teleconsulta ahora", value: "Quiero una teleconsulta" },
      { label: "Farmacia cerca", value: "Farmacia cerca mío" },
    ],
  };
}

function generateNearbyPharmacyResponse(
  coords?: { lat: number; lng: number } | null,
  lang?: string,
  pharmacyData: NearbyServiceItem[] = NEARBY_PHARMACIES,
): Partial<ChatMessage> {
  if (!coords) {
    if (en(lang)) {
      return {
        text: "To find pharmacies near you I need your location. Click the location button below the chat to share it.",
        quickReplies: [{ label: "Search on Google Maps", value: "Pharmacies on Google Maps" }],
      };
    }
    return {
      text: "Para buscarte farmacias cerca tuyo necesito tu ubicación. Hacé clic en el botón de ubicación abajo del chat para compartirla.",
      quickReplies: [{ label: "Buscar en Google Maps", value: "Farmacias en Google Maps" }],
    };
  }

  const sorted = sortByDistance(pharmacyData, coords.lat, coords.lng).slice(0, 3);

  if (en(lang)) {
    let text = "Here are the closest pharmacies:\n";
    for (const ph of sorted) {
      const tag = ph.open24h ? " (24h)" : "";
      const status = ph.openNow === true ? " Open" : ph.openNow === false ? " Closed" : "";
      text += `\n${ph.name}${tag}${status}\n   ${ph.address} (${formatDist(ph.distKm)})\n`;
    }
    text += '\nTap "Get directions" to see directions in Google Maps.';

    const cards: InfoCard[] = sorted.map((ph) => {
      const status = ph.openNow === true ? " · Open now" : ph.openNow === false ? " · Closed" : "";
      return {
        title: `${ph.name}${ph.open24h ? " — 24h" : ""}`,
        body: `${ph.address} • ${formatDist(ph.distKm)} away${status}`,
        icon: "pill",
        directionsUrl: mapsDirectionsUrl(coords.lat, coords.lng, ph.lat, ph.lng),
        mapUrl: mapsPlaceUrl(ph.lat, ph.lng, ph.name),
      };
    });

    return {
      text,
      cards,
      quickReplies: [
        { label: "View all on map", value: "Pharmacies on Google Maps" },
        { label: "Doctor nearby", value: "Find a doctor near me" },
        { label: "Nearest ER", value: "Nearest emergency room" },
      ],
    };
  }

  let text = "Estas son las farmacias más cercanas:\n";
  for (const ph of sorted) {
    const tag = ph.open24h ? " (24hs)" : "";
    const status = ph.openNow === true ? " Abierta" : ph.openNow === false ? " Cerrada" : "";
    text += `\n${ph.name}${tag}${status}\n   ${ph.address} (${formatDist(ph.distKm)})\n`;
  }
  text += '\nTocá "Cómo llegar" para ver las indicaciones en Google Maps.';

  const cards: InfoCard[] = sorted.map((ph) => {
    const status =
      ph.openNow === true ? " · Abierta ahora" : ph.openNow === false ? " · Cerrada" : "";
    return {
      title: `${ph.name}${ph.open24h ? " — 24hs" : ""}`,
      body: `${ph.address} • a ${formatDist(ph.distKm)}${status}`,
      icon: "pill",
      directionsUrl: mapsDirectionsUrl(coords.lat, coords.lng, ph.lat, ph.lng),
      mapUrl: mapsPlaceUrl(ph.lat, ph.lng, ph.name),
    };
  });

  return {
    text,
    cards,
    quickReplies: [
      { label: "Ver todas en mapa", value: "Farmacias en Google Maps" },
      { label: "Médico cerca", value: "Buscar médico cerca mío" },
      { label: "Guardia más cercana", value: "Guardia más cercana" },
    ],
  };
}

function generateNearbyGuardiaResponse(
  coords?: { lat: number; lng: number } | null,
  lang?: string,
  hospitalData: NearbyServiceItem[] = NEARBY_GUARDIAS,
): Partial<ChatMessage> {
  if (!coords) {
    if (en(lang)) {
      return {
        text: "To find the nearest emergency room I need your location. Click the location button below the chat.\n\nIf this is an emergency, call 107 (SAME) now.",
        quickReplies: [{ label: "Call 107", value: "I need the emergency number" }],
        cards: [
          {
            title: "Emergency — SAME",
            body: "Dial 107 — 24/7 emergency medical assistance",
            icon: "phone",
            action: { label: "Call 107", url: "tel:107" },
          },
        ],
      };
    }
    return {
      text: "Para encontrar la guardia más cercana necesito tu ubicación. Hacé clic en el botón de ubicación abajo del chat.\n\nSi es una emergencia, llamá al 107 (SAME) ahora.",
      quickReplies: [{ label: "Llamar al 107", value: "Necesito el número de emergencias" }],
      cards: [
        {
          title: "Emergencias — SAME",
          body: "Línea 107 — Atención médica de emergencia 24/7",
          icon: "phone",
          action: { label: "Llamar al 107", url: "tel:107" },
        },
      ],
    };
  }

  const sorted = sortByDistance(hospitalData, coords.lat, coords.lng).slice(0, 3);

  if (en(lang)) {
    let text = "Here are the nearest emergency rooms:\n";
    for (const g of sorted) {
      const status = g.openNow === true ? " Open" : g.openNow === false ? " Closed" : "";
      text += `\n${g.name}${status}\n   ${g.address} (${formatDist(g.distKm)})${g.phone ? `\n   ${g.phone}` : ""}\n`;
    }
    text += '\nTap "Get directions" to see the fastest route in Google Maps.';

    const cards: InfoCard[] = sorted.map((g) => {
      const status = g.openNow === true ? " · Open now" : g.openNow === false ? " · Closed" : "";
      return {
        title: g.name,
        body: `${g.address} • ${formatDist(g.distKm)} away${status}${g.phone ? ` • ${g.phone}` : ""}`,
        icon: "siren",
        action: g.phone ? { label: `Call`, url: `tel:${g.phone}` } : undefined,
        directionsUrl: mapsDirectionsUrl(coords.lat, coords.lng, g.lat, g.lng),
        mapUrl: mapsPlaceUrl(g.lat, g.lng, g.name),
      };
    });

    return {
      text,
      cards,
      quickReplies: [
        { label: "Call 107", value: "I need the emergency number" },
        { label: "Doctor nearby", value: "Find a doctor near me" },
      ],
    };
  }

  let text = "Estas son las guardias más cercanas:\n";
  for (const g of sorted) {
    const status = g.openNow === true ? " Abierta" : g.openNow === false ? " Cerrada" : "";
    text += `\n${g.name}${status}\n   ${g.address} (${formatDist(g.distKm)})${g.phone ? `\n   ${g.phone}` : ""}\n`;
  }
  text += '\nTocá "Cómo llegar" para ver la ruta más rápida en Google Maps.';

  const cards: InfoCard[] = sorted.map((g) => {
    const status =
      g.openNow === true ? " · Abierta ahora" : g.openNow === false ? " · Cerrada" : "";
    return {
      title: g.name,
      body: `${g.address} • a ${formatDist(g.distKm)}${status}${g.phone ? ` • ${g.phone}` : ""}`,
      icon: "siren",
      action: g.phone ? { label: `Llamar`, url: `tel:${g.phone}` } : undefined,
      directionsUrl: mapsDirectionsUrl(coords.lat, coords.lng, g.lat, g.lng),
      mapUrl: mapsPlaceUrl(g.lat, g.lng, g.name),
    };
  });

  return {
    text,
    cards,
    quickReplies: [
      { label: "Llamar al 107", value: "Necesito el número de emergencias" },
      { label: "Médico cerca", value: "Buscar médico cerca mío" },
    ],
  };
}

function generateDirectionsResponse(
  coords?: { lat: number; lng: number } | null,
  lang?: string,
  doctorData: NearbyServiceItem[] = NEARBY_DOCTORS,
  pharmacyData: NearbyServiceItem[] = NEARBY_PHARMACIES,
  hospitalData: NearbyServiceItem[] = NEARBY_GUARDIAS,
): Partial<ChatMessage> {
  if (!coords) {
    if (en(lang)) {
      return {
        text: "To give you directions I need your location. Click the location button below the chat.",
        quickReplies: [{ label: "Search on Google Maps", value: "Open Google Maps" }],
      };
    }
    return {
      text: "Para darte indicaciones de cómo llegar necesito tu ubicación. Hacé clic en el botón de ubicación abajo del chat.",
      quickReplies: [{ label: "Buscar en Google Maps", value: "Abrir Google Maps" }],
    };
  }

  // When asking for generic directions, show the top options with directions
  const allPlaces = [
    ...sortByDistance(doctorData, coords.lat, coords.lng).slice(0, 2),
    ...sortByDistance(pharmacyData, coords.lat, coords.lng).slice(0, 1),
    ...sortByDistance(hospitalData, coords.lat, coords.lng).slice(0, 1),
  ].sort((a, b) => a.distKm - b.distKm);

  if (en(lang)) {
    let text =
      "Where would you like to go? Here are the nearest healthcare locations with directions:\n";
    for (const p of allPlaces) {
      const extra = p.specialty
        ? ` (${p.specialty})`
        : p.emergency
          ? " (ER)"
          : p.open24h !== undefined
            ? " (Pharmacy)"
            : "";
      text += `\n${p.name}${extra} — ${formatDist(p.distKm)}\n`;
    }
    text += '\nEach card has a "Get directions" link that opens Google Maps with the route.';

    const cards: InfoCard[] = allPlaces.map((p) => {
      const extra = p.specialty ?? (p.emergency ? "ER" : p.open24h !== undefined ? "Pharmacy" : "");
      return {
        title: `${p.name}${extra ? ` — ${extra}` : ""}`,
        body: `${p.address} • ${formatDist(p.distKm)} away`,
        icon: "navigation",
        directionsUrl: mapsDirectionsUrl(coords.lat, coords.lng, p.lat, p.lng),
        mapUrl: mapsPlaceUrl(p.lat, p.lng, p.name),
      };
    });

    return {
      text,
      cards,
      quickReplies: [
        { label: "Open Google Maps", value: "Open Google Maps" },
        { label: "Search another place", value: "Find a doctor near me" },
      ],
    };
  }

  let text =
    "¿A dónde querés llegar? Acá te muestro los lugares de salud más cercanos con indicaciones:\n";
  for (const p of allPlaces) {
    const extra = p.specialty
      ? ` (${p.specialty})`
      : p.emergency
        ? " (Guardia)"
        : p.open24h !== undefined
          ? " (Farmacia)"
          : "";
    text += `\n${p.name}${extra} — ${formatDist(p.distKm)}\n`;
  }
  text += '\nCada tarjeta tiene el link "Cómo llegar" que te abre Google Maps con la ruta.';

  const cards: InfoCard[] = allPlaces.map((p) => {
    const extra =
      p.specialty ?? (p.emergency ? "Guardia" : p.open24h !== undefined ? "Farmacia" : "");
    return {
      title: `${p.name}${extra ? ` — ${extra}` : ""}`,
      body: `${p.address} • a ${formatDist(p.distKm)}`,
      icon: "navigation",
      directionsUrl: mapsDirectionsUrl(coords.lat, coords.lng, p.lat, p.lng),
      mapUrl: mapsPlaceUrl(p.lat, p.lng, p.name),
    };
  });

  return {
    text,
    cards,
    quickReplies: [
      { label: "Abrir Google Maps", value: "Abrir Google Maps" },
      { label: "Buscar otro lugar", value: "Buscar médico cerca mío" },
    ],
  };
}

function generateGoogleMapsSearch(
  coords?: { lat: number; lng: number } | null,
  query?: string,
): Partial<ChatMessage> {
  const searchQuery = query ?? "médicos cerca";

  if (coords) {
    const url = mapsSearchNearby(coords.lat, coords.lng, searchQuery);
    return {
      text: `Te abro Google Maps para buscar "${searchQuery}" cerca tuyo:`,
      cards: [
        {
          title: `Buscar "${searchQuery}" en Google Maps`,
          body: "Se abre en una nueva pestaña con tu ubicación.",
          icon: "map",
          action: { label: "Abrir Google Maps", url },
          mapUrl: url,
        },
      ],
      quickReplies: [
        { label: "Médico cerca", value: "Buscar médico cerca mío" },
        { label: "Farmacia cerca", value: "Farmacia cerca mío" },
        { label: "Guardia", value: "Guardia más cercana" },
      ],
    };
  }

  return {
    text: "Compartí tu ubicación para buscar en Google Maps cerca tuyo, o abrí el mapa directamente:",
    cards: [
      {
        title: "Google Maps",
        body: "Buscá profesionales de salud, farmacias y hospitales.",
        icon: "map",
        action: { label: "Abrir Google Maps", url: "https://www.google.com/maps" },
      },
    ],
  };
}

function generateSharedLocationResponse(
  coords?: { lat: number; lng: number } | null,
  lang?: string,
): Partial<ChatMessage> {
  if (en(lang)) {
    if (coords) {
      return {
        text: "Got your location! Now I can find what you need nearby and give you directions to get there.\n\nWhat are you looking for?",
        quickReplies: [
          { label: "Doctor nearby", value: "Find a doctor near me" },
          { label: "Pharmacy nearby", value: "Pharmacy near me" },
          { label: "Nearest ER", value: "Nearest emergency room" },
          { label: "Directions to...", value: "How do I get to Hospital Italiano" },
        ],
      };
    }
    return {
      text: "It looks like I haven't received your location yet. Click the button below the chat and wait a few seconds for your browser to share it.",
      quickReplies: [
        { label: "Search the directory", value: "I want to see the doctor directory" },
      ],
    };
  }

  if (coords) {
    return {
      text: "¡Perfecto, ya tengo tu ubicación! Ahora puedo buscarte lo que necesites cerca tuyo y darte indicaciones para llegar.\n\n¿Qué estás buscando?",
      quickReplies: [
        { label: "Médico cerca", value: "Buscar médico cerca mío" },
        { label: "Farmacia cerca", value: "Farmacia cerca mío" },
        { label: "Guardia más cercana", value: "Guardia más cercana" },
        { label: "Cómo llego a...", value: "Cómo llego al Hospital Italiano" },
      ],
    };
  }

  return {
    text: "Parece que todavía no recibí tu ubicación. Hacé clic en el botón abajo del chat y esperá unos segundos a que tu navegador la comparta.",
    quickReplies: [{ label: "Buscar en directorio", value: "Quiero ver el directorio médico" }],
  };
}

function generateFallback(lang?: string): Partial<ChatMessage> {
  if (en(lang)) {
    return {
      text: "Sorry, I didn't quite catch that But don't worry, I'm here to help! Could you tell me in different words what's going on or what you need? Or if you prefer, pick one of these options:",
      quickReplies: [
        { label: "I'm not feeling well", value: "I'm not feeling well" },
        { label: "I need an appointment", value: "I want to book an appointment" },
        { label: "My coverage", value: "I want to check my insurance coverage" },
        { label: "Talk to a person", value: "I want to talk to an agent" },
      ],
    };
  }

  return {
    text: "Perdón, no te entendí del todo Pero quedate tranqui que te quiero ayudar. ¿Podés contarme con otras palabras qué te pasa o qué necesitás? O si preferís, elegí una de estas opciones:",
    quickReplies: [
      { label: "No me siento bien", value: "No me siento bien" },
      { label: "Necesito un turno", value: "Quiero sacar un turno" },
      { label: "Mi cobertura", value: "Quiero consultar mi cobertura" },
      { label: "Hablar con una persona", value: "Quiero hablar con un agente" },
    ],
  };
}

// ─── Intent Detection ────────────────────────────────────────

// ─── Intent Priority ─────────────────────────────────────────
// Higher number = higher priority.  When two intents match with
// equal confidence, the one with higher priority wins.
// This ensures "hola me duele el pecho" → pain_chest (emergency)
// instead of greeting.
const INTENT_PRIORITY: Record<string, number> = {
  // Low priority — conversational
  greeting: 1,
  farewell: 1,
  thanks: 1,
  // Medium priority — service / navigation
  appointment: 5,
  coverage: 5,
  medication: 5,
  delivery: 5,
  telemedicine: 5,
  pricing: 5,
  how_it_works: 5,
  register: 5,
  contact_human: 5,
  location: 5,
  nearby_doctor: 5,
  nearby_pharmacy: 5,
  nearby_guardia: 5,
  directions: 5,
  shared_location: 5,
  // High priority — medical / triage (symptoms must never be swallowed)
  triage_generic: 8,
  pain_head: 10,
  pain_chest: 10,
  pain_belly: 10,
  pain_throat: 10,
  pain_back: 10,
  pain_joints: 10,
  skin_issue: 10,
  eye_issue: 10,
  ear_issue: 10,
  fever: 10,
  cold_flu: 10,
  allergy: 10,
  anxiety_stress: 10,
  blood_pressure: 10,
  kids: 10,
  women_health: 10,
  dental: 10,
};

function detectIntent(message: string): IntentMatch {
  const lower = message.toLowerCase().trim();
  let bestMatch: IntentMatch & { _priority: number } = {
    intent: "unknown",
    confidence: 0,
    entities: {},
    _priority: 0,
  };

  for (const { intent, patterns, entities: entityDefs } of INTENTS) {
    for (const pattern of patterns) {
      if (pattern.test(lower)) {
        const confidence = lower.length < 6 ? 0.7 : 0.9;
        const priority = INTENT_PRIORITY[intent] ?? 5;

        // Prefer higher confidence; at equal confidence prefer higher priority
        const dominated =
          confidence > bestMatch.confidence ||
          (confidence === bestMatch.confidence && priority > bestMatch._priority);

        if (dominated) {
          const entities: Record<string, string> = {};
          if (entityDefs) {
            for (const { key, pattern: ep } of entityDefs) {
              const match = lower.match(ep);
              if (match) {
                entities[key] = match[1] || match[0];
              }
            }
          }
          bestMatch = { intent, confidence, entities, _priority: priority };
        }
      }
    }
  }

  // Strip internal bookkeeping before returning
  const { _priority: _, ...result } = bestMatch;
  return result;
}

// ─── Specialty Extraction for Appointment Booking ────────────
function extractSpecialty(message: string): string | null {
  const lower = message.toLowerCase();
  const map: Record<string, string> = {
    clínic: "médico clínico",
    general: "médico clínico",
    cabecera: "médico clínico",
    cardi: "cardiólogo",
    corazón: "cardiólogo",
    dermat: "dermatólogo",
    piel: "dermatólogo",
    pediatr: "pediatra",
    niño: "pediatra",
    nene: "pediatra",
    ginec: "ginecóloga",
    mujer: "ginecóloga",
    traumat: "traumatólogo",
    hueso: "traumatólogo",
    neurol: "neurólogo",
    oftalmol: "oftalmólogo",
    ojo: "oftalmólogo",
    otorrino: "otorrinolaringólogo",
    oído: "otorrinolaringólogo",
    garganta: "otorrinolaringólogo",
    psiquiatr: "psiquiatra",
    psicol: "psicóloga",
    nutrici: "nutricionista",
    dentista: "dentista",
    odontol: "dentista",
    muela: "dentista",
    urolog: "urólogo",
    kinesi: "kinesiólogo",
    gastro: "gastroenterólogo",
    estómago: "gastroenterólogo",
    digestión: "gastroenterólogo",
  };

  for (const [key, value] of Object.entries(map)) {
    if (lower.includes(key)) return value;
  }
  return null;
}

// ─── Main Engine ─────────────────────────────────────────────

/** Optional live places data from Google Places API */
export interface LivePlaces {
  doctors?: NearbyServiceItem[];
  pharmacies?: NearbyServiceItem[];
  hospitals?: NearbyServiceItem[];
}

export function processMessage(
  userMessage: string,
  coords?: { lat: number; lng: number } | null,
  lang?: string,
  livePlaces?: LivePlaces | null,
  /** Last triage key from previous conversation turn (e.g. "pain_head") */
  lastTriageKey?: string | null,
): Partial<ChatMessage> {
  const { intent, entities } = detectIntent(userMessage);

  // Merge live places with fallback demo data
  const doctors = livePlaces?.doctors?.length ? livePlaces.doctors : NEARBY_DOCTORS;
  const pharmacies = livePlaces?.pharmacies?.length ? livePlaces.pharmacies : NEARBY_PHARMACIES;
  const hospitals = livePlaces?.hospitals?.length ? livePlaces.hospitals : NEARBY_GUARDIAS;

  // ── Conversation state machine: triage follow-up ──
  // If the previous turn was a triage and the user is answering the nurse's
  // follow-up question (duration, recurrence), refine the advice instead of
  // re-detecting a new intent.  We check that the current message doesn't
  // strongly match a *different* intent (greeting, farewell, etc.).
  if (lastTriageKey && lastTriageKey in TRIAGE && intent === "unknown") {
    const entry = TRIAGE[lastTriageKey];
    if (entry) {
      const isEn = en(lang);
      const durationMatch = userMessage.match(
        /(\d+)\s*(?:d[ií]as?|days?|horas?|hours?|semanas?|weeks?|meses?|months?)/i,
      );
      const recurrence =
        /(?:primera vez|first time|ya me pas[oó]|happened before|varias veces|several times|siempre|always)/i.test(
          userMessage,
        );

      if (durationMatch || recurrence) {
        let followUp = isEn
          ? `Thanks for telling me. Based on what you described — ${entry.doctorLabel} — here's my updated guidance:\n\n`
          : `Gracias por contarme. En base a lo que me describís — ${entry.doctorLabel} — te actualizo la orientación:\n\n`;

        if (durationMatch) {
          const num = parseInt(durationMatch[1] ?? "1");
          const isLong = num >= 3; // 3+ days/hours etc = prolonged
          followUp += isEn
            ? isLong
              ? "Since it's been going on for a while, I'd recommend seeing a doctor soon rather than waiting it out."
              : "It sounds recent — keep an eye on it and see a doctor if it doesn't improve in 24-48 hours."
            : isLong
              ? "Como ya lleva un tiempo, te recomiendo consultar con un médico pronto en vez de esperar."
              : "Parece reciente — observalo y consultá con un médico si no mejora en 24-48 horas.";
        }

        if (recurrence) {
          followUp += isEn
            ? "\nSince this has happened before, it's worth discussing the pattern with a specialist."
            : "\nComo ya te pasó antes, vale la pena conversar el patrón con un especialista.";
        }

        followUp += isEn
          ? `\n\nWant me to help you find a ${entry.doctorType.split(" / ")[0]}?`
          : `\n\n¿Querés que te ayude a encontrar un ${entry.doctorType.split(" / ")[0]}?`;

        return {
          text: followUp,
          triageContext: lastTriageKey,
          quickReplies: isEn
            ? [
                {
                  label: `Book ${entry.doctorType.split(" / ")[0]}`,
                  value: `I want an appointment with ${entry.doctorType.split(" / ")[0]}`,
                },
                { label: "Talk to a doctor now", value: "I want a telemedicine consultation now" },
                { label: "Find nearby", value: "Find a doctor near me" },
              ]
            : [
                {
                  label: `Turno con ${entry.doctorType.split(" / ")[0]}`,
                  value: `Quiero un turno con ${entry.doctorType.split(" / ")[0]}`,
                },
                { label: "Hablar con un médico ya", value: "Quiero una teleconsulta ahora" },
                { label: "Buscar cerca mío", value: "Buscar médico cerca mío" },
              ],
        };
      }
    }
  }

  // Check if it's a triage-mapped intent
  if (intent in TRIAGE && TRIAGE[intent]) {
    const triageResp = buildTriageResponse(TRIAGE[intent], lang);
    // Tag with triageContext so next turn can continue the conversation
    triageResp.triageContext = intent;
    // For emergencies, add nearest guardia with directions if we have coords
    if (TRIAGE[intent].severity === "emergencia" && coords) {
      const nearest = sortByDistance(hospitals, coords.lat, coords.lng)[0];
      if (nearest) {
        const dirUrl = mapsDirectionsUrl(coords.lat, coords.lng, nearest.lat, nearest.lng);
        triageResp.cards = [
          ...(triageResp.cards ?? []),
          {
            title: en(lang)
              ? `Nearest ER: ${nearest.name}`
              : `Guardia más cercana: ${nearest.name}`,
            body: `${nearest.address} — a ${formatDist(nearest.distKm)}`,
            icon: "siren",
            action: nearest.phone
              ? { label: en(lang) ? "Call" : "Llamar", url: `tel:${nearest.phone}` }
              : undefined,
            directionsUrl: dirUrl,
            mapUrl: mapsPlaceUrl(nearest.lat, nearest.lng, nearest.name),
          },
        ];
      }
    }
    return triageResp;
  }

  // Check for appointment with specific specialty
  if (intent === "appointment") {
    const specialty = extractSpecialty(userMessage);
    if (specialty) return generateAppointmentBooking(specialty, lang);
    return generateAppointmentResponse(lang);
  }

  switch (intent) {
    case "greeting":
      return generateGreeting(lang);
    case "farewell":
      return generateFarewell(lang);
    case "thanks":
      return generateThanks(lang);
    case "covid":
      return generateCovidResponse(lang);
    case "triage_generic":
      return generateSymptomPicker(lang);
    case "coverage":
      return generateCoverageResponse(entities, lang);
    case "medication":
      return generateMedicationResponse(lang);
    case "delivery": {
      // Smart deep-links: pass OTC med names from triage context if available
      const triageKey = lastTriageKey ?? undefined;
      const otcMeds =
        triageKey && TRIAGE[triageKey] ? TRIAGE[triageKey].otcMeds.map((m) => m.name) : undefined;
      return generateDeliveryResponse(coords, lang, otcMeds);
    }
    case "telemedicine":
      return generateTelemedicineResponse(lang);
    case "pricing":
      return generatePricingResponse(lang);
    case "how_it_works":
      return generateHowItWorksResponse(lang);
    case "register":
      return generateRegisterResponse(lang);
    case "contact_human":
      return generateContactHumanResponse(lang);
    case "location":
      return generateLocationResponse(coords, lang);
    case "nearby_doctor":
      return generateNearbyDoctorResponse(coords, lang, doctors);
    case "nearby_pharmacy":
      return generateNearbyPharmacyResponse(coords, lang, pharmacies);
    case "nearby_guardia":
      return generateNearbyGuardiaResponse(coords, lang, hospitals);
    case "directions":
      return generateDirectionsResponse(coords, lang, doctors, pharmacies, hospitals);
    case "shared_location":
      return generateSharedLocationResponse(coords, lang);
    default:
      return generateFallback(lang);
  }
}

export function getWelcomeMessage(lang?: string): ChatMessage {
  if (lang && lang.startsWith("en")) {
    return {
      id: "welcome",
      role: "bot",
      timestamp: Date.now(),
      text: "Hi! I'm Cora, your virtual nurse at Cóndor Salud\n\nI'm here to listen and help you just like a nurse would in person. Take your time and tell me what's going on — no question is too small.\n\nI can help you:\n• Understand your symptoms and find the right doctor\n• Recommend over-the-counter medicine from the pharmacy\n• Find doctors, pharmacies & ERs near you ()\n• Order meds to your door via Rappi or PedidosYa\n\nHow are you feeling today?",
      quickReplies: [
        { label: "I'm not feeling well", value: "I'm not feeling well" },
        { label: "Book an appointment", value: "I want to book an appointment" },
        { label: "Find nearby", value: "Find a doctor near me" },
        { label: "Check my coverage", value: "I want to check my insurance coverage" },
        { label: "Talk to a doctor now", value: "I want a telemedicine consultation" },
        { label: "How does it work?", value: "How does Cóndor Salud work?" },
      ],
    };
  }

  return {
    id: "welcome",
    role: "bot",
    timestamp: Date.now(),
    text: "¡Hola! Soy Cora, tu enfermera virtual de Cóndor Salud\n\nEstoy acá para escucharte y ayudarte como lo haría una enfermera en persona. Contame con tranquilidad qué te está pasando — no te apures, preguntame lo que necesites.\n\nPuedo ayudarte a:\n• Entender tus síntomas y orientarte al médico indicado\n• Recomendarte qué podés tomar de la farmacia\n• Buscar médicos, farmacias y guardias cerca tuyo ()\n• Pedir remedios a tu casa con Rappi o PedidosYa\n\n¿Cómo te sentís hoy?",
    quickReplies: [
      { label: "No me siento bien", value: "No me siento bien" },
      { label: "Necesito un turno", value: "Quiero sacar un turno" },
      { label: "Buscar cerca mío", value: "Buscar médico cerca mío" },
      { label: "Consultar cobertura", value: "Quiero consultar mi cobertura" },
      { label: "Hablar con un médico ya", value: "Quiero una teleconsulta" },
      { label: "¿Cómo funciona?", value: "¿Cómo funciona Cóndor Salud?" },
    ],
  };
}

/**
 * Detect if a message contains emergency symptoms that must NEVER
 * be delegated to AI.  Returns true if the rule-based engine should
 * handle the message directly (pain_chest / emergencia severity).
 *
 * This is the safety layer used by the chatbot API route before
 * sending messages to Claude.
 */
export function detectEmergency(message: string): boolean {
  const { intent } = detectIntent(message);
  if (intent in TRIAGE && TRIAGE[intent]?.severity === "emergencia") {
    return true;
  }
  // Also catch explicit emergency language
  const lower = message.toLowerCase();
  const emergencyPatterns = [
    // Spanish patterns
    /(?:infarto|paro\s+card[ií]aco|ataque\s+(?:al\s+)?coraz[oó]n)/,
    /(?:no\s+(?:puedo|puede)\s+respirar|se\s+(?:desmay[oó]|desplom[oó]))/,
    /(?:convulsi[oó]n|convulsiona|inconsciente|no\s+reacciona)/,
    /(?:acv|derrame\s+cerebral|no\s+(?:puede|puedo)\s+(?:hablar|mover))/,
    /(?:se\s+est[aá]\s+muriendo|se\s+muere|me\s+muero)/,
    /(?:sobredosis|intoxicaci[oó]n\s+grave|envenenamiento)/,
    // English patterns
    /(?:heart\s+attack|cardiac\s+arrest|chest\s+pain)/,
    /(?:can'?t\s+breathe|(?:not|isn'?t|can'?t)\s+breathing|passed?\s+out|fainted)/,
    /(?:seizure|convulsion|unconscious|not\s+responding|unresponsive)/,
    /(?:stroke|can'?t\s+(?:speak|move|feel))/,
    /(?:(?:he|she|they|i)'?(?:s|m|re)\s+dying|going\s+to\s+die)/,
    /(?:overdose|severe\s+poisoning|anaphyla)/,
  ];
  return emergencyPatterns.some((p) => p.test(lower));
}
