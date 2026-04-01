import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getMembershipByMemberId } from "@/lib/services/club";

/**
 * Google Wallet Pass Generation
 *
 * Google Wallet uses JWT-based "Save to Google Wallet" links.
 * You create a Generic Pass object, sign it with a service account,
 * and redirect the user to a Google Wallet save URL.
 *
 * Environment variables needed:
 *   GOOGLE_WALLET_ISSUER_ID           – from Google Pay & Wallet Console
 *   GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL – service account email
 *   GOOGLE_WALLET_PRIVATE_KEY         – PEM-encoded private key (base64 or raw)
 *
 * Setup:
 *   1. Go to pay.google.com/business/console
 *   2. Create a Generic Pass class
 *   3. Create a service account with "Google Wallet API" access
 *   4. Export the private key
 *
 * Once configured, this endpoint returns a "saveUrl" the client can open.
 */

const REQUIRED_ENV = [
  "GOOGLE_WALLET_ISSUER_ID",
  "GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_WALLET_PRIVATE_KEY",
] as const;

function isConfigured(): boolean {
  return REQUIRED_ENV.every((key) => !!process.env[key]);
}

/** Build a Google Wallet Generic Pass object */
function buildPassObject(
  issuerId: string,
  membership: {
    memberId: string;
    plan?: { slug?: string; nameEs?: string } | null;
    startedAt: string;
    expiresAt?: string;
  },
) {
  const objectId = `${issuerId}.condorsalud-club-${membership.memberId}`;
  const classId = `${issuerId}.condorsalud-club-salud`;

  const planColors: Record<string, { bg: string; font: string }> = {
    plus: { bg: "#B8860B", font: "#FFFFFF" },
    familiar: { bg: "#1C344D", font: "#FFFFFF" },
  };
  const colors = planColors[membership.plan?.slug || ""] ?? {
    bg: "#4A7FAF",
    font: "#FFFFFF",
  };

  return {
    id: objectId,
    classId: classId,
    genericType: "GENERIC_TYPE_UNSPECIFIED",
    hexBackgroundColor: colors.bg,
    logo: {
      sourceUri: {
        uri: "https://condorsalud.com/logos/condor-icon-white.png",
      },
    },
    cardTitle: {
      defaultValue: { language: "es-AR", value: "Club Salud" },
    },
    subheader: {
      defaultValue: { language: "es-AR", value: "CÓNDOR SALUD" },
    },
    header: {
      defaultValue: {
        language: "es-AR",
        value: membership.memberId,
      },
    },
    textModulesData: [
      {
        id: "plan",
        header: "PLAN",
        body: membership.plan?.nameEs || "Club Salud",
      },
      {
        id: "since",
        header: "MIEMBRO DESDE",
        body: new Date(membership.startedAt).toLocaleDateString("es-AR"),
      },
      {
        id: "status",
        header: "ESTADO",
        body: "Activo",
      },
    ],
    barcode: {
      type: "QR_CODE",
      value: `https://condorsalud.com/club/verify/${membership.memberId}`,
    },
    state: "ACTIVE",
  };
}

export async function GET(req: NextRequest) {
  const memberId = req.nextUrl.searchParams.get("memberId");
  if (!memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  // Look up membership
  const membership = await getMembershipByMemberId(memberId);
  if (!membership) {
    return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  }

  // Check configuration
  if (!isConfigured()) {
    return NextResponse.json(
      {
        error: "Google Wallet not configured",
        message:
          "Google Wallet pass generation requires a Google Cloud service account. " +
          "Set GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL, " +
          "and GOOGLE_WALLET_PRIVATE_KEY environment variables.",
        setup: {
          step1: "Go to pay.google.com/business/console",
          step2: "Create an Issuer account and note the Issuer ID",
          step3: "Create a Generic Pass class named 'condorsalud-club-salud'",
          step4: "Create a service account with Google Wallet API permissions",
          step5: "Export the private key and set env vars",
          docs: "https://developers.google.com/wallet/generic/web/prerequisites",
        },
      },
      { status: 501 },
    );
  }

  try {
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID!;
    const serviceAccountEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL!;
    let privateKeyRaw = process.env.GOOGLE_WALLET_PRIVATE_KEY!;

    // Handle base64-encoded private keys
    if (!privateKeyRaw.includes("-----BEGIN")) {
      privateKeyRaw = Buffer.from(privateKeyRaw, "base64").toString("utf-8");
    }

    // Build the pass object
    const passObject = buildPassObject(issuerId, membership);

    // Create the claims for the JWT
    const claims = {
      iss: serviceAccountEmail,
      aud: "google",
      origins: ["https://condorsalud.com"],
      typ: "savetowallet",
      payload: {
        genericObjects: [passObject],
      },
    };

    // Sign with jose (already a project dependency)
    const privateKey = await importPKCS8(privateKeyRaw);
    const jwt = await new SignJWT(claims)
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuedAt()
      .sign(privateKey);

    const saveUrl = `https://pay.google.com/gp/v/save/${jwt}`;

    return NextResponse.json({ saveUrl });
  } catch (err) {
    console.error("[google-wallet]", err);
    return NextResponse.json({ error: "Failed to generate Google Wallet link" }, { status: 500 });
  }
}

/** Import a PEM-encoded PKCS8 private key for jose */
async function importPKCS8(pem: string) {
  const { importPKCS8: joseImportPKCS8 } = await import("jose");
  return joseImportPKCS8(pem, "RS256");
}
