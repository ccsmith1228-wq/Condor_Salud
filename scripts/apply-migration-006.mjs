#!/usr/bin/env node
// Apply migration 006 — WhatsApp CRM tables
// Usage: set -a && source .env.local && set +a && node scripts/apply-migration-006.mjs

import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌ Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

// Read the full migration
const sqlFull = fs.readFileSync("supabase/migrations/006_whatsapp_crm.sql", "utf8");

// Split into individual statements (naive split on semicolons outside DO blocks)
// For complex SQL with DO blocks, we need to handle $$ delimiters
function splitStatements(sql) {
  const stmts = [];
  let current = "";
  let inDollarBlock = false;

  const lines = sql.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();

    // Skip pure comments
    if (trimmed.startsWith("--") && !inDollarBlock) {
      continue;
    }

    current += line + "\n";

    // Track DO $$ blocks
    if (trimmed.includes("DO $$") || trimmed.includes("DO $$ BEGIN")) {
      inDollarBlock = true;
    }
    if (inDollarBlock && trimmed.endsWith("$$;")) {
      inDollarBlock = false;
      stmts.push(current.trim());
      current = "";
      continue;
    }

    // Normal statement end
    if (!inDollarBlock && trimmed.endsWith(";") && current.trim().length > 5) {
      stmts.push(current.trim());
      current = "";
    }
  }

  if (current.trim().length > 5) {
    stmts.push(current.trim());
  }

  return stmts.filter((s) => s.length > 5 && !s.startsWith("--"));
}

async function main() {
  console.log("════════════════════════════════════════════════════════════");
  console.log("🟢 Applying migration 006 — WhatsApp CRM tables");
  console.log("════════════════════════════════════════════════════════════\n");

  const statements = splitStatements(sqlFull);
  console.log(`📄 ${statements.length} statements to execute\n`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\n/g, " ");

    try {
      // Use rpc to execute raw SQL — create a helper function first
      // Actually, use the Supabase REST API directly for raw SQL
      const resp = await fetch(`${url}/rest/v1/rpc/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({}),
      });

      // This won't work for raw SQL. Let's try a different approach.
      // Use Supabase's pg API (pooler connection) if available
      break;
    } catch (err) {
      console.log(`  ❌ [${i + 1}] ${err.message}`);
      failed++;
    }
  }

  // Fallback: try creating the tables one by one using the JS client
  // The JS client can't run raw DDL, but we can verify existence after manual apply
  console.log("\n⚠️  Supabase JS client cannot execute DDL (CREATE TABLE, ALTER, etc.).");
  console.log("   The migration must be applied via one of these methods:\n");
  console.log("   Option 1 — Supabase Dashboard SQL Editor:");
  console.log("   https://supabase.com/dashboard/project/frgzixfvqifjvslfjzdj/sql/new");
  console.log("   → Paste the contents of supabase/migrations/006_whatsapp_crm.sql");
  console.log("");
  console.log("   Option 2 — Supabase CLI (after login):");
  console.log("   supabase login");
  console.log("   supabase link --project-ref frgzixfvqifjvslfjzdj");
  console.log("   supabase db push");
  console.log("");
  console.log("   Option 3 — psql:");
  console.log(
    "   psql 'postgresql://postgres:[PASSWORD]@db.frgzixfvqifjvslfjzdj.supabase.co:5432/postgres' < supabase/migrations/006_whatsapp_crm.sql",
  );
  console.log("");

  // Copy the SQL to clipboard on macOS
  try {
    const { execSync } = await import("child_process");
    execSync("pbcopy", { input: sqlFull });
    console.log("📋 SQL copied to clipboard! Paste it in the SQL Editor.\n");
  } catch {
    console.log("📄 SQL file: supabase/migrations/006_whatsapp_crm.sql\n");
  }
}

main().catch(console.error);
