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

// ─── Types ───────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: number;
  quickReplies?: QuickReply[];
  cards?: InfoCard[];
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
      /^(bye|gracia[s]?\s*$)/i,
    ],
  },
  {
    intent: "thanks",
    patterns: [/^(gracias|muchas\s+gracias|genial|perfecto|excelente|buenísimo)/i],
  },
  // ── Body-part / symptom intents (plain language) ──────────
  {
    intent: "pain_head",
    patterns: [
      /(?:dolor|me\s+duele)\s+(?:la\s+)?cabeza/i,
      /(?:jaqueca|migraña|puntada.+cabeza)/i,
      /cabeza.+(?:duele|dolor|explota|molest|pesa)/i,
    ],
  },
  {
    intent: "pain_chest",
    patterns: [
      /(?:dolor|me\s+duele|presión|aprieta|oprime)\s+(?:el\s+)?(?:pecho|torax|tórax)/i,
      /pecho.+(?:duele|dolor|aprieta|presión)/i,
      /(?:me\s+cuesta\s+respirar|no\s+puedo\s+respirar|falta\s+(?:de\s+)?aire)/i,
    ],
  },
  {
    intent: "pain_belly",
    patterns: [
      /(?:dolor|me\s+duele)\s+(?:la\s+)?(?:panza|barriga|estómago|est[oó]mago|abdomen|tripa)/i,
      /(?:panza|barriga|estómago|est[oó]mago).+(?:duele|dolor|hinch|inflam)/i,
      /(?:acidez|reflujo|gastritis|n[aá]usea|v[oó]mito|vomit)/i,
      /(?:diarrea|estre[nñ]imiento|no\s+puedo\s+ir\s+al\s+baño|indigesti)/i,
    ],
  },
  {
    intent: "pain_throat",
    patterns: [
      /(?:dolor|me\s+duele)\s+(?:la\s+)?garganta/i,
      /garganta.+(?:duele|dolor|irrit|rasp|inflam)/i,
      /(?:angina|no\s+puedo\s+tragar|tragar.+duele)/i,
    ],
  },
  {
    intent: "pain_back",
    patterns: [
      /(?:dolor|me\s+duele)\s+(?:la\s+)?(?:espalda|cintura|columna|lumbares?)/i,
      /(?:espalda|cintura|columna).+(?:duele|dolor|trabar?|contractur)/i,
      /(?:ciática|ci[aá]tica|lumbago|contractura)/i,
    ],
  },
  {
    intent: "pain_joints",
    patterns: [
      /(?:dolor|me\s+duele)\s+(?:la\s+|el\s+)?(?:rodilla|tobillo|muñeca|codo|hombro|cadera)/i,
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
      /(?:d[oó]nde\s+(?:est[aá]n?|queda)|direcci[oó]n|ubicaci[oó]n|sucursal)/i,
      /(?:mapa|zona|barrio|localidad|provincia)/i,
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

// ─── Response Generators ─────────────────────────────────────

function generateGreeting(): Partial<ChatMessage> {
  return {
    text: "¡Hola! Soy Cora, tu asistente de salud de Cóndor Salud.\n\nContame qué te está pasando y te voy a orientar con el médico que necesitás y qué podés tomar de la farmacia para sentirte mejor mientras tanto.\n\nTambién puedo ayudarte con turnos, cobertura y teleconsultas.",
    quickReplies: [
      { label: "No me siento bien", value: "No me siento bien" },
      { label: "Necesito un turno", value: "Quiero sacar un turno" },
      { label: "Consultar mi cobertura", value: "Quiero consultar mi cobertura" },
      { label: "¿Cómo funciona esto?", value: "¿Cómo funciona Cóndor Salud?" },
    ],
  };
}

function generateFarewell(): Partial<ChatMessage> {
  return {
    text: "¡Cuidate mucho! Acordate: si los síntomas empeoran o no mejoran, consultá con un médico. Acá estoy siempre que me necesites.",
  };
}

function generateThanks(): Partial<ChatMessage> {
  return {
    text: "¡De nada! Espero que te sirva. ¿Necesitás algo más?",
    quickReplies: [
      { label: "Sí, otra cosa", value: "Tengo otra consulta" },
      { label: "No, chau!", value: "Chau, gracias" },
    ],
  };
}

// ── Build triage response from TriageEntry ──────────────────
function buildTriageResponse(entry: TriageEntry): Partial<ChatMessage> {
  let text = entry.advice;

  // OTC Medicine recommendations
  if (entry.otcMeds.length > 0) {
    text += "\n\nLo que podés comprar en la farmacia sin receta:";
    for (const med of entry.otcMeds) {
      text += `\n\n• ${med.name}\n  Dosis: ${med.dose}\n  ${med.note}`;
    }
  }

  // Home remedies
  if (entry.homeRemedies) {
    text += `\n\n${entry.homeRemedies}`;
  }

  // Red flags
  text += `\n\nCuándo ir al médico urgente:\n${entry.redFlags}`;

  // Doctor routing
  text += `\n\nEl profesional indicado para vos: ${entry.doctorLabel}.`;

  // Disclaimer
  text += "\n\nEsto es orientación general — no reemplaza una consulta médica.";

  const quickReplies: QuickReply[] =
    entry.severity === "emergencia"
      ? [
          { label: "Llamar al 107 (emergencias)", value: "Necesito el número de emergencias" },
          { label: "Guardia más cercana", value: "¿Dónde queda la guardia más cercana?" },
        ]
      : [
          {
            label: `Turno con ${entry.doctorType.split(" / ")[0]}`,
            value: `Quiero un turno con ${entry.doctorType.split(" / ")[0]}`,
          },
          { label: "Hablar con un médico ya", value: "Quiero una teleconsulta ahora" },
          { label: "Tengo otro problema", value: "No me siento bien" },
        ];

  const cards: InfoCard[] | undefined =
    entry.severity === "emergencia"
      ? [
          {
            title: "Emergencias - SAME",
            body: "Línea 107 - Atención médica de emergencia 24/7 en todo el país.",
            icon: "phone",
            action: { label: "Llamar al 107", url: "tel:107" },
          },
        ]
      : [
          {
            title: `Buscá un ${entry.doctorLabel}`,
            body: "Encontrá profesionales cerca tuyo con turnos disponibles.",
            icon: "search",
            action: { label: "Ver profesionales", url: "/dashboard/directorio" },
          },
        ];

  return { text, quickReplies, cards };
}

// ── Symptom picker (body-part based, plain language) ────────
function generateSymptomPicker(): Partial<ChatMessage> {
  return {
    text: "Dale, contame: ¿qué te está molestando? Elegí la zona del cuerpo o el tipo de problema y te oriento:",
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

function generateCoverageResponse(entities: Record<string, string>): Partial<ChatMessage> {
  const provider = entities.provider;

  if (provider) {
    const name = provider.charAt(0).toUpperCase() + provider.slice(1);
    return {
      text: `Cóndor Salud trabaja con ${name} y muchas otras obras sociales y prepagas. Desde tu cuenta podés:\n\n• Ver qué te cubre tu plan\n• Saber cuánto te sale el coseguro\n• Pedir autorizaciones para estudios\n• Ver qué remedios te cubre\n\n¿Querés verificar tu cobertura?`,
      quickReplies: [
        { label: "Verificar cobertura", value: "Quiero verificar mi cobertura" },
        { label: "Ver planes", value: "¿Qué planes tienen?" },
        { label: "Hablar con alguien", value: "Quiero hablar con un agente" },
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

function generateAppointmentResponse(): Partial<ChatMessage> {
  return {
    text: "¡Dale! ¿Qué tipo de médico necesitás? Si no estás seguro/a, contame qué te pasa y te digo a cuál ir.",
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

function generateAppointmentBooking(specialty: string): Partial<ChatMessage> {
  return {
    text: `¡Listo! Podés buscar turnos con ${specialty} en nuestro directorio. Vas a ver profesionales cerca tuyo con horarios disponibles, opiniones de otros pacientes y si aceptan tu obra social.\n\nSi preferís atenderte ahora desde tu casa, también hay teleconsulta.`,
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
        action: { label: "Buscar turnos", url: "/dashboard/directorio" },
      },
    ],
  };
}

function generateMedicationResponse(): Partial<ChatMessage> {
  return {
    text: "Desde Cóndor Salud podés manejar todo lo de tus remedios:\n\n• Buscar precios actualizados de medicamentos\n• Ver tus recetas vigentes\n• Pedir que te los lleven a tu casa\n• Configurar pedidos automáticos para los que tomás siempre\n• Buscar farmacias de guardia cerca\n\n¿Qué necesitás?",
    quickReplies: [
      { label: "Buscar un remedio", value: "Quiero buscar un medicamento" },
      { label: "Mis recetas", value: "Quiero ver mis recetas" },
      { label: "Farmacia de guardia", value: "¿Dónde hay una farmacia de guardia?" },
      { label: "Que me lo traigan", value: "Quiero un pedido a domicilio" },
    ],
  };
}

function generateTelemedicineResponse(): Partial<ChatMessage> {
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
        action: { label: "Iniciar teleconsulta", url: "/dashboard/telemedicina" },
      },
    ],
  };
}

function generatePricingResponse(): Partial<ChatMessage> {
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

function generateHowItWorksResponse(): Partial<ChatMessage> {
  return {
    text: "Cóndor Salud junta todo lo de salud en un solo lugar. Lo que podés hacer:\n\n1. Ver qué te cubre tu obra social al instante\n2. Buscar médicos y sacar turno online\n3. Hablar con un médico por videollamada\n4. Manejar tus recetas y pedir remedios\n5. Chequear tus síntomas (como ahora)\n6. Recibir recordatorios por WhatsApp\n\nFunciona con PAMI, OSDE, Swiss Medical, Galeno y muchas más.",
    quickReplies: [
      { label: "Registrarme", value: "Quiero registrarme" },
      { label: "¿Cuánto sale?", value: "¿Cuánto cuesta?" },
      { label: "Probar la demo", value: "Quiero ver una demo" },
    ],
  };
}

function generateRegisterResponse(): Partial<ChatMessage> {
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

function generateContactHumanResponse(): Partial<ChatMessage> {
  return {
    text: "¡Claro! Te conecto con una persona de nuestro equipo:\n\n• WhatsApp: +54 9 11 1234-5678 (te responden en minutos)\n• Email: soporte@condorsalud.com.ar\n• Teléfono: 0800-333-SALUD (lunes a viernes 9 a 18hs)\n\n¿Querés que te pasemos a WhatsApp?",
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
          url: "https://wa.me/5491112345678?text=Hola%2C%20necesito%20ayuda%20con%20C%C3%B3ndor%20Salud",
        },
      },
    ],
  };
}

function generateLocationResponse(): Partial<ChatMessage> {
  return {
    text: "Cóndor Salud es 100% online — lo usás desde donde estés.\n\nSi necesitás ir a un consultorio, desde nuestro Directorio podés buscar médicos, clínicas y farmacias cerca tuyo.",
    quickReplies: [
      { label: "Buscar cerca mío", value: "Buscar consultorios cerca" },
      { label: "Farmacia de guardia", value: "¿Dónde hay una farmacia de guardia?" },
    ],
  };
}

function generateFallback(): Partial<ChatMessage> {
  return {
    text: "Perdón, no entendí bien. ¿Podrías decirme con otras palabras? O elegí una de estas opciones:",
    quickReplies: [
      { label: "No me siento bien", value: "No me siento bien" },
      { label: "Necesito un turno", value: "Quiero sacar un turno" },
      { label: "Mi cobertura", value: "Quiero consultar mi cobertura" },
      { label: "Hablar con una persona", value: "Quiero hablar con un agente" },
    ],
  };
}

// ─── Intent Detection ────────────────────────────────────────

function detectIntent(message: string): IntentMatch {
  const lower = message.toLowerCase().trim();
  let bestMatch: IntentMatch = { intent: "unknown", confidence: 0, entities: {} };

  for (const { intent, patterns, entities: entityDefs } of INTENTS) {
    for (const pattern of patterns) {
      if (pattern.test(lower)) {
        const confidence = lower.length < 6 ? 0.7 : 0.9;
        if (confidence > bestMatch.confidence) {
          const entities: Record<string, string> = {};
          if (entityDefs) {
            for (const { key, pattern: ep } of entityDefs) {
              const match = lower.match(ep);
              if (match) {
                entities[key] = match[1] || match[0];
              }
            }
          }
          bestMatch = { intent, confidence, entities };
        }
      }
    }
  }

  return bestMatch;
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

export function processMessage(userMessage: string): Partial<ChatMessage> {
  const { intent, entities } = detectIntent(userMessage);

  // Check if it's a triage-mapped intent
  if (intent in TRIAGE) {
    return buildTriageResponse(TRIAGE[intent]);
  }

  // Check for appointment with specific specialty
  if (intent === "appointment") {
    const specialty = extractSpecialty(userMessage);
    if (specialty) return generateAppointmentBooking(specialty);
    return generateAppointmentResponse();
  }

  switch (intent) {
    case "greeting":
      return generateGreeting();
    case "farewell":
      return generateFarewell();
    case "thanks":
      return generateThanks();
    case "triage_generic":
      return generateSymptomPicker();
    case "coverage":
      return generateCoverageResponse(entities);
    case "medication":
      return generateMedicationResponse();
    case "telemedicine":
      return generateTelemedicineResponse();
    case "pricing":
      return generatePricingResponse();
    case "how_it_works":
      return generateHowItWorksResponse();
    case "register":
      return generateRegisterResponse();
    case "contact_human":
      return generateContactHumanResponse();
    case "location":
      return generateLocationResponse();
    default:
      return generateFallback();
  }
}

export function getWelcomeMessage(): ChatMessage {
  return {
    id: "welcome",
    role: "bot",
    timestamp: Date.now(),
    text: "¡Hola! Soy Cora, tu asistente de salud.\n\nContame qué te pasa y te digo qué médico necesitás y qué podés comprar en la farmacia para sentirte mejor.\n\n¿En qué te puedo ayudar?",
    quickReplies: [
      { label: "No me siento bien", value: "No me siento bien" },
      { label: "Necesito un turno", value: "Quiero sacar un turno" },
      { label: "Consultar cobertura", value: "Quiero consultar mi cobertura" },
      { label: "Hablar con un médico ya", value: "Quiero una teleconsulta" },
      { label: "¿Cómo funciona?", value: "¿Cómo funciona Cóndor Salud?" },
    ],
  };
}
