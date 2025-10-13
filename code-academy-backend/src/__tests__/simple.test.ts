// Simple test to verify Jest is working
describe('Basic Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const greeting = 'Hello, TETRIX Code Academy!';
    expect(greeting).toContain('TETRIX');
    expect(greeting).toHaveLength(26);
  });

  it('should handle array operations', () => {
    const features = ['AI', 'Voice Learning', 'Real-time Collaboration'];
    expect(features).toHaveLength(3);
    expect(features).toContain('AI');
  });

  it('should handle object operations', () => {
    const course = {
      title: 'JavaScript Fundamentals',
      difficulty: 'BEGINNER',
      duration: 120,
      isFree: true
    };
    
    expect(course.title).toBe('JavaScript Fundamentals');
    expect(course.difficulty).toBe('BEGINNER');
    expect(course.isFree).toBe(true);
  });
});
