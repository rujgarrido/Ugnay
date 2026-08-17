import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton. Prevents exhausting DB connections from
 * hot-reload creating a new client on every file change in dev.
 *
 * NOTE: `@prisma/client` is only generated after `npx prisma generate` has
 * been run (see Section 8/10 of the implementation guide — this file is
 * scaffolding only until the schema has real models).
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
