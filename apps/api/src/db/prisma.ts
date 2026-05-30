import { PrismaClient } from "@prisma/client";

/** Shared Prisma client for the running server (tests build their own). */
export const prisma = new PrismaClient();
