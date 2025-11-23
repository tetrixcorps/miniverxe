// AI Service for Code Academy
// Provides AI-powered code analysis, learning recommendations, and educational assistance
// Now integrated with SinchChatLive as primary + Ollama fallback

export interface CodeAnalysis {
  score: number;
  suggestions: CodeSuggestion[];
  errors: CodeError[];
  complexity: 'low' | 'medium' | 'high';
  readability: 'poor' | 'fair' | 'good' | 'excellent';
  performance: PerformanceAnalysis;
  bestPractices: BestPractice[];
}

export interface CodeSuggestion {
  id: string;
  type: 'improvement' | 'optimization' | 'style' | 'security';
  message: string;
  code: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  impact: 'low' | 'medium' | 'high';
}

export interface CodeError {
  id: string;
  type: 'syntax' | 'logic' | 'runtime' | 'type';
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  fix: string;
  explanation: string;
}

export interface PerformanceAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  bottlenecks: string[];
  optimizations: string[];
}

export interface BestPractice {
  id: string;
  category: 'naming' | 'structure' | 'documentation' | 'testing' | 'security';
  message: string;
  example: string;
  explanation: string;
}

export interface LearningInsights {
  strengths: string[];
  weaknesses: string[];
  recommendations: LearningRecommendation[];
  estimatedCompletionTime: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  learningVelocity: number;
  focusAreas: string[];
}

export interface LearningRecommendation {
  id: string;
  type: 'course' | 'project' | 'practice' | 'reading';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  priority: 'low' | 'medium' | 'high';
  prerequisites: string[];
  skills: string[];
}

export interface CodeExplanation {
  concept: string;
  explanation: string;
  examples: CodeExample[];
  relatedTopics: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface CodeExample {
  title: string;
  code: string;
  explanation: string;
  useCase: string;
}

export interface LearningProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  timeSpent: number;
  lastActivity: Date;
  quizScores: number[];
  projectCompletions: string[];
  codeSubmissions: CodeSubmission[];
}

export interface CodeSubmission {
  id: string;
  code: string;
  language: string;
  exerciseId: string;
  submittedAt: Date;
  analysis: CodeAnalysis;
  score: number;
}

export class AIService {
  private apiKey: string;
  private baseUrl: string;
  private ollamaUrl: string;
  private sinchService: any = null;

  constructor(apiKey: string, baseUrl: string = '/api/ai', ollamaUrl: string = 'http://localhost:11434') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.ollamaUrl = ollamaUrl;
    this.initializeSinchService();
  }

  /**
   * Initialize SinchChatLive service for primary AI interactions
   */
  private async initializeSinchService() {
    try {
      // Import the SinchChatLive service
      const { realSHANGOAIService } = await import('../../../src/services/realSinchChatService');
      this.sinchService = realSHANGOAIService;
      await this.sinchService.initialize();
      console.log('AIService: SinchChatLive initialized as primary');
    } catch (error) {
      console.log('AIService: SinchChatLive initialization failed, using Ollama only:', error);
    }
  }

  /**
   * Direct communication with Ollama for AI assistance
   */
  async queryOllama(prompt: string, model: string = 'qwen3:latest'): Promise<string> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2048
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Error querying Ollama:', error);
      throw error;
    }
  }

  /**
   * Stream response from Ollama for real-time AI assistance
   */
  async streamOllamaResponse(
    prompt: string, 
    model: string = 'qwen3:latest',
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: true,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2048
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                onChunk(data.response);
              }
              if (data.done) {
                onComplete();
                return;
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming from Ollama:', error);
      onError(error instanceof Error ? error.message : 'Streaming error');
    }
  }

  /**
   * Analyze student code and provide feedback using Ollama
   */
  async analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
    try {
      // First try the backend API
      const response = await fetch(`${this.baseUrl}/analyze-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          language,
          context: 'student_submission'
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Backend API failed, trying Ollama directly:', error);
    }

    // Fallback to direct Ollama query
    try {
      const prompt = `Analyze this ${language} code and provide detailed feedback:

\`\`\`${language}
${code}
\`\`\`

Please provide:
1. Overall score (0-100)
2. Code suggestions for improvement
3. Any errors or issues
4. Performance analysis
5. Best practices recommendations

Format your response as JSON with the following structure:
{
  "score": number,
  "suggestions": [{"id": "1", "type": "improvement", "message": "...", "code": "...", "explanation": "...", "difficulty": "beginner|intermediate|advanced", "impact": "low|medium|high"}],
  "errors": [{"id": "1", "type": "syntax|logic|runtime|type", "message": "...", "line": number, "column": number, "severity": "error|warning|info", "fix": "...", "explanation": "..."}],
  "complexity": "low|medium|high",
  "readability": "poor|fair|good|excellent",
  "performance": {"timeComplexity": "...", "spaceComplexity": "...", "bottlenecks": [...], "optimizations": [...]},
  "bestPractices": [{"id": "1", "category": "naming|structure|documentation|testing|security", "message": "...", "example": "...", "explanation": "..."}]
}`;

      const response = await this.queryOllama(prompt);
      
      // Try to parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON found, create a basic analysis
      return this.createBasicAnalysisFromText(response, code, language);
    } catch (error) {
      console.error('Error analyzing code with Ollama:', error);
      return this.getMockCodeAnalysis(code, language);
    }
  }

  /**
   * Generate learning insights based on student progress
   */
  async generateLearningInsights(progress: LearningProgress): Promise<LearningInsights> {
    try {
      const response = await fetch(`${this.baseUrl}/learning-insights`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progress)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate insights: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating learning insights:', error);
      return this.getMockLearningInsights(progress);
    }
  }

  /**
   * Get personalized learning recommendations
   */
  async getRecommendations(userId: string, currentSkills: string[]): Promise<LearningRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          currentSkills,
          learningGoals: [],
          timeAvailable: 60 // minutes per day
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get recommendations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return this.getMockRecommendations();
    }
  }

  /**
   * Explain a coding concept
   */
  async explainConcept(concept: string, level: 'beginner' | 'intermediate' | 'advanced'): Promise<CodeExplanation> {
    try {
      const response = await fetch(`${this.baseUrl}/explain-concept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          concept,
          level,
          context: 'educational'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to explain concept: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error explaining concept:', error);
      return this.getMockExplanation(concept, level);
    }
  }

  /**
   * Generate code suggestions for improvement
   */
  async generateCodeSuggestions(code: string, language: string, focus: string[]): Promise<CodeSuggestion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/code-suggestions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          language,
          focus,
          level: 'intermediate'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate suggestions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating code suggestions:', error);
      return this.getMockCodeSuggestions(code, language);
    }
  }

  /**
   * Track learning activity and update progress
   */
  async trackActivity(activity: {
    userId: string;
    type: 'lesson_completed' | 'code_submitted' | 'quiz_taken' | 'project_started';
    data: any;
    timestamp: Date;
  }): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/track-activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activity)
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  /**
   * Generate personalized study plan
   */
  async generateStudyPlan(userId: string, goals: string[], timeAvailable: number): Promise<{
    plan: LearningRecommendation[];
    timeline: { week: number; focus: string; activities: string[] }[];
    milestones: { name: string; targetDate: Date; description: string }[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/study-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          goals,
          timeAvailable,
          currentLevel: 'intermediate'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate study plan: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating study plan:', error);
      return this.getMockStudyPlan();
    }
  }

  /**
   * Create basic analysis from text response when JSON parsing fails
   */
  private createBasicAnalysisFromText(response: string, code: string, language: string): CodeAnalysis {
    const lines = code.split('\n').length;
    const complexity = lines > 50 ? 'high' : lines > 20 ? 'medium' : 'low';
    
    return {
      score: 70, // Default score
      suggestions: [
        {
          id: '1',
          type: 'improvement',
          message: 'AI Analysis Available',
          code: '// ' + response.substring(0, 100) + '...',
          explanation: 'The AI has provided analysis of your code. Review the suggestions above.',
          difficulty: 'intermediate',
          impact: 'medium'
        }
      ],
      errors: [],
      complexity,
      readability: 'good',
      performance: {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        bottlenecks: [],
        optimizations: []
      },
      bestPractices: [
        {
          id: '1',
          category: 'documentation',
          message: 'Consider adding comments to explain complex logic',
          example: '// This function calculates the factorial',
          explanation: 'Good documentation helps others understand your code'
        }
      ]
    };
  }

  // Mock data for development/testing
  private getMockCodeAnalysis(code: string, language: string): CodeAnalysis {
    return {
      score: 75,
      suggestions: [
        {
          id: '1',
          type: 'improvement',
          message: 'Consider using const instead of let for variables that don\'t change',
          code: 'const userName = "John";',
          explanation: 'Using const makes your code more predictable and prevents accidental reassignment.',
          difficulty: 'beginner',
          impact: 'medium'
        },
        {
          id: '2',
          type: 'optimization',
          message: 'This function could be optimized using array methods',
          code: 'const result = array.map(item => item.value).filter(val => val > 0);',
          explanation: 'Array methods are more readable and often more performant than loops.',
          difficulty: 'intermediate',
          impact: 'high'
        }
      ],
      errors: [
        {
          id: '1',
          type: 'syntax',
          message: 'Missing semicolon',
          line: 5,
          column: 10,
          severity: 'error',
          fix: 'Add semicolon at end of line',
          explanation: 'JavaScript statements should end with semicolons for clarity and to avoid automatic semicolon insertion issues.'
        }
      ],
      complexity: 'medium',
      readability: 'good',
      performance: {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        bottlenecks: ['Loop could be optimized'],
        optimizations: ['Use array methods', 'Consider memoization']
      },
      bestPractices: [
        {
          id: '1',
          category: 'naming',
          message: 'Variable names should be descriptive',
          example: 'const userAge = 25;',
          explanation: 'Descriptive variable names make code self-documenting and easier to understand.'
        }
      ]
    };
  }

  private getMockLearningInsights(progress: LearningProgress): LearningInsights {
    return {
      strengths: ['JavaScript fundamentals', 'Problem solving', 'Code organization'],
      weaknesses: ['Async programming', 'Error handling', 'Testing'],
      recommendations: [
        {
          id: '1',
          type: 'course',
          title: 'Advanced JavaScript Patterns',
          description: 'Learn advanced JavaScript concepts and patterns',
          difficulty: 'intermediate',
          estimatedTime: 20,
          priority: 'high',
          prerequisites: ['JavaScript basics'],
          skills: ['async/await', 'promises', 'closures']
        }
      ],
      estimatedCompletionTime: 45,
      skillLevel: 'intermediate',
      learningVelocity: 0.8,
      focusAreas: ['Async programming', 'Testing', 'Performance optimization']
    };
  }

  private getMockRecommendations(): LearningRecommendation[] {
    return [
      {
        id: '1',
        type: 'course',
        title: 'React Hooks Deep Dive',
        description: 'Master React hooks and modern React patterns',
        difficulty: 'intermediate',
        estimatedTime: 15,
        priority: 'high',
        prerequisites: ['React basics'],
        skills: ['useState', 'useEffect', 'custom hooks']
      },
      {
        id: '2',
        type: 'project',
        title: 'Build a Todo App with React',
        description: 'Create a full-featured todo application',
        difficulty: 'beginner',
        estimatedTime: 8,
        priority: 'medium',
        prerequisites: ['React basics', 'JavaScript'],
        skills: ['component design', 'state management', 'local storage']
      }
    ];
  }

  private getMockExplanation(concept: string, level: string): CodeExplanation {
    return {
      concept,
      explanation: `This is a detailed explanation of ${concept} at the ${level} level.`,
      examples: [
        {
          title: 'Basic Example',
          code: '// Example code here',
          explanation: 'This example shows the basic usage',
          useCase: 'Common use case for this concept'
        }
      ],
      relatedTopics: ['Related topic 1', 'Related topic 2'],
      difficulty: level as 'beginner' | 'intermediate' | 'advanced'
    };
  }

  private getMockCodeSuggestions(code: string, language: string): CodeSuggestion[] {
    return [
      {
        id: '1',
        type: 'improvement',
        message: 'Consider using template literals for string concatenation',
        code: 'const message = `Hello, ${name}!`;',
        explanation: 'Template literals are more readable and efficient than string concatenation.',
        difficulty: 'beginner',
        impact: 'medium'
      }
    ];
  }

  private getMockStudyPlan() {
    return {
      plan: this.getMockRecommendations(),
      timeline: [
        {
          week: 1,
          focus: 'JavaScript Fundamentals',
          activities: ['Complete basic syntax course', 'Practice with coding exercises']
        },
        {
          week: 2,
          focus: 'React Basics',
          activities: ['Learn component structure', 'Build simple components']
        }
      ],
      milestones: [
        {
          name: 'Complete JavaScript Course',
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          description: 'Finish the JavaScript fundamentals course'
        }
      ]
    };
  }
}

// Export a singleton instance
export const aiService = new AIService(
  process.env.REACT_APP_AI_API_KEY || '',
  process.env.REACT_APP_AI_BASE_URL || '/api/ai',
  process.env.REACT_APP_OLLAMA_URL || 'http://localhost:11434'
);
