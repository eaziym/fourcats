import { Pool } from "pg";

/**
 * Single shared Postgres connection pool for the whole app.
 *
 * Supabase caps *total* concurrent connections (15 on free/small tiers). Every
 * serverless instance holds its own pool, so `N_instances × pool.max` must stay
 * under that ceiling. Both the Prisma adapter (`src/lib/db.ts`) and the raw
 * pgvector/geo queries (`src/lib/pet-data/search.ts`) route through `getPgPool()`.
 *
 * THE DURABLE FIX for serverless is to point `DATABASE_URL` at Supabase's
 * transaction pooler (pgBouncer, host `...pooler.supabase.com`, port 6543):
 * pgBouncer multiplexes many client connections onto a few backend ones, so the
 * 15-connection ceiling effectively goes away. This pool auto-detects the pooler
 * and allows a healthier `max` when it's in use.
 *
 * Cached on `globalThis` so Next dev HMR and warm serverless invocations reuse
 * the same pool instead of leaking a new one on every reload/invocation.
 */
const globalForPgPool = globalThis as unknown as {
  pgPool: Pool | undefined;
};

/**
 * Per-instance connection budget, keyed off the connection TARGET (the Supabase
 * cap applies in dev and prod alike, so this can't depend on NODE_ENV):
 *   - local Postgres (own Docker, no shared cap) -> 10
 *   - remote Supabase via transaction pooler      -> 6  (pgBouncer multiplexes)
 *   - remote Supabase direct connection           -> 2  (keep N×2 under 15)
 * Override explicitly with DB_POOL_MAX.
 */
function resolvePoolMax(connectionString: string, isLocal: boolean): number {
  const override = Number(process.env.DB_POOL_MAX);
  if (Number.isFinite(override) && override > 0) return override;
  if (isLocal) return 10;
  const usesPooler = /pooler\.supabase\.com|[:.]6543\b/.test(connectionString);
  return usesPooler ? 6 : 2;
}

function createPgPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const isLocal = /@(localhost|127\.0\.0\.1|0\.0\.0\.0)[:/]/.test(
    connectionString,
  );

  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: resolvePoolMax(connectionString, isLocal),
    // Release idle connections fast so they stop counting against the cap, and
    // let an idle serverless instance drop to ZERO open connections (the key to
    // not multiplying max across many warm instances).
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
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
