// Jest configuration for TETRIX dual invoice delivery tests

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.js'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Transform files
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
    '^@tests/(.*)$': '<rootDir>/$1'
  },
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.spec.{ts,js}'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Error on deprecated
  errorOnDeprecated: true,
  
  // Globals
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  
  // Test environment variables
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  }
};