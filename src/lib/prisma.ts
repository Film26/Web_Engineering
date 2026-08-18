import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

// Single Prisma Client instance per process. Next.js hot-reloads modules in
// dev, which would otherwise create a new client (and DB connection) on
// every edit — stash it on `globalThis` so dev reuses the same instance.
//
// Swapping to Postgres for production: replace the adapter below with
// `@prisma/adapter-pg` (npm install @prisma/adapter-pg pg), change
// `provider = "sqlite"` to `"postgresql"` in prisma/schema.prisma, and point
// DATABASE_URL at the Postgres connection string. Nothing outside this file
// needs to change.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
