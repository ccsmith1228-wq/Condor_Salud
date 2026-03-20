// POST /api/admin/login — admin login with env-based credentials

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAccessToken } from "@/lib/security/jwt-auth";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son obligatorios" }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
      return NextResponse.json({ error: "Admin no configurado" }, { status: 503 });
    }

    if (email !== adminEmail) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, adminPasswordHash);
    if (!valid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const token = signAccessToken({ id: "admin", email: adminEmail, role: "admin" });

    logger.info("Admin logged in");
    return NextResponse.json({ token, email: adminEmail });
  } catch (err) {
    logger.error({ err }, "Admin login error");
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
