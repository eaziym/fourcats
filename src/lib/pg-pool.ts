import { Pool } from "pg";

/**
 * Single shared Postgres connection pool for the whole app.
 *
 * Supabase caps *total* concurrent connections (15 on the free/small tiers), so
 * every DB consumer must share ONE bounded pool instead of each opening its own.
 * Both the Prisma adapter (`src/lib/db.ts`) and the raw pgvector/geo queries
 * (`src/lib/pet-data/search.ts`) route through `getPgPool()`.
 *
 * Cached on `globalThis` so Next dev HMR and warm serverless invocations reuse
 * the same pool instead of leaking a new one on every reload/invocation.
 *
 * Tip: for serverless (Vercel), point `DATABASE_URL` at Supabase's transaction
 * pooler (pgBouncer, port 6543) so many instances multiplex onto few backend
 * connections; this app-side pool then keeps each instance bounded.
 */
const globalForPgPool = globalThis as unknown as {
  pgPool: Pool | undefined;
};

// Stay comfortably under Supabase's connection ceiling, even with a few warm
// serverless instances each holding a pool. Override via DB_POOL_MAX if needed.
const DEFAULT_POOL_MAX = 5;

function createPgPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const isLocal = /@(localhost|127\.0\.0\.1|0\.0\.0\.0)[:/]/.test(
    connectionString,
  );
  const max = Number(process.env.DB_POOL_MAX) || DEFAULT_POOL_MAX;

  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  // A pooled client can emit 'error' while idle (e.g. Supabase dropping an idle
  // connection). Without a listener this crashes the process — log and move on.
  pool.on("error", (err) => {
    console.error("[pg-pool] idle client error:", err.message);
  });

  return pool;
}

export function getPgPool(): Pool {
  globalForPgPool.pgPool ??= createPgPool();
  return globalForPgPool.pgPool;
}
