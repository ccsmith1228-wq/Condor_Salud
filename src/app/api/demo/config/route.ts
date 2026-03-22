import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  getDemoConfig,
  saveDemoConfig,
  resetDemoConfig,
  DEMO_DEFAULTS,
} from "@/lib/services/demo-config";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// ── Auth helper ──────────────────────────────────────────────
function verifyDemoAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { role?: string };
    return payload.role === "demo_admin";
  } catch {
    return false;
  }
}

/**
 * GET /api/demo/config
 * Public — returns current demo config for the app to read.
 */
export async function GET() {
  try {
    const config = await getDemoConfig();
    return NextResponse.json(config, {
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    });
  } catch {
    return NextResponse.json(DEMO_DEFAULTS);
  }
}

/**
 * POST /api/demo/config
 * Save new demo config. Requires demo admin JWT.
 */
export async function POST(req: NextRequest) {
  if (!verifyDemoAdmin(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const config = await saveDemoConfig(body as Record<string, unknown>);
    return NextResponse.json({ success: true, config });
  } catch {
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}

/**
 * DELETE /api/demo/config
 * Reset demo config to defaults. Requires demo admin JWT.
 */
export async function DELETE(req: NextRequest) {
  if (!verifyDemoAdmin(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const config = await resetDemoConfig();
    return NextResponse.json({ success: true, message: "Config reset to defaults", config });
  } catch {
    return NextResponse.json({ error: "Failed to reset config" }, { status: 500 });
  }
}
