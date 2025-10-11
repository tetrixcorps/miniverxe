import OpenAI from 'openai';
import { Deepgram } from '@deepgram/sdk';
import axios from 'axios';
import { logger } from '../utils/logger';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Deepgram
const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY!);

// SHANGO AI Agent configuration
const SHANGO_CONFIG = {
  apiUrl: process.env.SHANGO_API_URL || 'https://tetrixcorp.com/api/shang',
  apiKey: process.env.SHANGO_API_KEY,
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 2000,
};

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Get coding assistance from SHANGO AI agent
   */
  async getCodingAssistance(
    question: string,
    context: {
      language?: string;
      code?: string;
      lessonId?: string;
      userId?: string;
    } = {}
  ): Promise<{
    response: string;
    code?: string;
    explanation?: string;
    suggestions?: string[];
  }> {
    try {
      const prompt = this.buildCodingPrompt(question, context);
      
      const response = await openai.chat.completions.create({
        model: SHANGO_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: `You are SHANGO, an advanced AI coding assistant for TETRIX Code Academy. 
            You help students learn programming by providing clear explanations, code examples, 
            and step-by-step guidance. Always be encouraging and educational in your responses.
            
            Guidelines:
            - Provide clear, well-commented code examples
            - Explain concepts in simple terms
            - Suggest best practices and common pitfalls
            - Encourage experimentation and learning
            - Ask clarifying questions when needed
            - Provide multiple approaches when appropriate`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: SHANGO_CONFIG.temperature,
        max_tokens: SHANGO_CONFIG.maxTokens,
      });

      const aiResponse = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
      
      // Parse response to extract code and explanations
      const parsedResponse = this.parseAIResponse(aiResponse);

      logger.info(`SHANGO AI assistance provided for user: ${context.userId}`);

      return {
        response: aiResponse,
        ...parsedResponse,
      };
    } catch (error) {
      logger.error('Error getting coding assistance:', error);
      throw new Error('Failed to get AI assistance');
    }
  }

  /**
   * Transcribe speech to text using Deepgram
   */
  async transcribeSpeech(audioBuffer: Buffer): Promise<string> {
    try {
      const response = await deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: 'nova-2',
          language: 'en',
          punctuate: true,
          paragraphs: true,
          diarize: false,
          smart_format: true,
        }
      );

      const transcript = response.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
      
      logger.info('Speech transcribed successfully');
      return transcript;
    } catch (error) {
      logger.error('Error transcribing speech:', error);
      throw new Error('Failed to transcribe speech');
    }
  }

  /**
   * Get code review and suggestions
   */
  async reviewCode(
    code: string,
    language: string,
    requirements?: string
  ): Promise<{
    score: number;
    feedback: string;
    suggestions: string[];
    issues: Array<{
      type: 'error' | 'warning' | 'suggestion';
      line: number;
      message: string;
    }>;
  }> {
    try {
      const prompt = `Please review this ${language} code and provide detailed feedback:

Code:
\`\`\`${language}
${code}
\`\`\`

${requirements ? `Requirements: ${requirements}` : ''}

Please provide:
1. A score from 1-10
2. Detailed feedback on code quality, logic, and best practices
3. Specific suggestions for improvement
4. Any issues found with line numbers and descriptions

Format your response as JSON with the following structure:
{
  "score": number,
  "feedback": "string",
  "suggestions": ["string"],
  "issues": [{"type": "error|warning|suggestion", "line": number, "message": "string"}]
}`;

      const response = await openai.chat.completions.create({
        model: SHANGO_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer. Provide constructive, educational feedback that helps students learn and improve their coding skills.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const aiResponse = response.choices[0]?.message?.content || '{}';
      
      try {
        const parsed = JSON.parse(aiResponse);
        return {
          score: parsed.score || 5,
          feedback: parsed.feedback || 'No feedback available',
          suggestions: parsed.suggestions || [],
          issues: parsed.issues || [],
        };
      } catch (parseError) {
        logger.warn('Failed to parse AI code review response:', parseError);
        return {
          score: 5,
          feedback: aiResponse,
          suggestions: [],
          issues: [],
        };
      }
    } catch (error) {
      logger.error('Error reviewing code:', error);
      throw new Error('Failed to review code');
    }
  }

  /**
   * Generate exercise solutions
   */
  async generateExerciseSolution(
    exercise: {
      title: string;
      description: string;
      instructions: string;
      language: string;
      difficulty: string;
    }
  ): Promise<{
    solution: string;
    explanation: string;
    testCases: Array<{
      input: string;
      expectedOutput: string;
      description: string;
    }>;
  }> {
    try {
      const prompt = `Generate a complete solution for this programming exercise:

Title: ${exercise.title}
Description: ${exercise.description}
Instructions: ${exercise.instructions}
Language: ${exercise.language}
Difficulty: ${exercise.difficulty}

Please provide:
1. A complete, working solution
2. A detailed explanation of the approach
3. Test cases with inputs and expected outputs

Format your response as JSON with the following structure:
{
  "solution": "code here",
  "explanation": "detailed explanation",
  "testCases": [{"input": "string", "expectedOutput": "string", "description": "string"}]
}`;

      const response = await openai.chat.completions.create({
        model: SHANGO_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert programming instructor. Generate clear, educational solutions that help students understand the concepts.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 2000,
      });

      const aiResponse = response.choices[0]?.message?.content || '{}';
      
      try {
        const parsed = JSON.parse(aiResponse);
        return {
          solution: parsed.solution || '',
          explanation: parsed.explanation || '',
          testCases: parsed.testCases || [],
        };
      } catch (parseError) {
        logger.warn('Failed to parse AI exercise solution response:', parseError);
        return {
          solution: aiResponse,
          explanation: 'Solution generated by AI',
          testCases: [],
        };
      }
    } catch (error) {
      logger.error('Error generating exercise solution:', error);
      throw new Error('Failed to generate exercise solution');
    }
  }

  /**
   * Build coding assistance prompt
   */
  private buildCodingPrompt(question: string, context: any): string {
    let prompt = `Student Question: ${question}`;
    
    if (context.language) {
      prompt += `\nProgramming Language: ${context.language}`;
    }
    
    if (context.code) {
      prompt += `\nCurrent Code:\n\`\`\`${context.language || 'javascript'}\n${context.code}\n\`\`\``;
    }
    
    if (context.lessonId) {
      prompt += `\nLesson Context: This is related to lesson ${context.lessonId}`;
    }
    
    return prompt;
  }

  /**
   * Parse AI response to extract code and explanations
   */
  private parseAIResponse(response: string): {
    code?: string;
    explanation?: string;
    suggestions?: string[];
  } {
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeBlocks: string[] = [];
    let match;
    
    while ((match = codeRegex.exec(response)) !== null) {
      codeBlocks.push(match[2]);
    }
    
    // Extract suggestions (lines starting with bullet points or numbers)
    const suggestionRegex = /^[\s]*[•\-\*\d+\.]\s*(.+)$/gm;
    const suggestions: string[] = [];
    let suggestionMatch;
    
    while ((suggestionMatch = suggestionRegex.exec(response)) !== null) {
      suggestions.push(suggestionMatch[1].trim());
    }
    
    return {
      code: codeBlocks[0] || undefined,
      explanation: response.replace(codeRegex, '').trim(),
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }
}

// Initialize AI service
export const initializeAI = () => {
  const aiService = AIService.getInstance();
  logger.info('AI services initialized successfully');
  return aiService;
};

export default AIService;
