export default async function globalTeardown() {
  console.log('Cleaning up test environment...');
  
  try {
    console.log('Test environment cleanup complete');
  } catch (error) {
    console.error('Failed to cleanup test environment:', error);
  }
}