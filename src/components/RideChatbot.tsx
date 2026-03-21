/**
 * RideChatbot — Web component (ported from React Native)
 *
 * AI-powered chatbot that helps patients with ride logistics,
 * appointment questions, and general health queries.
 *
 * Uses /api/chat (Claude AI) + /api/rides/options for transport.
 */

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, Send, Loader2, X, MapPin } from "lucide-react";
import type { RideOption } from "@/hooks/useRideOptions";

// ─── Types ───────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  rideCard?: RideCardPayload | null;
  timestamp: Date;
}

interface RideCardPayload {
  doctorName: string;
  address: string;
  options: RideOption[];
  fareEstimate: {
    display?: string | null;
    duration?: number | null;
    surge?: number | null;
  } | null;
}

interface Props {
  preloadContext?: {
    doctorName: string;
    address: string;
    destLat?: number;
    destLng?: number;
    specialty?: string;
    bookingDate?: string;
    bookingTime?: string;
  };
  onClose?: () => void;
}

const APP_COLORS: Record<string, string> = {
  uber: "bg-black text-white",
  cabify: "bg-violet-600 text-white",
  indrive: "bg-[#CCFF00] text-black",
};

const QUICK_REPLIES = [
  "¿Cómo llego al consultorio?",
  "Pedir un Uber",
  "Pedir un Cabify",
  "¿Cuánto cuesta el viaje?",
  "¿Cuándo es mi turno?",
];

// ─── Component ───────────────────────────────────────────────

export default function RideChatbot({ preloadContext, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Seed with greeting on mount
  useEffect(() => {
    const greeting: Message = {
      id: "0",
      role: "assistant",
      text: preloadContext
        ? `Hola, tu turno con **${preloadContext.doctorName}** es el ${preloadContext.bookingDate || "—"} a las ${preloadContext.bookingTime || "—"}. ¿Necesitás ayuda para llegar al consultorio?`
        : "¡Hola! Soy el asistente de Cóndor Salud. Puedo ayudarte a pedir un Uber o Cabify al consultorio. ¿En qué puedo ayudarte?",
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, [preloadContext]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // ── Fetch ride options ──────────────────────────────────────

  const fetchRideOptions = useCallback(
    async (ctx: NonNullable<Props["preloadContext"]>): Promise<RideCardPayload> => {
      const params = new URLSearchParams({
        doctorName: ctx.doctorName,
        address: ctx.address,
        ...(ctx.destLat && { destLat: String(ctx.destLat) }),
        ...(ctx.destLng && { destLng: String(ctx.destLng) }),
        ...(ctx.specialty && { specialty: ctx.specialty }),
        ...(ctx.bookingDate && { bookingDate: ctx.bookingDate }),
        ...(ctx.bookingTime && { bookingTime: ctx.bookingTime }),
      });

      const res = await fetch(`/api/rides/options?${params}`);
      const data = await res.json();

      return {
        doctorName: ctx.doctorName,
        address: ctx.address,
        options: data.options || [],
        fareEstimate: data.fareEstimate || null,
      };
    },
    [],
  );

  // ── Send to AI backend ─────────────────────────────────────

  const sendToAI = useCallback(
    async (text: string, ctx?: Props["preloadContext"]): Promise<string> => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: ctx
            ? {
                doctorName: ctx.doctorName,
                specialty: ctx.specialty,
                bookingDate: ctx.bookingDate,
                bookingTime: ctx.bookingTime,
                address: ctx.address,
              }
            : undefined,
        }),
      });

      if (!res.ok) throw new Error("Chat error");
      const data = await res.json();
      return data.reply || "No pude procesar tu consulta. ¿Podés reformularla?";
    },
    [],
  );

  // ── Send message ───────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      scrollToBottom();

      try {
        const isRideRequest =
          /uber|cabify|indrive|taxi|viaje|llego|llegar|transporte|cómo voy/i.test(text);

        if (isRideRequest && preloadContext) {
          const opts = await fetchRideOptions(preloadContext);
          const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            text: `Perfecto, preparé las opciones de transporte hasta ${preloadContext.doctorName}. La dirección ya está precargada en cada app:`,
            rideCard: opts,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          const reply = await sendToAI(text, preloadContext);
          const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            text: reply,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
      } catch {
        const errMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "Lo siento, hubo un error. Por favor intentá de nuevo.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    },
    [preloadContext, fetchRideOptions, sendToAI],
  );

  const openRide = (option: RideOption) => {
    window.open(option.webLink || option.smartLink, "_blank", "noopener");
  };

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-surface rounded-2xl border border-border-light overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-border-light">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-celeste-dark flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Asistente de transporte</p>
            <p className="text-[11px] text-ink-muted">Cóndor Salud</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink transition"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-celeste-dark flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[9px] font-bold text-white">CS</span>
              </div>
            )}
            <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "items-end" : ""}`}>
              <div
                className={`rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-celeste-dark text-white rounded-br-sm"
                    : "bg-white border border-border-light text-ink rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>

              {/* Inline ride options card */}
              {msg.rideCard && (
                <div className="bg-white rounded-xl border border-border-light overflow-hidden">
                  {/* Fare estimate */}
                  {msg.rideCard.fareEstimate?.display && (
                    <div className="px-3 py-2 bg-success-50">
                      <p className="text-xs font-medium text-success-700">
                        Uber: {msg.rideCard.fareEstimate.display}
                        {msg.rideCard.fareEstimate.duration
                          ? `  ·  ~${Math.round(msg.rideCard.fareEstimate.duration / 60)} min`
                          : ""}
                      </p>
                    </div>
                  )}

                  {/* Address */}
                  <div className="px-3 py-2 flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-ink-muted mt-0.5 shrink-0" />
                    <p className="text-[11px] text-ink-muted line-clamp-2">
                      {msg.rideCard.address}
                    </p>
                  </div>

                  {/* Ride buttons */}
                  <div className="flex flex-wrap gap-2 px-3 pb-3">
                    {msg.rideCard.options
                      .filter((o) => o.available)
                      .map((option) => (
                        <button
                          key={option.app}
                          onClick={() => openRide(option)}
                          className={`text-xs font-semibold px-4 py-1.5 rounded-full hover:opacity-80 transition ${
                            APP_COLORS[option.logo] || "bg-ink-100 text-ink"
                          }`}
                        >
                          {option.app}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-celeste-dark flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-white">CS</span>
            </div>
            <div className="bg-white border border-border-light rounded-2xl rounded-bl-sm px-3 py-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-celeste-dark" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick reply chips */}
      {messages.length <= 2 && !loading && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => sendMessage(reply)}
              className="text-xs bg-white border border-border-light rounded-full px-3 py-1.5 text-ink-500 hover:border-celeste-200 hover:text-celeste-dark transition"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-2 px-4 py-3 bg-white border-t border-border-light">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder="Escribí tu consulta..."
          disabled={loading}
          className="flex-1 text-sm bg-surface rounded-full px-4 py-2.5 border border-border-light focus:outline-none focus:ring-2 focus:ring-celeste-200 focus:border-celeste-dark disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-full bg-celeste-dark text-white flex items-center justify-center shrink-0 transition hover:bg-celeste-700 disabled:opacity-40"
          aria-label="Enviar"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
