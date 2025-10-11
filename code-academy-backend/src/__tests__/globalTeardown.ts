import { PrismaClient } from '@prisma/client';

export default async function globalTeardown() {
  console.log('Cleaning up test database...');
  
  const prisma = new PrismaClient();
  
  try {
    // Clean up test data
    await prisma.$executeRaw`TRUNCATE TABLE "sessions", "notifications", "messages", "collaborations", "reviews", "submissions", "progress", "enrollments", "exercises", "lessons", "courses", "user_profiles", "users" RESTART IDENTITY CASCADE;`;
    console.log('Test database cleanup complete');
  } catch (error) {
    console.error('Failed to cleanup test database:', error);
  } finally {
    await prisma.$disconnect();
  }
}
