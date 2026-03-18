/**
 * CRM Stats API
 *
 * GET /api/crm/stats — Pipeline stats and KPIs
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, logger } from "@/lib/security/api-guard";
import { requireAuth } from "@/lib/security/require-auth";
import { getLeadStats } from "@/lib/services/crm";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(req, "crm-stats", { limit: 30, windowSec: 60 });
  if (limited) return limited;

  try {
    const clinicId = auth.user?.clinicId;
    if (!clinicId) {
      return NextResponse.json({ error: "No clinic associated" }, { status: 400 });
    }

    const stats = await getLeadStats(clinicId);
    return NextResponse.json({ stats });
  } catch (err) {
    logger.error({ err, route: "crm/stats" }, "Failed to fetch CRM stats");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
