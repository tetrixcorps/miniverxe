import { AIService } from '../../services/aiService';

// Mock OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn()
    }
  }
};

jest.mock('openai', () => ({
  OpenAI: jest.fn(() => mockOpenAI)
}));

// Mock Deepgram
const mockDeepgram = {
  listen: {
    prerecorded: {
      transcribeFile: jest.fn()
    }
  }
};

jest.mock('@deepgram/sdk', () => ({
  Deepgram: jest.fn(() => mockDeepgram)
}));

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = AIService.getInstance();
    jest.clearAllMocks();
  });

  describe('getCodingAssistance', () => {
    it('should return AI assistance for coding question', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Here is a solution to your coding problem:\n\n```javascript\nfunction example() {\n  return "Hello World";\n}\n```\n\nThis function returns a greeting message.'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const question = 'How do I create a function in JavaScript?';
      const context = {
        language: 'javascript',
        code: 'function test() {}',
        userId: 'user123'
      };

      const result = await aiService.getCodingAssistance(question, context);

      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('explanation');
      expect(result.response).toContain('Here is a solution');
      expect(result.code).toContain('function example()');
    });

    it('should handle AI service errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const question = 'Test question';
      const context = {};

      await expect(aiService.getCodingAssistance(question, context))
        .rejects.toThrow('Failed to get AI assistance');
    });

    it('should parse AI response correctly', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Here are some suggestions:\n• Use const instead of var\n• Add error handling\n• Consider using async/await\n\n```javascript\nconst result = await fetch(url);\n```'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await aiService.getCodingAssistance('Test question', {});

      expect(result.suggestions).toEqual([
        'Use const instead of var',
        'Add error handling',
        'Consider using async/await'
      ]);
      expect(result.code).toContain('const result = await fetch(url);');
    });
  });

  describe('transcribeSpeech', () => {
    it('should transcribe audio to text', async () => {
      const mockTranscript = 'This is a test transcription';
      mockDeepgram.listen.prerecorded.transcribeFile.mockResolvedValue({
        results: {
          channels: [{
            alternatives: [{
              transcript: mockTranscript
            }]
          }]
        }
      });

      const audioBuffer = Buffer.from('fake-audio-data');
      const result = await aiService.transcribeSpeech(audioBuffer);

      expect(result).toBe(mockTranscript);
      expect(mockDeepgram.listen.prerecorded.transcribeFile).toHaveBeenCalledWith(
        audioBuffer,
        expect.objectContaining({
          model: 'nova-2',
          language: 'en',
          punctuate: true,
          paragraphs: true,
          diarize: false,
          smart_format: true,
        })
      );
    });

    it('should handle transcription errors', async () => {
      mockDeepgram.listen.prerecorded.transcribeFile.mockRejectedValue(new Error('Transcription failed'));

      const audioBuffer = Buffer.from('fake-audio-data');

      await expect(aiService.transcribeSpeech(audioBuffer))
        .rejects.toThrow('Failed to transcribe speech');
    });
  });

  describe('reviewCode', () => {
    it('should review code and return feedback', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              score: 8,
              feedback: 'Good code structure, but could use better error handling.',
              suggestions: ['Add try-catch blocks', 'Use const instead of var'],
              issues: [
                { type: 'warning', line: 5, message: 'Consider adding error handling' },
                { type: 'suggestion', line: 10, message: 'Use const instead of var' }
              ]
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const code = 'function test() { var x = 1; return x; }';
      const language = 'javascript';
      const requirements = 'Create a function that returns a number';

      const result = await aiService.reviewCode(code, language, requirements);

      expect(result.score).toBe(8);
      expect(result.feedback).toContain('Good code structure');
      expect(result.suggestions).toContain('Add try-catch blocks');
      expect(result.issues).toHaveLength(2);
      expect(result.issues[0]).toEqual({
        type: 'warning',
        line: 5,
        message: 'Consider adding error handling'
      });
    });

    it('should handle invalid JSON response gracefully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await aiService.reviewCode('test code', 'javascript');

      expect(result.score).toBe(5);
      expect(result.feedback).toBe('Invalid JSON response');
      expect(result.suggestions).toEqual([]);
      expect(result.issues).toEqual([]);
    });
  });

  describe('generateExerciseSolution', () => {
    it('should generate exercise solution', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              solution: 'function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }',
              explanation: 'This is a recursive implementation of the Fibonacci sequence.',
              testCases: [
                { input: '0', expectedOutput: '0', description: 'Base case: n=0' },
                { input: '1', expectedOutput: '1', description: 'Base case: n=1' },
                { input: '5', expectedOutput: '5', description: 'Fibonacci of 5' }
              ]
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const exercise = {
        title: 'Fibonacci Function',
        description: 'Create a function that calculates the nth Fibonacci number',
        instructions: 'Use recursion to implement the Fibonacci sequence',
        language: 'javascript',
        difficulty: 'INTERMEDIATE'
      };

      const result = await aiService.generateExerciseSolution(exercise);

      expect(result.solution).toContain('function fibonacci');
      expect(result.explanation).toContain('recursive implementation');
      expect(result.testCases).toHaveLength(3);
      expect(result.testCases[0]).toEqual({
        input: '0',
        expectedOutput: '0',
        description: 'Base case: n=0'
      });
    });

    it('should handle invalid JSON response gracefully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const exercise = {
        title: 'Test Exercise',
        description: 'Test description',
        instructions: 'Test instructions',
        language: 'javascript',
        difficulty: 'BEGINNER'
      };

      const result = await aiService.generateExerciseSolution(exercise);

      expect(result.solution).toBe('Invalid JSON response');
      expect(result.explanation).toBe('Solution generated by AI');
      expect(result.testCases).toEqual([]);
    });
  });

  describe('buildCodingPrompt', () => {
    it('should build prompt with context', () => {
      const question = 'How do I create a class?';
      const context = {
        language: 'python',
        code: 'class Test: pass',
        lessonId: 'lesson123',
        userId: 'user123'
      };

      // Access private method through any type
      const prompt = (aiService as any).buildCodingPrompt(question, context);

      expect(prompt).toContain('Student Question: How do I create a class?');
      expect(prompt).toContain('Programming Language: python');
      expect(prompt).toContain('Current Code:');
      expect(prompt).toContain('class Test: pass');
      expect(prompt).toContain('Lesson Context: This is related to lesson lesson123');
    });
  });

  describe('parseAIResponse', () => {
    it('should parse response with code blocks and suggestions', () => {
      const response = 'Here is the solution:\n\n```javascript\nconst x = 1;\n```\n\nSuggestions:\n• Use const\n• Add comments\n\nThis is the explanation.';

      // Access private method through any type
      const parsed = (aiService as any).parseAIResponse(response);

      expect(parsed.code).toBe('const x = 1;\n');
      expect(parsed.suggestions).toEqual(['Use const', 'Add comments']);
      expect(parsed.explanation).toContain('This is the explanation');
    });

    it('should handle response without code blocks', () => {
      const response = 'This is just an explanation without code.';

      // Access private method through any type
      const parsed = (aiService as any).parseAIResponse(response);

      expect(parsed.code).toBeUndefined();
      expect(parsed.suggestions).toBeUndefined();
      expect(parsed.explanation).toContain('This is just an explanation');
    });
  });
});
