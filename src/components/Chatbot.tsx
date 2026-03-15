"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import type { ChatMessage, QuickReply, InfoCard } from "@/lib/chatbot-engine";
import { getWelcomeMessage } from "@/lib/chatbot-engine";
import { useGeolocation } from "@/lib/hooks/useGeolocation";

// ─── Subcomponents ───────────────────────────────────────────

function TypingIndicator() {
  return (
    <div
      className="flex items-end gap-2 animate-chatMsg"
      role="status"
      aria-label="Cora está escribiendo"
    >
      <div className="w-7 h-7 rounded-full bg-celeste flex items-center justify-center flex-shrink-0">
        <Image
          src="/condor.png"
          alt=""
          width={18}
          height={18}
          className="w-[18px] h-[18px] object-contain"
        />
      </div>
      <div className="bg-surface rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-ink-300 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-ink-300 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-ink-300 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isBot = msg.role === "bot";

  return (
    <div className={`flex items-end gap-2 animate-chatMsg ${isBot ? "" : "flex-row-reverse"}`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-celeste flex items-center justify-center flex-shrink-0">
          <Image
            src="/condor.png"
            alt=""
            width={18}
            height={18}
            className="w-[18px] h-[18px] object-contain"
          />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-line ${
          isBot ? "bg-surface text-ink rounded-bl-md" : "bg-celeste text-white rounded-br-md"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

function CardList({ cards }: { cards: InfoCard[] }) {
  return (
    <div className="pl-9 flex flex-col gap-2 animate-chatMsg">
      {cards.map((card, i) => (
        <div key={i} className="border border-border rounded-xl p-3 bg-white">
          <p className="text-[13px] font-semibold text-ink">{card.title}</p>
          <p className="text-[12px] text-ink-light mt-0.5">{card.body}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {card.action && (
              <a
                href={card.action.url}
                target={card.action.url.startsWith("http") ? "_blank" : undefined}
                rel={card.action.url.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-block text-[12px] font-semibold text-celeste-dark hover:text-celeste transition"
              >
                {card.action.label} &rarr;
              </a>
            )}
            {card.directionsUrl && (
              <a
                href={card.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600 hover:text-emerald-500 transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                Cómo llegar
              </a>
            )}
            {card.mapUrl && (
              <a
                href={card.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-500 transition"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Ver en mapa
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickReplies({
  replies,
  onSelect,
}: {
  replies: QuickReply[];
  onSelect: (value: string) => void;
}) {
  return (
    <div
      className="pl-9 flex flex-wrap gap-1.5 animate-chatMsg"
      role="group"
      aria-label="Respuestas rápidas"
    >
      {replies.map((r, i) => (
        <button
          key={i}
          onClick={() => onSelect(r.value)}
          className="text-[12px] font-medium text-celeste-dark bg-celeste-pale hover:bg-celeste-100 border border-celeste-200 px-3 py-1.5 rounded-full transition whitespace-nowrap"
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([getWelcomeMessage()]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Geolocation — lazy mode (user triggers it)
  const geo = useGeolocation({ lazy: true });
  const hasLocation = !!geo.coords;
  const [locationRequested, setLocationRequested] = useState(false);
  const coordsRef = useRef(geo.coords);
  coordsRef.current = geo.coords;

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Auto-show new message indicator after 3s if chat is closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setHasNewMessage(true), 3000);
      return () => clearTimeout(timer);
    }
    setHasNewMessage(false);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            ...(coordsRef.current
              ? { lat: coordsRef.current.latitude, lng: coordsRef.current.longitude }
              : {}),
          }),
        });

        const botMsg: ChatMessage = await res.json();
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-err-${Date.now()}`,
            role: "bot",
            text: "Disculpá, ocurrió un error. ¿Podrías intentar de nuevo?",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping],
  );

  // When geolocation resolves after user requested it, send confirmation to Cora
  useEffect(() => {
    if (!locationRequested) return;
    if (geo.coords && !isTyping) {
      setLocationRequested(false);
      sendMessage("Compartí mi ubicación");
    } else if (geo.error && !geo.loading) {
      setLocationRequested(false);
    }
  }, [locationRequested, geo.coords, geo.error, geo.loading, isTyping, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (value: string) => {
    sendMessage(value);
  };

  // Find the last bot message with quick replies
  const lastBotIdx = [...messages].reverse().findIndex((m) => m.role === "bot");
  const lastBotMessage = lastBotIdx >= 0 ? messages[messages.length - 1 - lastBotIdx] : null;

  return (
    <>
      {/* ── Chat Window ─────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat con Cora, asistente virtual de Cóndor Salud"
          aria-modal="false"
          className="fixed bottom-24 right-6 z-[95] w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-border flex flex-col animate-chatOpen overflow-hidden"
          style={{ height: "min(580px, calc(100vh - 140px))" }}
        >
          {/* Header */}
          <div className="bg-celeste-dark px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Image
                  src="/condor.png"
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <p className="text-white font-semibold text-[14px] leading-tight">Cora</p>
                <p className="text-white/70 text-[11px]">Asistente virtual de Cóndor Salud</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {hasLocation && (
                <span className="text-white/60 text-[10px] mr-1" title="Ubicación compartida">
                  📍
                </span>
              )}
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/60 text-[10px]">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-label="Historial de mensajes"
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin"
          >
            {messages.map((msg) => (
              <div key={msg.id}>
                <MessageBubble msg={msg} />
                {msg.cards && <CardList cards={msg.cards} />}
                {/* Show quick replies only for the last bot message */}
                {msg.role === "bot" &&
                  msg.quickReplies &&
                  msg.id === lastBotMessage?.id &&
                  !isTyping && (
                    <QuickReplies replies={msg.quickReplies} onSelect={handleQuickReply} />
                  )}
              </div>
            ))}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            aria-label="Enviar mensaje a Cora"
            className="border-t border-border px-4 py-3 flex gap-2 flex-shrink-0 bg-white"
          >
            {/* Location share button */}
            <button
              type="button"
              onClick={() => {
                if (!hasLocation) {
                  geo.refresh();
                  setLocationRequested(true);
                }
              }}
              disabled={geo.loading}
              title={hasLocation ? "Ubicación compartida" : "Compartir mi ubicación"}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0 ${
                hasLocation
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : geo.loading
                    ? "bg-amber-50 text-amber-500 border border-amber-200 animate-pulse"
                    : "bg-surface text-ink-muted border border-border hover:bg-celeste-pale hover:text-celeste-dark"
              }`}
              aria-label={hasLocation ? "Ubicación compartida" : "Compartir mi ubicación"}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-[18px] h-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu consulta..."
              aria-label="Escribí tu consulta al asistente virtual"
              className="flex-1 text-[13px] bg-surface rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-celeste/30 border border-border placeholder:text-ink-muted"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-full bg-celeste-dark hover:bg-celeste text-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Enviar mensaje"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-[18px] h-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>

          {/* Footer disclaimer */}
          <div className="px-4 pb-2 flex-shrink-0">
            <p className="text-[10px] text-ink-muted text-center leading-tight">
              Cora es una asistente virtual. No reemplaza el diagnóstico médico profesional.
            </p>
          </div>
        </div>
      )}

      {/* ── Floating Bubble ─────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[96] w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ${
          isOpen
            ? "bg-ink-700 hover:bg-ink-600 rotate-0"
            : "bg-celeste-dark hover:bg-celeste hover:scale-105"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={isOpen ? "Cerrar chat" : "Abrir asistente virtual"}
      >
        {isOpen ? (
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}

        {/* Notification dot */}
        {!isOpen && hasNewMessage && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* ── New message tooltip ─────────────────────────────── */}
      {!isOpen && hasNewMessage && (
        <div
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[84px] right-6 z-[96] bg-white border border-border rounded-xl shadow-lg px-4 py-2.5 max-w-[220px] cursor-pointer hover:shadow-xl transition animate-chatMsg"
        >
          <p className="text-[12px] text-ink font-medium">
            ¿Necesitás ayuda? Chateá con Cora, tu asistente de salud.
          </p>
          <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white border-r border-b border-border rotate-45" />
        </div>
      )}
    </>
  );
}
