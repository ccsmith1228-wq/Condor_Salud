"use client";

import { QRCodeSVG } from "qrcode.react";
import { Crown, Star, Shield, Smartphone } from "lucide-react";

/* ── Plan-specific theming ───────────────────────────────── */
type PlanTheme = { gradient: string; accent: string; badge: string; icon: typeof Star };

const PLAN_THEMES = {
  basico: {
    gradient: "from-[#4A7FAF] via-[#5A94CF] to-[#75AADB]",
    accent: "text-white/90",
    badge: "bg-white/20 text-white",
    icon: Star,
  },
  plus: {
    gradient: "from-[#B8860B] via-[#E5A60D] to-[#F6B40E]",
    accent: "text-white",
    badge: "bg-white/25 text-white",
    icon: Crown,
  },
  familiar: {
    gradient: "from-[#1C344D] via-[#2B4D6E] to-[#3A6690]",
    accent: "text-celeste-light",
    badge: "bg-white/15 text-white",
    icon: Shield,
  },
} satisfies Record<string, PlanTheme>;

const DEFAULT_THEME: PlanTheme = PLAN_THEMES.basico;

interface ClubMemberCardProps {
  memberId: string;
  memberName: string;
  planSlug: string;
  planName: string;
  startedAt: string;
  expiresAt?: string;
  /** If true, renders a slightly smaller card for mobile */
  compact?: boolean;
}

export default function ClubMemberCard({
  memberId,
  memberName,
  planSlug,
  planName,
  startedAt,
  expiresAt,
  compact = false,
}: ClubMemberCardProps) {
  const theme: PlanTheme =
    (PLAN_THEMES as Record<string, PlanTheme | undefined>)[planSlug] ?? DEFAULT_THEME;
  const Icon = theme.icon;

  const verifyUrl = `https://condorsalud.com/club/verify/${memberId}`;
  const validThrough = expiresAt
    ? new Date(expiresAt).toLocaleDateString("es-AR", { month: "2-digit", year: "2-digit" })
    : "—";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} shadow-xl ${
        compact ? "p-4" : "p-6"
      } text-white select-none`}
      style={{ aspectRatio: compact ? undefined : "1.6 / 1", maxWidth: compact ? "100%" : 420 }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle condor wing shapes */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-black/10 rounded-full blur-3xl" />
        {/* Diagonal stripe accent */}
        <div
          className="absolute top-0 right-0 w-full h-full opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 20px, white 20px, white 21px)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Top row: brand + plan badge */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-[2.5px] uppercase text-white/70">
                CÓNDOR
              </span>
              <span className="text-[10px] font-bold tracking-[2.5px] uppercase text-white">
                SALUD
              </span>
            </div>
            <p className="text-[9px] tracking-wider text-white/50 mt-0.5">CLUB SALUD</p>
          </div>
          <div
            className={`flex items-center gap-1.5 ${theme.badge} px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase`}
          >
            <Icon className="w-3 h-3" />
            {planName}
          </div>
        </div>

        {/* Middle row: Member info + QR */}
        <div className={`flex items-end justify-between ${compact ? "mt-4" : "mt-auto"}`}>
          <div className="space-y-1.5 flex-1 min-w-0">
            <p
              className={`font-display font-bold truncate ${compact ? "text-lg" : "text-xl"} text-white leading-tight`}
            >
              {memberName || "Miembro"}
            </p>
            <p
              className={`font-mono font-semibold tracking-widest ${compact ? "text-sm" : "text-base"} ${theme.accent}`}
            >
              {memberId}
            </p>
          </div>

          {/* QR code */}
          <div className="bg-white rounded-lg p-1.5 ml-3 shrink-0">
            <QRCodeSVG
              value={verifyUrl}
              size={compact ? 52 : 68}
              bgColor="#FFFFFF"
              fgColor="#1A1A1A"
              level="M"
            />
          </div>
        </div>

        {/* Bottom row: dates */}
        <div
          className={`flex items-center gap-4 ${compact ? "mt-3" : "mt-3"} text-[10px] text-white/60`}
        >
          <div>
            <span className="block uppercase tracking-wider text-[8px] text-white/40">
              Miembro desde
            </span>
            <span className="font-medium text-white/80">
              {new Date(startedAt).toLocaleDateString("es-AR", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div>
            <span className="block uppercase tracking-wider text-[8px] text-white/40">
              Válida hasta
            </span>
            <span className="font-medium text-white/80">{validThrough}</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-white/40">
            <Smartphone className="w-3 h-3" />
            <span className="text-[8px] uppercase tracking-wider">Digital</span>
          </div>
        </div>
      </div>
    </div>
  );
}
