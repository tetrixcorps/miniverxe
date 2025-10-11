import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/tetrix_code_academy_test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.DEEPGRAM_API_KEY = 'test-deepgram-key';
process.env.SHANGO_API_KEY = 'test-shango-key';
process.env.TETRIX_2FA_API_KEY = 'test-2fa-key';

// Global test setup
beforeAll(async () => {
  // Reset database
  const prisma = new PrismaClient();
  await prisma.$executeRaw`TRUNCATE TABLE "sessions", "notifications", "messages", "collaborations", "reviews", "submissions", "progress", "enrollments", "exercises", "lessons", "courses", "user_profiles", "users" RESTART IDENTITY CASCADE;`;
  await prisma.$disconnect();
});

// Global test teardown
afterAll(async () => {
  // Clean up any remaining test data
  const prisma = new PrismaClient();
  await prisma.$executeRaw`TRUNCATE TABLE "sessions", "notifications", "messages", "collaborations", "reviews", "submissions", "progress", "enrollments", "exercises", "lessons", "courses", "user_profiles", "users" RESTART IDENTITY CASCADE;`;
  await prisma.$disconnect();
});

// Mock external services
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Mocked AI response'
            }
          }]
        })
      }
    }
  }))
}));

jest.mock('@deepgram/sdk', () => ({
  Deepgram: jest.fn().mockImplementation(() => ({
    listen: {
      prerecorded: {
        transcribeFile: jest.fn().mockResolvedValue({
          results: {
            channels: [{
              alternatives: [{
                transcript: 'Mocked transcript'
              }]
            }]
          }
        })
      }
    }
  }))
}));

jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

// Mock logger to prevent console output during tests
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  initializeLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }))
}));
