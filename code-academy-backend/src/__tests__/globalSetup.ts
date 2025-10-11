import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

export default async function globalSetup() {
  console.log('Setting up test database...');
  
  // Set test database URL
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/tetrix_code_academy_test';
  
  try {
    // Run database migrations
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}
