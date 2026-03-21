"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import type { ChatMessage, QuickReply, InfoCard, RideOptionCard } from "@/lib/chatbot-engine";
import { getWelcomeMessage } from "@/lib/chatbot-engine";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { useLocale } from "@/lib/i18n/context";
import { analytics } from "@/lib/analytics";
import RideQuickLinks from "@/components/RideQuickLinks";

// Web Speech API type shim (webkit-prefixed)
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((ev: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

// ─── Subcomponents ───────────────────────────────────────────

function TypingIndicator({ isEn }: { isEn: boolean }) {
  return (
    <div
      className="flex items-end gap-2 animate-chatMsg"
      role="status"
      aria-label={isEn ? "Cora is typing" : "Cora está escribiendo"}
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
      <div className="flex flex-col max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-line ${
            isBot ? "bg-surface text-ink rounded-bl-md" : "bg-celeste text-white rounded-br-md"
          }`}
        >
          {msg.text}
        </div>
        {isBot && msg.source === "ai" && (
          <span
            className="mt-0.5 ml-1 text-[10px] text-ink-muted/60 select-none"
            aria-label="Powered by AI"
          >
            ✨ AI
          </span>
        )}
      </div>
    </div>
  );
}

function CardList({ cards }: { cards: InfoCard[] }) {
  const { t } = useLocale();
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
                {t("chat.directions")}
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
                {t("chat.viewMap")}
              </a>
            )}
          </div>
          {card.rideAddress && (
            <div className="mt-1.5 pt-1.5 border-t border-border-light/60">
              <RideQuickLinks
                name={card.title}
                address={card.rideAddress}
                lat={card.rideLat}
                lng={card.rideLng}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const RIDE_APP_COLORS: Record<string, string> = {
  uber: "bg-black text-white hover:bg-gray-800",
  cabify: "bg-violet-600 text-white hover:bg-violet-500",
  indrive: "bg-[#CCFF00] text-black hover:bg-[#d4ff33]",
};

const RIDE_APP_ICONS: Record<string, string> = {
  uber: "U",
  cabify: "C",
  indrive: "iD",
};

function RideCards({ options }: { options: RideOptionCard[] }) {
  return (
    <div className="pl-9 animate-chatMsg">
      <div className="border border-border rounded-xl overflow-hidden bg-white">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface/60 border-b border-border">
          <span className="text-[12px] font-semibold text-ink">Transporte disponible</span>
        </div>
        <div className="divide-y divide-border-light">
          {options.map((opt) => (
            <a
              key={opt.app}
              href={opt.webLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface/50 transition text-left"
              style={{ borderLeftWidth: 3, borderLeftColor: opt.color }}
            >
              {/* Logo badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${RIDE_APP_COLORS[opt.logo] || "bg-ink-100 text-ink"}`}
              >
                <span className="text-[11px] font-bold">
                  {RIDE_APP_ICONS[opt.logo] || opt.app[0]}
                </span>
              </div>
              {/* Name + note */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-ink">{opt.app}</p>
                {opt.note && <p className="text-[11px] text-ink-muted truncate">{opt.note}</p>}
              </div>
              {/* Arrow */}
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 text-ink-200 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickReplies({
  replies,
  onSelect,
  isEn,
}: {
  replies: QuickReply[];
  onSelect: (v: string) => void;
  isEn: boolean;
}) {
  return (
    <div
      className="pl-9 flex flex-wrap gap-1.5 animate-chatMsg"
      role="group"
      aria-label={isEn ? "Quick replies" : "Respuestas rápidas"}
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
  const { locale, isEn } = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // UM-08: Restore from sessionStorage if available
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      try {
        const saved = sessionStorage.getItem("condor_chat_messages");
        if (saved) return JSON.parse(saved) as ChatMessage[];
      } catch {
        /* ignore */
      }
    }
    return [getWelcomeMessage(locale)];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice input — Web Speech API
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggleVoice = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    if (!speechSupported) return;
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = locale === "en" ? "en-US" : "es-AR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript;
      if (transcript) setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    analytics.track("chatbot_voice_input", { lang: locale });
  }, [isListening, speechSupported, locale]);

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

  // Auto-open delivery deep-links when a card has autoOpen flag
  const autoOpenedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "bot" || !lastMsg.cards) return;
    for (const card of lastMsg.cards) {
      if (card.autoOpen && card.action?.url) {
        const key = `${lastMsg.id}-${card.action.url}`;
        if (!autoOpenedRef.current.has(key)) {
          autoOpenedRef.current.add(key);
          // Small delay so user sees the card first
          setTimeout(() => {
            window.open(card.action!.url, "_blank", "noopener,noreferrer");
          }, 600);
        }
      }
    }
  }, [messages]);

  // UM-08: Save messages to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem("condor_chat_messages", JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  // Reset conversation when locale changes
  useEffect(() => {
    setMessages([getWelcomeMessage(locale)]);
    sessionStorage.removeItem("condor_chat_messages");
  }, [locale]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Auto-show new message indicator after 3s if chat is closed and never opened this session
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
      return sessionStorage.getItem("condor_chat_opened") === "1";
    }
    return false;
  });
  useEffect(() => {
    if (!isOpen && !bannerDismissed) {
      const timer = setTimeout(() => setHasNewMessage(true), 3000);
      return () => clearTimeout(timer);
    }
    if (isOpen && !bannerDismissed) {
      setBannerDismissed(true);
      try {
        sessionStorage.setItem("condor_chat_opened", "1");
      } catch {
        /* ignore */
      }
    }
    setHasNewMessage(false);
  }, [isOpen, bannerDismissed]);

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
      analytics.track("chatbot_message_sent", { lang: locale });

      try {
        // Build conversation history for Claude AI context
        const history = messages
          .filter((m) => m.role === "user" || m.role === "bot")
          .slice(-10)
          .map((m) => ({
            role: (m.role === "bot" ? "assistant" : "user") as "user" | "assistant",
            content: m.text,
          }));

        // Extract last triage context from the most recent bot message
        const lastBotMsg = [...messages].reverse().find((m) => m.role === "bot");
        const triageContext = lastBotMsg?.triageContext;

        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            history,
            lang: locale,
            ...(triageContext ? { triageContext } : {}),
            ...(coordsRef.current
              ? { lat: coordsRef.current.latitude, lng: coordsRef.current.longitude }
              : {}),
          }),
        });

        if (!res.ok) {
          // Parse error body — may have ChatMessage shape (500) or plain error (400/429)
          const errorBody = await res.json().catch(() => null);
          const errorMsg: ChatMessage = {
            id: errorBody?.id ?? `bot-err-${Date.now()}`,
            role: "bot",
            timestamp: errorBody?.timestamp ?? Date.now(),
            text:
              errorBody?.text ??
              (isEn
                ? "Sorry, something went wrong. Could you try again in a moment?"
                : "Disculpá, ocurrió un error. ¿Podés intentar de nuevo en un momento?"),
            quickReplies:
              errorBody?.quickReplies ??
              (isEn
                ? [
                    { label: "Try again", value: "Hello" },
                    { label: "Talk to someone", value: "I want to speak with an agent" },
                  ]
                : [
                    { label: "Reintentar", value: "Hola" },
                    { label: "Hablar con alguien", value: "Quiero hablar con un agente" },
                  ]),
          };
          setMessages((prev) => [...prev, errorMsg]);
          return;
        }

        const botMsg: ChatMessage = await res.json();
        setMessages((prev) => [...prev, botMsg]);
        analytics.track("chatbot_response", {
          source: botMsg.source ?? "unknown",
          has_cards: !!(botMsg.cards && botMsg.cards.length > 0),
          lang: locale,
        });
        if ("isEmergency" in botMsg) {
          analytics.track("chatbot_emergency", { lang: locale });
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-err-${Date.now()}`,
            role: "bot",
            text: isEn
              ? "Sorry, something went wrong. Could you try again?"
              : "Disculpá, ocurrió un error. ¿Podrías intentar de nuevo?",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, messages, isEn, locale],
  );

  // Track last bot context for the geolocation effect (avoid stale closure)
  const lastBotContextRef = useRef<string | undefined>();
  useEffect(() => {
    const lastBot = [...messages].reverse().find((m) => m.role === "bot");
    lastBotContextRef.current = lastBot?.triageContext;
  }, [messages]);

  // When geolocation resolves after user requested it, send confirmation to Cora
  useEffect(() => {
    if (!locationRequested) return;
    if (geo.coords && !isTyping) {
      setLocationRequested(false);
      // If the user was asking about rides before sharing location,
      // send a transport message so Cora returns ride cards immediately
      const wasRideRequest = lastBotContextRef.current === "ride_transport";
      if (wasRideRequest) {
        sendMessage(isEn ? "I need a ride to the doctor" : "Necesito transporte al médico");
      } else {
        sendMessage(isEn ? "I shared my location" : "Compartí mi ubicación");
      }
    } else if (geo.error && !geo.loading) {
      setLocationRequested(false);
      // Show the geolocation error as a bot message so the user knows what went wrong
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-geo-err-${Date.now()}`,
          role: "bot" as const,
          timestamp: Date.now(),
          text: geo.error!,
          quickReplies: isEn
            ? [
                { label: "Try again", value: "I want to share my location" },
                { label: "Search directory", value: "I want to see the doctor directory" },
              ]
            : [
                { label: "Reintentar", value: "Quiero compartir mi ubicación" },
                { label: "Buscar en directorio", value: "Quiero ver el directorio médico" },
              ],
        },
      ]);
    }
  }, [locationRequested, geo.coords, geo.error, geo.loading, isTyping, isEn, sendMessage]);

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
          aria-label={
            isEn
              ? "Chat with Cora, Cóndor Salud virtual assistant"
              : "Chat con Cora, asistente virtual de Cóndor Salud"
          }
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
                <p className="text-white/70 text-[11px]">
                  {isEn ? "Cóndor Salud virtual assistant" : "Asistente virtual de Cóndor Salud"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {hasLocation && (
                <span className="text-white/60 text-[10px] mr-1" title="Ubicación compartida">
                  loc
                </span>
              )}
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/60 text-[10px]">Online</span>
              {/* U-04: Reset conversation button */}
              <button
                type="button"
                onClick={() => {
                  setMessages([getWelcomeMessage(locale)]);
                  setInput("");
                  sessionStorage.removeItem("condor_chat_messages");
                }}
                className="ml-2 p-1 text-white/50 hover:text-white transition rounded"
                aria-label={isEn ? "Clear conversation" : "Limpiar conversación"}
                title={isEn ? "Clear conversation" : "Limpiar conversación"}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-label={isEn ? "Message history" : "Historial de mensajes"}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin"
          >
            {messages.map((msg) => (
              <div key={msg.id}>
                <MessageBubble msg={msg} />
                {msg.cards && <CardList cards={msg.cards} />}
                {msg.rideOptions && msg.rideOptions.length > 0 && (
                  <RideCards options={msg.rideOptions} />
                )}
                {/* Show quick replies only for the last bot message */}
                {msg.role === "bot" &&
                  msg.quickReplies &&
                  msg.id === lastBotMessage?.id &&
                  !isTyping && (
                    <QuickReplies
                      replies={msg.quickReplies}
                      onSelect={handleQuickReply}
                      isEn={isEn}
                    />
                  )}
              </div>
            ))}
            {isTyping && <TypingIndicator isEn={isEn} />}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            aria-label={isEn ? "Send message to Cora" : "Enviar mensaje a Cora"}
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
              title={
                hasLocation
                  ? isEn
                    ? "Location shared"
                    : "Ubicación compartida"
                  : isEn
                    ? "Share my location"
                    : "Compartir mi ubicación"
              }
              className={`w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0 ${
                hasLocation
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : geo.loading
                    ? "bg-amber-50 text-amber-500 border border-amber-200 animate-pulse"
                    : "bg-surface text-ink-muted border border-border hover:bg-celeste-pale hover:text-celeste-dark"
              }`}
              aria-label={
                hasLocation
                  ? isEn
                    ? "Location shared"
                    : "Ubicación compartida"
                  : isEn
                    ? "Share my location"
                    : "Compartir mi ubicación"
              }
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
            {/* Mic button — Web Speech API */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleVoice}
                disabled={isTyping}
                title={
                  isListening
                    ? isEn
                      ? "Stop listening"
                      : "Dejar de escuchar"
                    : isEn
                      ? "Voice input"
                      : "Entrada por voz"
                }
                className={`w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0 ${
                  isListening
                    ? "bg-red-50 text-red-500 border border-red-300 animate-pulse"
                    : "bg-surface text-ink-muted border border-border hover:bg-celeste-pale hover:text-celeste-dark"
                }`}
                aria-label={
                  isListening
                    ? isEn
                      ? "Stop listening"
                      : "Dejar de escuchar"
                    : isEn
                      ? "Voice input"
                      : "Entrada por voz"
                }
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
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            )}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isEn ? "Type your question..." : "Escribí tu consulta..."}
              maxLength={2000}
              aria-label={
                isEn
                  ? "Type your question for the virtual assistant"
                  : "Escribí tu consulta al asistente virtual"
              }
              className="flex-1 text-[13px] bg-surface rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-celeste/30 border border-border placeholder:text-ink-muted"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-full bg-celeste-dark hover:bg-celeste text-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              aria-label={isEn ? "Send message" : "Enviar mensaje"}
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
              {isEn
                ? "Cora is a virtual assistant. It does not replace professional medical diagnosis."
                : "Cora es una asistente virtual. No reemplaza el diagnóstico médico profesional."}
            </p>
          </div>
        </div>
      )}

      {/* ── Floating Bubble ─────────────────────────────────── */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setHasNewMessage(false);
          if (!bannerDismissed) {
            setBannerDismissed(true);
            try {
              sessionStorage.setItem("condor_chat_opened", "1");
            } catch {
              /* ignore */
            }
          }
        }}
        className={`fixed bottom-6 right-6 z-[96] w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ${
          isOpen
            ? "bg-ink-700 hover:bg-ink-600 rotate-0"
            : "bg-celeste-dark hover:bg-celeste hover:scale-105"
        }`}
        aria-expanded={isOpen ? "true" : "false"}
        aria-haspopup="dialog"
        aria-label={
          isOpen
            ? isEn
              ? "Close chat"
              : "Cerrar chat"
            : isEn
              ? "Open virtual assistant"
              : "Abrir asistente virtual"
        }
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
          onClick={() => {
            setIsOpen(true);
            setHasNewMessage(false);
            if (!bannerDismissed) {
              setBannerDismissed(true);
              try {
                sessionStorage.setItem("condor_chat_opened", "1");
              } catch {
                /* ignore */
              }
            }
          }}
          className="fixed bottom-[84px] right-6 z-[96] bg-white border border-border rounded-xl shadow-lg px-4 py-2.5 max-w-[220px] cursor-pointer hover:shadow-xl transition animate-chatMsg"
        >
          <p className="text-[12px] text-ink font-medium">
            {isEn
              ? "Need help? Chat with Cora, your health assistant."
              : "¿Necesitás ayuda? Chateá con Cora, tu asistente de salud."}
          </p>
          <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white border-r border-b border-border rotate-45" />
        </div>
      )}
    </>
  );
}
