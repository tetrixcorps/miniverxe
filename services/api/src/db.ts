import { PrismaClient } from './generated/prisma';
import { db as firestore } from './firebase';

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Export Firebase client for backward compatibility
export const db = firestore;

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});