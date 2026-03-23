#!/usr/bin/env node
/**
 * scripts/run-migration-013.mjs
 *
 * Runs migration 013 (Five Missing Features) against a Supabase Postgres database.
 *
 * Usage:
 *   node scripts/run-migration-013.mjs
 *
 * Requires DATABASE_URL in .env.local:
 *   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
 *
 * Or pass directly:
 *   DATABASE_URL="postgresql://..." node scripts/run-migration-013.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Load .env.local
const envPath = resolve(root, ".env.local");
try {
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set. Add it to .env.local or pass via environment:");
  console.error("   DATABASE_URL=\"postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres\"");
  console.error("\n   Find it in Supabase Dashboard → Settings → Database → Connection string (URI)");
  process.exit(1);
}

const sqlPath = resolve(root, "supabase/migrations/013_missing_features.sql");
const sql = readFileSync(sqlPath, "utf8");

console.log("🔄 Running migration 013 — Five Missing Features...\n");

const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log("✅ Connected to database\n");

  await client.query(sql);
  console.log("✅ Migration 013 applied successfully!\n");

  // Verify
  const { rows } = await client.query(`
    SELECT count(*)::int as cnt FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'club_plans','club_memberships','prescription_fees',
        'digital_prescriptions','prescription_medications',
        'doctor_verifications','verification_documents',
        'doctor_public_profiles','doctor_reviews_public',
        'health_tracker_categories','health_tracker_items'
      );
  `);
  console.log(`📋 Tables verified: ${rows[0].cnt}/11 exist`);

  // Check seed data
  const plans = await client.query("SELECT slug, name_es FROM club_plans ORDER BY sort_order");
  console.log("\n🏥 Club plans:");
  plans.rows.forEach((r) => console.log(`   • ${r.slug}: ${r.name_es}`));

  const cats = await client.query("SELECT slug, name_en FROM health_tracker_categories ORDER BY sort_order");
  console.log("\n📊 Health tracker categories:");
  cats.rows.forEach((r) => console.log(`   • ${r.slug}: ${r.name_en}`));

  console.log("\n🎉 Migration 013 complete!");
} catch (err) {
  console.error("❌ Migration failed:", err.message);
  if (err.message.includes("already exists")) {
    console.log("\n💡 Some objects already exist — this is OK if you ran the migration before.");
    console.log("   The migration uses IF NOT EXISTS / ON CONFLICT, so it should be safe to re-run.");
  }
  process.exit(1);
} finally {
  await client.end();
}
