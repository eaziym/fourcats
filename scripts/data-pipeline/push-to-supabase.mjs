#!/usr/bin/env node
// Mirror the local pipeline tables (schema + data) into remote Supabase.
//
// We develop against the local Docker DB; this pushes the already-scraped /
// already-embedded data to Supabase WITHOUT re-running scrapers or re-embedding.
// It dumps from the local container and loads via the container's own psql using
// discrete connection flags (so no host psql and no connection-URL parsing of the
// '@' in the Supabase password). Target pipeline tables are truncated first for an
// exact mirror, so it's safe to re-run.
//
// Setup: set SUPABASE_DB_URL in .env (Supabase -> Settings -> Database -> connection string).
// Usage: pnpm db:push:supabase            # schema + data
//        pnpm db:push:supabase --schema-only
//        pnpm db:push:supabase --data-only
//
// NOTE: these tables aren't in prisma/schema.prisma, so don't run
// `prisma migrate dev`/`db push` against this Supabase project or it drops them.

import "dotenv/config";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

// Inline parser (greedy password group handles the unencoded '@' in the
// Supabase password without needing a non-hoisted transitive dependency).
function parsePgUrl(connectionString) {
  const m = connectionString.match(
    /^postgres(?:ql)?:\/\/([^:]+):(.*)@([^:/?#]+)(?::(\d+))?\/([^?]+)(?:\?.*)?$/,
  );
  if (!m) throw new Error("Could not parse SUPABASE_DB_URL");
  return {
    user: decodeURIComponent(m[1]),
    password: decodeURIComponent(m[2]),
    host: m[3],
    port: m[4] || "5432",
    database: decodeURIComponent(m[5]),
  };
}

const CONTAINER = process.env.PG_CONTAINER || "fourcats-pg";
const SCHEMA = "scripts/data-pipeline/sql/pipeline-schema.sql";
const DUMP = "/tmp/llp-supabase-data.sql";
// Order is irrelevant for truncate-cascade; pg_dump emits data in FK-safe order.
const TABLES = [
  "products",
  "product_variants",
  "service_places",
  "service_place_contacts",
  "place_reviews",
  "service_place_suitability",
  "knowledge_chunks",
  "ingestion_runs",
];

function main() {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) {
    throw new Error(
      "Set SUPABASE_DB_URL in .env (Supabase Postgres connection string)",
    );
  }
  const args = process.argv.slice(2);
  const schemaOnly = args.includes("--schema-only");
  const dataOnly = args.includes("--data-only");

  const c = parsePgUrl(url);
  const psqlBase = [
    "exec",
    "-i",
    "-e",
    `PGPASSWORD=${c.password}`,
    "-e",
    "PGSSLMODE=require",
    CONTAINER,
    "psql",
    "-h",
    c.host,
    "-p",
    c.port,
    "-U",
    c.user,
    "-d",
    c.database || "postgres",
    "-v",
    "ON_ERROR_STOP=1",
  ];
  const psql = (sqlText) => {
    const r = spawnSync("docker", psqlBase, {
      input: sqlText,
      stdio: ["pipe", "inherit", "inherit"],
    });
    if (r.status !== 0) throw new Error(`psql exited ${r.status}`);
  };

  if (!dataOnly) {
    console.log(`1/3 apply schema -> Supabase (${c.host})`);
    psql(readFileSync(SCHEMA, "utf8"));
  }
  if (schemaOnly) {
    console.log("schema-only: done");
    return;
  }

  console.log("2/3 dump local pipeline data from container");
  const dumpArgs = [
    "exec",
    CONTAINER,
    "pg_dump",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "--data-only",
    "--no-owner",
    "--no-privileges",
    ...TABLES.flatMap((t) => ["-t", `public.${t}`]),
  ];
  const dump = execFileSync("docker", dumpArgs, {
    maxBuffer: 512 * 1024 * 1024,
  });
  writeFileSync(DUMP, dump);
  console.log(`   dumped ${(dump.length / 1e6).toFixed(1)} MB`);

  console.log("3/3 truncate target + load -> Supabase");
  const truncate = `truncate table ${TABLES.map((t) => `public.${t}`).join(", ")} restart identity cascade;\n`;
  psql(truncate + readFileSync(DUMP, "utf8"));

  console.log("\nremote row counts:");
  const counts = TABLES.map(
    (t) => `select '${t}' as table, count(*) from public.${t}`,
  ).join("\nunion all\n");
  psql(`${counts}\norder by 1;`);
  console.log("done — local pipeline tables mirrored to Supabase");
}

main();
