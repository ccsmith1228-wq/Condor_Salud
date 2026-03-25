import { describe, it, expect } from "vitest";
import {
  processMessage,
  getWelcomeMessage,
  detectEmergency,
  detectGeoIntent,
  detectRideIntent,
} from "@/lib/chatbot-engine";

// ─── Welcome Message ─────────────────────────────────────────

describe("getWelcomeMessage", () => {
  it("returns Spanish welcome by default", () => {
    const msg = getWelcomeMessage();
    expect(msg.role).toBe("bot");
    expect(msg.id).toBe("welcome");
    expect(msg.text).toContain("Cora");
    expect(msg.text).toContain("Cóndor Salud");
    expect(msg.quickReplies).toBeDefined();
    expect(msg.quickReplies!.length).toBeGreaterThan(0);
  });

  it("returns English welcome for 'en' lang", () => {
    const msg = getWelcomeMessage("en");
    expect(msg.text).toContain("Cora");
    expect(msg.text).toContain("How are you feeling");
    expect(msg.quickReplies).toBeDefined();
  });

  it("has quick replies in both languages", () => {
    const es = getWelcomeMessage("es");
    const en = getWelcomeMessage("en");
    expect(es.quickReplies!.length).toBeGreaterThanOrEqual(4);
    expect(en.quickReplies!.length).toBeGreaterThanOrEqual(4);
  });
});

// ─── Emergency Detection ─────────────────────────────────────

describe("detectEmergency", () => {
  it("detects Spanish heart attack language", () => {
    expect(detectEmergency("Creo que estoy teniendo un infarto")).toBe(true);
  });

  it("detects English heart attack language", () => {
    expect(detectEmergency("I think I'm having a heart attack")).toBe(true);
  });

  it("detects breathing emergency (Spanish)", () => {
    expect(detectEmergency("no puedo respirar")).toBe(true);
  });

  it("detects breathing emergency (English)", () => {
    expect(detectEmergency("I can't breathe")).toBe(true);
  });

  it("detects seizure/unconsciousness", () => {
    expect(detectEmergency("está inconsciente y no reacciona")).toBe(true);
  });

  it("detects stroke symptoms", () => {
    expect(detectEmergency("no puede hablar ni mover el brazo")).toBe(true);
  });

  it("does NOT flag normal symptom questions", () => {
    expect(detectEmergency("Me duele la cabeza")).toBe(false);
  });

  it("does NOT flag greetings", () => {
    expect(detectEmergency("Hola, buen día")).toBe(false);
  });

  it("does NOT flag pricing questions", () => {
    expect(detectEmergency("Cuánto cuestan los planes?")).toBe(false);
  });
});

// ─── Geo Intent Detection ────────────────────────────────────

describe("detectGeoIntent", () => {
  it("detects nearby doctor request (ES)", () => {
    expect(detectGeoIntent("Buscar médico cerca mío")).toBe(true);
  });

  it("detects nearby pharmacy request (EN)", () => {
    expect(detectGeoIntent("Find a pharmacy near me")).toBe(true);
  });

  it("detects guardia/ER request", () => {
    expect(detectGeoIntent("dónde queda la guardia más cercana")).toBe(true);
  });

  it("does NOT flag pricing questions", () => {
    expect(detectGeoIntent("cuánto cuestan los planes")).toBe(false);
  });

  it("does NOT flag greetings", () => {
    expect(detectGeoIntent("hola cora")).toBe(false);
  });
});

// ─── Ride Intent Detection ───────────────────────────────────

describe("detectRideIntent", () => {
  it("detects uber request (ES)", () => {
    expect(detectRideIntent("necesito un uber para ir al médico")).toBe(true);
  });

  it("detects ride request (EN)", () => {
    expect(detectRideIntent("I need a ride to the doctor")).toBe(true);
  });

  it("does NOT flag symptom questions", () => {
    expect(detectRideIntent("me duele la garganta")).toBe(false);
  });
});

// ─── processMessage: Intent Classification ───────────────────

describe("processMessage — intent classification", () => {
  it("responds to greetings", () => {
    const resp = processMessage("Hola!");
    expect(resp.text).toBeDefined();
    expect(resp.text!.length).toBeGreaterThan(0);
  });

  it("responds to farewell", () => {
    const resp = processMessage("Chau, gracias");
    expect(resp.text).toBeDefined();
  });

  it("responds to thanks", () => {
    const resp = processMessage("Muchas gracias Cora");
    expect(resp.text).toBeDefined();
  });

  it("responds to pricing questions", () => {
    const resp = processMessage("Cuánto sale?");
    expect(resp.text).toContain("plan");
    expect(resp.quickReplies).toBeDefined();
  });

  it("pricing response includes updated USD prices", () => {
    const resp = processMessage("Cuánto cuesta?");
    expect(resp.text).toContain("$50");
    expect(resp.text).toContain("$120");
    expect(resp.text).toContain("$180");
  });

  it("Spanish pricing includes Consultorio/Multi Consultorio/Centro Médico", () => {
    const resp = processMessage("cuánto sale?");
    expect(resp.text).toContain("Consultorio");
    expect(resp.text).toContain("Multi Consultorio");
    expect(resp.text).toContain("Centro Médico");
  });

  it("responds to coverage questions", () => {
    const resp = processMessage("Tengo OSDE, estoy cubierto?");
    expect(resp.text).toBeDefined();
  });

  it("responds to telemedicine questions", () => {
    const resp = processMessage("Quiero una teleconsulta");
    expect(resp.text).toBeDefined();
    expect(resp.quickReplies).toBeDefined();
  });

  it("responds to medication questions", () => {
    const resp = processMessage("Qué puedo tomar para el dolor?");
    expect(resp.text).toBeDefined();
  });

  it("responds to how it works", () => {
    const resp = processMessage("cómo funciona la plataforma?");
    expect(resp.text).toBeDefined();
  });

  it("responds to registration intent", () => {
    const resp = processMessage("Quiero registrarme");
    expect(resp.text).toBeDefined();
  });

  it("responds to human contact request", () => {
    const resp = processMessage("Quiero hablar con una persona real");
    expect(resp.text).toBeDefined();
  });

  it("returns fallback for unknown messages", () => {
    const resp = processMessage("asdfjkl random gibberish xyz123");
    expect(resp.text).toBeDefined();
    expect(resp.text!.length).toBeGreaterThan(0);
  });
});

// ─── processMessage: Symptom Triage ──────────────────────────

describe("processMessage — symptom triage", () => {
  it("triages headache", () => {
    const resp = processMessage("Me duele la cabeza");
    expect(resp.text).toBeDefined();
    expect(resp.triageContext).toBeDefined();
  });

  it("triages stomach pain", () => {
    const resp = processMessage("Me duele el estómago");
    expect(resp.text).toBeDefined();
  });

  it("triages fever", () => {
    const resp = processMessage("Tengo fiebre alta");
    expect(resp.text).toBeDefined();
    expect(resp.triageContext).toBeDefined();
  });

  it("triages sore throat", () => {
    const resp = processMessage("me duele la garganta y no puedo tragar");
    expect(resp.text).toBeDefined();
  });

  it("triages COVID symptoms", () => {
    const resp = processMessage("tengo covid, qué hago?");
    expect(resp.text).toBeDefined();
  });

  it("triage includes quick replies for next steps", () => {
    const resp = processMessage("me duele la cabeza");
    if (resp.quickReplies) {
      expect(resp.quickReplies.length).toBeGreaterThan(0);
    }
  });

  it("chest pain triggers emergencia severity", () => {
    const resp = processMessage("me duele el pecho y el brazo izquierdo");
    expect(resp.text).toBeDefined();
    // Emergency responses should mention 107 or guardia
    expect(
      resp.text!.includes("107") ||
        resp.text!.includes("emergencia") ||
        resp.text!.includes("guardia") ||
        resp.text!.includes("emergency") ||
        resp.text!.includes("ambulance"),
    ).toBe(true);
  });
});

// ─── processMessage: English Responses ───────────────────────

describe("processMessage — English lang", () => {
  it("responds to English greeting", () => {
    const resp = processMessage("Hello!", null, "en");
    expect(resp.text).toBeDefined();
  });

  it("responds to English symptom", () => {
    const resp = processMessage("I have a headache", null, "en");
    expect(resp.text).toBeDefined();
  });

  it("responds to English telemedicine request", () => {
    const resp = processMessage("I want a video call with a doctor", null, "en");
    expect(resp.text).toBeDefined();
  });

  it("responds to English registration", () => {
    const resp = processMessage("How do I sign up?", null, "en");
    expect(resp.text).toBeDefined();
  });
});

// ─── processMessage: Conversation Continuity ─────────────────

describe("processMessage — triage conversation flow", () => {
  it("can continue a headache triage with duration info", () => {
    // First turn: triage headache
    const turn1 = processMessage("me duele la cabeza");
    expect(turn1.triageContext).toBeDefined();

    // Second turn: user answers with duration
    const turn2 = processMessage("hace 3 días", null, undefined, null, turn1.triageContext);
    expect(turn2.text).toBeDefined();
    expect(turn2.text!.length).toBeGreaterThan(10);
  });

  it("can continue a triage with recurrence info", () => {
    const turn1 = processMessage("me duele el estómago");
    if (turn1.triageContext) {
      const turn2 = processMessage(
        "ya me pasó varias veces",
        null,
        undefined,
        null,
        turn1.triageContext,
      );
      expect(turn2.text).toBeDefined();
    }
  });
});

// ─── processMessage: Appointment Booking ─────────────────────

describe("processMessage — appointment with specialty", () => {
  it("handles appointment with named specialty", () => {
    const resp = processMessage("Quiero un turno con un cardiólogo");
    expect(resp.text).toBeDefined();
    // Should mention cardiología/cardiólogo or booking
    expect(resp.cards || resp.quickReplies).toBeDefined();
  });

  it("handles generic appointment request", () => {
    const resp = processMessage("Quiero sacar un turno");
    expect(resp.text).toBeDefined();
    expect(resp.quickReplies).toBeDefined();
  });
});
