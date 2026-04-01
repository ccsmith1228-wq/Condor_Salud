import { NextRequest, NextResponse } from "next/server";
import { getMembershipByMemberId } from "@/lib/services/club";

/**
 * Apple Wallet Pass (.pkpass) Generation
 *
 * Apple Wallet passes require:
 *   1. An Apple Developer account with Pass Type ID
 *   2. A signing certificate (.p12) and its password
 *   3. Apple WWDR intermediate certificate
 *
 * Environment variables needed:
 *   APPLE_PASS_TYPE_ID        – e.g. "pass.com.condorsalud.club"
 *   APPLE_TEAM_IDENTIFIER     – 10-char Apple Team ID
 *   APPLE_PASS_CERTIFICATE    – Base64-encoded .p12 certificate
 *   APPLE_PASS_CERT_PASSWORD  – Password for the .p12
 *
 * Once configured, this endpoint returns a signed .pkpass file.
 * Until then, it returns a 501 with setup instructions.
 */

const REQUIRED_ENV = [
  "APPLE_PASS_TYPE_ID",
  "APPLE_TEAM_IDENTIFIER",
  "APPLE_PASS_CERTIFICATE",
  "APPLE_PASS_CERT_PASSWORD",
] as const;

function isConfigured(): boolean {
  return REQUIRED_ENV.every((key) => !!process.env[key]);
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

  // Check if Apple Wallet is configured
  if (!isConfigured()) {
    return NextResponse.json(
      {
        error: "Apple Wallet not configured",
        message:
          "Apple Wallet pass generation requires an Apple Developer account. " +
          "Set APPLE_PASS_TYPE_ID, APPLE_TEAM_IDENTIFIER, APPLE_PASS_CERTIFICATE, " +
          "and APPLE_PASS_CERT_PASSWORD environment variables to enable this feature.",
        setup: {
          step1: "Create a Pass Type ID in Apple Developer Portal",
          step2: "Generate a signing certificate (.p12)",
          step3: "Base64-encode the .p12 and set as APPLE_PASS_CERTIFICATE",
          step4: "Set APPLE_PASS_CERT_PASSWORD to the certificate password",
          step5: "Set APPLE_TEAM_IDENTIFIER to your Apple Team ID",
          docs: "https://developer.apple.com/documentation/walletpasses",
        },
      },
      { status: 501 },
    );
  }

  try {
    // Generate PKPass file
    // The .pkpass format is a ZIP archive containing:
    //   pass.json    – pass structure and visual configuration
    //   icon.png     – card icon
    //   logo.png     – brand logo
    //   manifest.json – SHA1 hashes of all files
    //   signature    – CMS signature of manifest

    const passJson = {
      formatVersion: 1,
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID,
      serialNumber: membership.memberId,
      teamIdentifier: process.env.APPLE_TEAM_IDENTIFIER,
      organizationName: "Cóndor Salud",
      description: "Club Salud Member Card",
      logoText: "CÓNDOR SALUD",
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor:
        membership.plan?.slug === "plus"
          ? "rgb(184, 134, 11)"
          : membership.plan?.slug === "familiar"
            ? "rgb(28, 52, 77)"
            : "rgb(74, 127, 175)",
      labelColor: "rgb(255, 255, 255)",
      generic: {
        primaryFields: [
          {
            key: "member",
            label: "MIEMBRO",
            value: membership.memberId,
          },
        ],
        secondaryFields: [
          {
            key: "plan",
            label: "PLAN",
            value: membership.plan?.nameEs || "Club Salud",
          },
          {
            key: "since",
            label: "DESDE",
            value: new Date(membership.startedAt).toLocaleDateString("es-AR"),
          },
        ],
        auxiliaryFields: [
          {
            key: "status",
            label: "ESTADO",
            value: "Activo",
          },
        ],
        backFields: [
          {
            key: "info",
            label: "Club Salud — Cóndor Salud",
            value:
              "Esta credencial digital acredita tu membresía activa en Club Salud de Cóndor Salud. " +
              "Presentala en cualquier centro de nuestra red para acceder a tus beneficios. " +
              "condorsalud.com",
          },
        ],
      },
      barcode: {
        format: "PKBarcodeFormatQR",
        message: `https://condorsalud.com/club/verify/${membership.memberId}`,
        messageEncoding: "iso-8859-1",
      },
      barcodes: [
        {
          format: "PKBarcodeFormatQR",
          message: `https://condorsalud.com/club/verify/${membership.memberId}`,
          messageEncoding: "iso-8859-1",
        },
      ],
    };

    // TODO: When certificates are configured, sign the pass and return as .pkpass
    // For now, return the pass definition so it can be tested
    // In production, use a library like `passkit-generator` to create the signed archive

    return NextResponse.json(
      {
        message:
          "Apple Wallet certificates are set but pass signing is not yet implemented. " +
          "Install `passkit-generator` and implement the signing step.",
        passDefinition: passJson,
      },
      { status: 501 },
    );
  } catch (err) {
    console.error("[apple-wallet]", err);
    return NextResponse.json({ error: "Failed to generate Apple Wallet pass" }, { status: 500 });
  }
}
