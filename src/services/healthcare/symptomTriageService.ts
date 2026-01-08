// Symptom Triage Service
// Clinical decision trees for symptom assessment and severity determination
// Based on standardized triage protocols

import { clinicalWorkflowService } from './clinicalWorkflowService';
import { ehrDocumentationService } from './ehrDocumentationService';
import { auditEvidenceService } from '../compliance/auditEvidenceService';

export interface TriageQuestion {
  questionId: string;
  questionText: string;
  responseType: 'yes_no' | 'scale_1_10' | 'multiple_choice' | 'free_text';
  options?: string[]; // For multiple_choice
  nextQuestion?: string; // Question ID to go to based on response
  escalationCondition?: {
    response: string | number; // Response value that triggers escalation
    severity: 'low' | 'medium' | 'high' | 'urgent';
    action: 'home_care' | 'schedule_appointment' | 'escalate_nurse' | 'emergency' | 'immediate_care';
    message?: string;
  };
  required: boolean;
}

export interface ClinicalDecisionTree {
  treeId: string;
  condition: string; // e.g., "chest_pain", "fever", "shortness_of_breath", "abdominal_pain"
  displayName: string;
  questions: TriageQuestion[];
  initialQuestion: string; // Question ID to start with
  escalationRules: Array<{
    condition: string; // e.g., "chest_pain AND duration > 30_minutes"
    severity: 'low' | 'medium' | 'high' | 'urgent';
    action: 'home_care' | 'schedule_appointment' | 'escalate_nurse' | 'emergency' | 'immediate_care';
    message: string;
  }>;
  language: string;
}

export interface TriageSession {
  sessionId: string;
  patientId: string;
  treeId: string;
  currentQuestionId: string;
  responses: Map<string, string | number>;
  severity: 'low' | 'medium' | 'high' | 'urgent' | null;
  recommendation: 'home_care' | 'schedule_appointment' | 'escalate_nurse' | 'emergency' | 'immediate_care' | null;
  startedAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface TriageResult {
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  recommendation: 'home_care' | 'schedule_appointment' | 'escalate_nurse' | 'emergency' | 'immediate_care';
  message: string;
  nextSteps: string[];
  requiresEscalation: boolean;
  escalationReason?: string;
}

class SymptomTriageService {
  private decisionTrees: Map<string, ClinicalDecisionTree> = new Map();
  private activeSessions: Map<string, TriageSession> = new Map();

  constructor() {
    this.initializeDecisionTrees();
  }

  /**
   * Initialize clinical decision trees
   */
  private initializeDecisionTrees() {
    // Chest Pain Decision Tree
    this.decisionTrees.set('chest_pain', {
      treeId: 'chest_pain',
      condition: 'chest_pain',
      displayName: 'Chest Pain Assessment',
      language: 'en-US',
      initialQuestion: 'chest_pain_duration',
      questions: [
        {
          questionId: 'chest_pain_duration',
          questionText: 'How long have you been experiencing chest pain?',
          responseType: 'multiple_choice',
          options: ['Less than 5 minutes', '5 to 30 minutes', '30 minutes to 2 hours', 'More than 2 hours'],
          required: true,
          escalationCondition: {
            response: 'Less than 5 minutes',
            severity: 'urgent',
            action: 'emergency',
            message: 'Chest pain of less than 5 minutes may indicate a heart attack. Please call 911 or go to the emergency room immediately.'
          }
        },
        {
          questionId: 'chest_pain_severity',
          questionText: 'On a scale of 1 to 10, how severe is your chest pain?',
          responseType: 'scale_1_10',
          required: true,
          escalationCondition: {
            response: 8, // 8 or higher
            severity: 'urgent',
            action: 'emergency',
            message: 'Severe chest pain requires immediate medical attention. Please call 911 or go to the emergency room.'
          }
        },
        {
          questionId: 'associated_symptoms',
          questionText: 'Are you experiencing any of the following: shortness of breath, nausea, sweating, or pain radiating to your arm or jaw?',
          responseType: 'yes_no',
          required: true,
          escalationCondition: {
            response: 'yes',
            severity: 'urgent',
            action: 'emergency',
            message: 'Chest pain with associated symptoms may indicate a serious condition. Please seek immediate medical attention.'
          }
        },
        {
          questionId: 'chest_pain_location',
          questionText: 'Where is the pain located?',
          responseType: 'multiple_choice',
          options: ['Center of chest', 'Left side', 'Right side', 'Both sides'],
          required: true
        },
        {
          questionId: 'chest_pain_trigger',
          questionText: 'What makes the pain worse?',
          responseType: 'multiple_choice',
          options: ['Physical activity', 'Deep breathing', 'Lying down', 'Nothing specific'],
          required: false
        }
      ],
      escalationRules: [
        {
          condition: 'chest_pain_duration == "Less than 5 minutes"',
          severity: 'urgent',
          action: 'emergency',
          message: 'Immediate emergency care required'
        },
        {
          condition: 'chest_pain_severity >= 8',
          severity: 'urgent',
          action: 'emergency',
          message: 'Severe pain requires emergency care'
        },
        {
          condition: 'associated_symptoms == "yes"',
          severity: 'urgent',
          action: 'emergency',
          message: 'Associated symptoms indicate urgent care needed'
        },
        {
          condition: 'chest_pain_duration == "30 minutes to 2 hours" AND chest_pain_severity >= 5',
          severity: 'high',
          action: 'immediate_care',
          message: 'Schedule urgent appointment or visit urgent care'
        },
        {
          condition: 'chest_pain_duration == "More than 2 hours" AND chest_pain_severity < 5',
          severity: 'medium',
          action: 'schedule_appointment',
          message: 'Schedule appointment within 24-48 hours'
        }
      ]
    });

    // Fever Decision Tree
    this.decisionTrees.set('fever', {
      treeId: 'fever',
      condition: 'fever',
      displayName: 'Fever Assessment',
      language: 'en-US',
      initialQuestion: 'fever_temperature',
      questions: [
        {
          questionId: 'fever_temperature',
          questionText: 'What is your current temperature?',
          responseType: 'multiple_choice',
          options: ['Below 100.4°F (38°C)', '100.4°F to 102°F (38-39°C)', '102°F to 104°F (39-40°C)', 'Above 104°F (40°C)'],
          required: true,
          escalationCondition: {
            response: 'Above 104°F (40°C)',
            severity: 'urgent',
            action: 'emergency',
            message: 'High fever requires immediate medical attention. Please seek emergency care.'
          }
        },
        {
          questionId: 'fever_duration',
          questionText: 'How long have you had the fever?',
          responseType: 'multiple_choice',
          options: ['Less than 24 hours', '1 to 3 days', '3 to 7 days', 'More than 7 days'],
          required: true
        },
        {
          questionId: 'fever_symptoms',
          questionText: 'Are you experiencing any of the following: severe headache, stiff neck, difficulty breathing, or rash?',
          responseType: 'yes_no',
          required: true,
          escalationCondition: {
            response: 'yes',
            severity: 'high',
            action: 'immediate_care',
            message: 'Fever with these symptoms requires prompt medical evaluation.'
          }
        }
      ],
      escalationRules: [
        {
          condition: 'fever_temperature == "Above 104°F (40°C)"',
          severity: 'urgent',
          action: 'emergency',
          message: 'High fever requires emergency care'
        },
        {
          condition: 'fever_duration == "More than 7 days"',
          severity: 'high',
          action: 'schedule_appointment',
          message: 'Prolonged fever requires medical evaluation'
        },
        {
          condition: 'fever_symptoms == "yes"',
          severity: 'high',
          action: 'immediate_care',
          message: 'Fever with associated symptoms needs prompt care'
        }
      ]
    });

    // Shortness of Breath Decision Tree
    this.decisionTrees.set('shortness_of_breath', {
      treeId: 'shortness_of_breath',
      condition: 'shortness_of_breath',
      displayName: 'Shortness of Breath Assessment',
      language: 'en-US',
      initialQuestion: 'sob_severity',
      questions: [
        {
          questionId: 'sob_severity',
          questionText: 'On a scale of 1 to 10, how severe is your shortness of breath?',
          responseType: 'scale_1_10',
          required: true,
          escalationCondition: {
            response: 8,
            severity: 'urgent',
            action: 'emergency',
            message: 'Severe shortness of breath requires immediate medical attention. Please call 911 or go to the emergency room.'
          }
        },
        {
          questionId: 'sob_onset',
          questionText: 'Did the shortness of breath come on suddenly?',
          responseType: 'yes_no',
          required: true,
          escalationCondition: {
            response: 'yes',
            severity: 'urgent',
            action: 'emergency',
            message: 'Sudden onset shortness of breath may indicate a serious condition. Please seek immediate medical attention.'
          }
        },
        {
          questionId: 'sob_activity',
          questionText: 'Does the shortness of breath occur at rest or only with activity?',
          responseType: 'multiple_choice',
          options: ['At rest', 'With mild activity', 'With moderate activity', 'Only with strenuous activity'],
          required: true
        },
        {
          questionId: 'sob_associated',
          questionText: 'Are you experiencing chest pain, dizziness, or blue lips?',
          responseType: 'yes_no',
          required: true,
          escalationCondition: {
            response: 'yes',
            severity: 'urgent',
            action: 'emergency',
            message: 'Shortness of breath with these symptoms requires immediate emergency care.'
          }
        }
      ],
      escalationRules: [
        {
          condition: 'sob_severity >= 8',
          severity: 'urgent',
          action: 'emergency',
          message: 'Severe shortness of breath requires emergency care'
        },
        {
          condition: 'sob_onset == "yes"',
          severity: 'urgent',
          action: 'emergency',
          message: 'Sudden onset requires emergency evaluation'
        },
        {
          condition: 'sob_activity == "At rest"',
          severity: 'high',
          action: 'immediate_care',
          message: 'Shortness of breath at rest needs prompt evaluation'
        }
      ]
    });
  }

  /**
   * Start a triage session
   */
  async startTriageSession(
    tenantId: string,
    patientId: string,
    condition: string,
    metadata?: Record<string, any>
  ): Promise<TriageSession> {
    const tree = this.decisionTrees.get(condition);
    if (!tree) {
      throw new Error(`Decision tree not found for condition: ${condition}`);
    }

    const session: TriageSession = {
      sessionId: `TRIAGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      treeId: tree.treeId,
      currentQuestionId: tree.initialQuestion,
      responses: new Map(),
      severity: null,
      recommendation: null,
      startedAt: new Date(),
      metadata
    };

    this.activeSessions.set(session.sessionId, session);

    // Log triage start
    await auditEvidenceService.logEvent({
      tenantId,
      callId: session.sessionId,
      eventType: 'data.access',
      eventData: {
        action: 'triage_session_started',
        condition,
        patientId,
        sessionId: session.sessionId
      },
      metadata: {
        service: 'symptom_triage'
      }
    });

    return session;
  }

  /**
   * Answer a triage question
   */
  async answerQuestion(
    tenantId: string,
    sessionId: string,
    questionId: string,
    answer: string | number
  ): Promise<{
    nextQuestion?: TriageQuestion;
    triageResult?: TriageResult;
    escalated: boolean;
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Triage session not found: ${sessionId}`);
    }

    const tree = this.decisionTrees.get(session.treeId);
    if (!tree) {
      throw new Error(`Decision tree not found: ${session.treeId}`);
    }

    const question = tree.questions.find(q => q.questionId === questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    // Store response
    session.responses.set(questionId, answer);

    // Check for escalation condition
    if (question.escalationCondition) {
      const shouldEscalate = this.evaluateEscalationCondition(
        question.escalationCondition,
        answer
      );

      if (shouldEscalate) {
        // Complete triage with escalation
        const result = await this.completeTriageSession(
          tenantId,
          sessionId,
          question.escalationCondition.severity,
          question.escalationCondition.action,
          question.escalationCondition.message
        );

        return {
          triageResult: result,
          escalated: true
        };
      }
    }

    // Determine next question
    const nextQuestionId = question.nextQuestion || this.determineNextQuestion(tree, session);
    
    if (!nextQuestionId) {
      // No more questions, evaluate and complete
      const result = await this.evaluateAndCompleteTriage(tenantId, sessionId, tree);
      return {
        triageResult: result,
        escalated: result.requiresEscalation
      };
    }

    const nextQuestion = tree.questions.find(q => q.questionId === nextQuestionId);
    session.currentQuestionId = nextQuestionId;

    return {
      nextQuestion,
      escalated: false
    };
  }

  /**
   * Evaluate and complete triage session
   */
  private async evaluateAndCompleteTriage(
    tenantId: string,
    sessionId: string,
    tree: ClinicalDecisionTree
  ): Promise<TriageResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Triage session not found: ${sessionId}`);
    }

    // Evaluate escalation rules
    let severity: 'low' | 'medium' | 'high' | 'urgent' = 'low';
    let recommendation: 'home_care' | 'schedule_appointment' | 'escalate_nurse' | 'emergency' | 'immediate_care' = 'home_care';
    let message = 'Based on your symptoms, home care is recommended.';
    let requiresEscalation = false;
    let escalationReason: string | undefined;

    // Check escalation rules in priority order (urgent first)
    for (const rule of tree.escalationRules.sort((a, b) => {
      const priority: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priority[b.severity] - priority[a.severity];
    })) {
      if (this.evaluateRuleCondition(rule.condition, session.responses)) {
        severity = rule.severity;
        recommendation = rule.action;
        message = rule.message;
        requiresEscalation = rule.severity === 'urgent' || rule.severity === 'high';
        escalationReason = rule.message;
        break;
      }
    }

    // Update session
    session.severity = severity;
    session.recommendation = recommendation;
    session.completedAt = new Date();

    // Determine next steps
    const nextSteps = this.getNextSteps(recommendation, severity);

    const result: TriageResult = {
      sessionId,
      severity,
      recommendation,
      message,
      nextSteps,
      requiresEscalation,
      escalationReason
    };

    // Trigger clinical workflow if needed
    if (requiresEscalation) {
      const workflowCondition = `${tree.condition}_${severity}`;
      await clinicalWorkflowService.evaluateAndTrigger(
        tenantId,
        session.patientId,
        workflowCondition,
        {
          callId: sessionId,
          severity,
          message: escalationReason,
          metadata: {
            triageSessionId: sessionId,
            condition: tree.condition,
            responses: Object.fromEntries(session.responses)
          }
        }
      );
    }

    // Document triage to EHR
    try {
      const note = ehrDocumentationService.createStructuredNote(
        session.patientId,
        'triage',
        {
          chiefComplaint: tree.displayName,
          symptoms: [tree.condition],
          triageSeverity: severity,
          assessment: `Triage assessment: ${message}`,
          plan: `Recommendation: ${recommendation}. Next steps: ${nextSteps.join(', ')}`
        },
        undefined,
        undefined
      );

      await ehrDocumentationService.documentToEHR(tenantId, note);
    } catch (error) {
      console.error('Failed to document triage to EHR:', error);
      // Continue even if EHR documentation fails
    }

    // Log triage completion
    await auditEvidenceService.logEvent({
      tenantId,
      callId: sessionId,
      eventType: 'data.access',
      eventData: {
        action: 'triage_completed',
        sessionId,
        condition: tree.condition,
        severity,
        recommendation,
        requiresEscalation
      },
      metadata: {
        service: 'symptom_triage'
      }
    });

    return result;
  }

  /**
   * Complete triage session with specific result
   */
  private async completeTriageSession(
    tenantId: string,
    sessionId: string,
    severity: 'low' | 'medium' | 'high' | 'urgent',
    recommendation: 'home_care' | 'schedule_appointment' | 'escalate_nurse' | 'emergency' | 'immediate_care',
    message: string
  ): Promise<TriageResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Triage session not found: ${sessionId}`);
    }

    session.severity = severity;
    session.recommendation = recommendation;
    session.completedAt = new Date();

    const nextSteps = this.getNextSteps(recommendation, severity);
    const requiresEscalation = severity === 'urgent' || severity === 'high';

    const result: TriageResult = {
      sessionId,
      severity,
      recommendation,
      message,
      nextSteps,
      requiresEscalation,
      escalationReason: requiresEscalation ? message : undefined
    };

    // Trigger workflow if needed
    if (requiresEscalation) {
      const tree = this.decisionTrees.get(session.treeId);
      const workflowCondition = `${tree?.condition || 'symptom'}_${severity}`;
      
      await clinicalWorkflowService.evaluateAndTrigger(
        tenantId,
        session.patientId,
        workflowCondition,
        {
          callId: sessionId,
          severity,
          message,
          metadata: {
            triageSessionId: sessionId,
            recommendation
          }
        }
      );
    }

    return result;
  }

  /**
   * Evaluate escalation condition
   */
  private evaluateEscalationCondition(
    condition: TriageQuestion['escalationCondition'],
    answer: string | number
  ): boolean {
    if (!condition) return false;

    if (typeof condition.response === 'number' && typeof answer === 'number') {
      return answer >= condition.response;
    }

    if (typeof condition.response === 'string' && typeof answer === 'string') {
      return answer.toLowerCase() === condition.response.toLowerCase();
    }

    return false;
  }

  /**
   * Evaluate rule condition
   */
  private evaluateRuleCondition(
    condition: string,
    responses: Map<string, string | number>
  ): boolean {
    // Simple condition evaluation (in production, use a proper expression evaluator)
    // Format: "questionId == value" or "questionId >= value" or "questionId AND questionId2"
    
    try {
      // Split by AND/OR operators
      const parts = condition.split(/\s+(AND|OR)\s+/);
      
      for (let i = 0; i < parts.length; i += 2) {
        const part = parts[i].trim();
        let result = false;

        // Check comparison operators
        if (part.includes('>=')) {
          const [questionId, value] = part.split('>=').map(s => s.trim());
          const response = responses.get(questionId);
          if (typeof response === 'number') {
            result = response >= parseFloat(value);
          }
        } else if (part.includes('==')) {
          const [questionId, value] = part.split('==').map(s => s.trim().replace(/"/g, ''));
          const response = responses.get(questionId);
          result = String(response) === value;
        } else if (part.includes('!=')) {
          const [questionId, value] = part.split('!=').map(s => s.trim().replace(/"/g, ''));
          const response = responses.get(questionId);
          result = String(response) !== value;
        }

        // Handle AND/OR logic
        if (i > 0) {
          const operator = parts[i - 1];
          // For simplicity, assume AND for now (can be enhanced)
          if (!result && operator === 'AND') {
            return false;
          }
        } else if (!result) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error evaluating rule condition:', error);
      return false;
    }
  }

  /**
   * Determine next question based on responses
   */
  private determineNextQuestion(
    tree: ClinicalDecisionTree,
    session: TriageSession
  ): string | undefined {
    // Simple logic: return next unanswered question
    const answeredQuestionIds = Array.from(session.responses.keys());
    const unansweredQuestion = tree.questions.find(
      q => !answeredQuestionIds.includes(q.questionId) && q.questionId !== session.currentQuestionId
    );

    return unansweredQuestion?.questionId;
  }

  /**
   * Get next steps based on recommendation
   */
  private getNextSteps(
    recommendation: TriageResult['recommendation'],
    severity: TriageResult['severity']
  ): string[] {
    switch (recommendation) {
      case 'emergency':
        return [
          'Call 911 or go to the nearest emergency room immediately',
          'Do not drive yourself - have someone drive you or call an ambulance',
          'Bring a list of current medications'
        ];

      case 'immediate_care':
        return [
          'Visit urgent care center or schedule same-day appointment',
          'Monitor symptoms closely',
          'Call back if symptoms worsen'
        ];

      case 'schedule_appointment':
        return [
          'Schedule appointment within 24-48 hours',
          'Monitor symptoms',
          'Call back if symptoms worsen or new symptoms develop'
        ];

      case 'escalate_nurse':
        return [
          'A nurse will call you back within 1-2 hours',
          'Monitor symptoms',
          'Call 911 if symptoms worsen'
        ];

      case 'home_care':
        return [
          'Rest and monitor symptoms',
          'Follow home care instructions',
          'Call back if symptoms persist or worsen',
          'Schedule appointment if no improvement in 2-3 days'
        ];

      default:
        return ['Follow up with your healthcare provider'];
    }
  }

  /**
   * Get available decision trees
   */
  getAvailableTrees(): Array<{ treeId: string; condition: string; displayName: string }> {
    return Array.from(this.decisionTrees.values()).map(tree => ({
      treeId: tree.treeId,
      condition: tree.condition,
      displayName: tree.displayName
    }));
  }

  /**
   * Get current question for session
   */
  getCurrentQuestion(sessionId: string): TriageQuestion | undefined {
    const session = this.activeSessions.get(sessionId);
    if (!session) return undefined;

    const tree = this.decisionTrees.get(session.treeId);
    if (!tree) return undefined;

    return tree.questions.find(q => q.questionId === session.currentQuestionId);
  }

  /**
   * Get triage session
   */
  getSession(sessionId: string): TriageSession | undefined {
    return this.activeSessions.get(sessionId);
  }
}

export const symptomTriageService = new SymptomTriageService();

