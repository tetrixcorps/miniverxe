export default async function globalSetup() {
  console.log('Setting up test environment...');
  
  // Set test database URL
  process.env['DATABASE_URL'] = process.env['TEST_DATABASE_URL'] || 'postgresql://test:test@localhost:5432/tetrix_code_academy_test';
  
  try {
    console.log('Test environment setup complete');
  } catch (error) {
    console.error('Failed to setup test environment:', error);
    throw error;
  }
}