import { PrismaClient } from './generated/prisma';
import { db as firestore } from './firebase';

// Initialize Prisma Client with enhanced configuration
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty'
});

// Export Firebase client for backward compatibility
export const db = firestore;

// Graceful shutdown with proper error handling
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await prisma.$disconnect();
    console.log('Database connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during database disconnection:', error);
    process.exit(1);
  }
};

// Handle different shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await prisma.$disconnect();
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await prisma.$disconnect();
  process.exit(1);
});