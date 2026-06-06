import "dotenv/config";
import { PrismaClient } from "@generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getPgPool } from "@/lib/pg-pool";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Reuse the single shared pool (see src/lib/pg-pool.ts) so Prisma and the raw
  // pgvector queries together stay under Supabase's connection limit.
  // disposeExternalPool:false keeps the pool alive for the other consumers.
  const adapter = new PrismaPg(getPgPool(), { disposeExternalPool: false });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
