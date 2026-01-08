// Redaction & Data Loss Prevention (DLP) Service
// Scrubs PII, PHI, and PCI data from text and audio streams

export interface RedactionRequest {
  content: string;
  contentType: 'text' | 'audio';
  dataTypes: DataType[];
  tenantId: string;
  callId?: string;
}

export type DataType = 'pii' | 'phi' | 'pci' | 'ssn' | 'credit_card' | 'bank_account' | 'phone' | 'email' | 'date_of_birth' | 'medical_record_number';

export interface RedactionResult {
  redactedContent: string;
  redactedItems: RedactedItem[];
  originalLength: number;
  redactedLength: number;
}

export interface RedactedItem {
  type: DataType;
  original: string;
  position: { start: number; end: number };
  replacement: string;
}

class RedactionDLPService {
  // Regex patterns for different data types
  private patterns: Map<DataType, RegExp[]> = new Map();

  constructor() {
    this.initializePatterns();
  }

  /**
   * Initialize regex patterns for data detection
   */
  private initializePatterns() {
    // SSN (XXX-XX-XXXX or XXXXXXXXX)
    this.patterns.set('ssn', [
      /\b\d{3}-\d{2}-\d{4}\b/g,
      /\b\d{9}\b/g
    ]);

    // Credit Card (16 digits, various formats)
    this.patterns.set('credit_card', [
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      /\b\d{13,19}\b/g
    ]);

    // Bank Account (8-17 digits)
    this.patterns.set('bank_account', [
      /\b\d{8,17}\b/g
    ]);

    // Phone Number (various formats)
    this.patterns.set('phone', [
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      /\b\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g
    ]);

    // Email
    this.patterns.set('email', [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    ]);

    // Date of Birth (MM/DD/YYYY, MM-DD-YYYY, etc.)
    this.patterns.set('date_of_birth', [
      /\b(0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])[\/\-]\d{4}\b/g,
      /\b\d{4}[\/\-](0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])\b/g
    ]);

    // Medical Record Number (alphanumeric, various formats)
    this.patterns.set('medical_record_number', [
      /\b[A-Z]{2,4}\d{6,10}\b/g,
      /\bMRN[-.\s]?\d{6,10}\b/gi
    ]);
  }

  /**
   * Redact sensitive data from text
   */
  async redactText(request: RedactionRequest): Promise<RedactionResult> {
    let content = request.content;
    const redactedItems: RedactedItem[] = [];
    const originalLength = content.length;

    // Determine which patterns to use based on requested data types
    const typesToCheck = this.expandDataTypes(request.dataTypes);

    for (const dataType of typesToCheck) {
      const patterns = this.patterns.get(dataType);
      if (!patterns) continue;

      for (const pattern of patterns) {
        const matches = content.matchAll(pattern);
        
        for (const match of matches) {
          if (match.index === undefined) continue;

          const original = match[0];
          const replacement = this.getReplacement(dataType, original);
          
          // Only redact if not already redacted
          if (!this.isAlreadyRedacted(original)) {
            redactedItems.push({
              type: dataType,
              original,
              position: {
                start: match.index,
                end: match.index + original.length
              },
              replacement
            });

            // Replace in content
            content = content.replace(original, replacement);
          }
        }
      }
    }

    // Sort redacted items by position (reverse order for safe replacement)
    redactedItems.sort((a, b) => b.position.start - a.position.start);

    return {
      redactedContent: content,
      redactedItems,
      originalLength,
      redactedLength: content.length
    };
  }

  /**
   * Redact sensitive data from audio stream (placeholder for future implementation)
   */
  async redactAudioStream(audioStream: ReadableStream, request: RedactionRequest): Promise<ReadableStream> {
    // In production, this would:
    // 1. Transcribe audio to text
    // 2. Redact text
    // 3. Use TTS to regenerate audio with redacted content
    // 4. Return redacted audio stream
    
    // For now, return original stream
    return audioStream;
  }

  /**
   * Expand data type groups (e.g., 'pii' includes multiple types)
   */
  private expandDataTypes(types: DataType[]): DataType[] {
    const expanded: DataType[] = [];

    for (const type of types) {
      switch (type) {
        case 'pii':
          expanded.push('ssn', 'phone', 'email', 'date_of_birth');
          break;
        case 'phi':
          expanded.push('ssn', 'date_of_birth', 'medical_record_number', 'phone', 'email');
          break;
        case 'pci':
          expanded.push('credit_card', 'bank_account');
          break;
        default:
          expanded.push(type);
      }
    }

    // Remove duplicates
    return [...new Set(expanded)];
  }

  /**
   * Get replacement string for redacted data
   */
  private getReplacement(dataType: DataType, original: string): string {
    switch (dataType) {
      case 'ssn':
        return '[SSN-REDACTED]';
      case 'credit_card':
        return '[CARD-REDACTED]';
      case 'bank_account':
        return '[ACCOUNT-REDACTED]';
      case 'phone':
        return '[PHONE-REDACTED]';
      case 'email':
        return '[EMAIL-REDACTED]';
      case 'date_of_birth':
        return '[DOB-REDACTED]';
      case 'medical_record_number':
        return '[MRN-REDACTED]';
      default:
        return '[REDACTED]';
    }
  }

  /**
   * Check if content is already redacted
   */
  private isAlreadyRedacted(content: string): boolean {
    return content.includes('[REDACTED]') || 
           content.includes('***') ||
           content.match(/^\*+$/) !== null;
  }

  /**
   * Detect sensitive data types in content
   */
  async detectSensitiveData(content: string): Promise<DataType[]> {
    const detectedTypes: Set<DataType> = new Set();

    for (const [dataType, patterns] of this.patterns.entries()) {
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          detectedTypes.add(dataType);
          break;
        }
      }
    }

    // Map specific types to categories
    const categories: DataType[] = [];
    if (detectedTypes.has('ssn') || detectedTypes.has('phone') || detectedTypes.has('email') || detectedTypes.has('date_of_birth')) {
      categories.push('pii');
    }
    if (detectedTypes.has('ssn') || detectedTypes.has('medical_record_number') || detectedTypes.has('date_of_birth')) {
      categories.push('phi');
    }
    if (detectedTypes.has('credit_card') || detectedTypes.has('bank_account')) {
      categories.push('pci');
    }

    return [...new Set([...categories, ...Array.from(detectedTypes)])];
  }

  /**
   * Redact with context-aware rules (advanced)
   */
  async redactWithContext(
    content: string,
    context: {
      industry?: string;
      tenantId: string;
      callId?: string;
    }
  ): Promise<RedactionResult> {
    // Determine data types based on industry
    let dataTypes: DataType[] = ['pii'];

    switch (context.industry) {
      case 'healthcare':
        dataTypes = ['phi', 'pii'];
        break;
      case 'insurance':
      case 'finance':
        dataTypes = ['pci', 'pii'];
        break;
      default:
        dataTypes = ['pii'];
    }

    return this.redactText({
      content,
      contentType: 'text',
      dataTypes,
      tenantId: context.tenantId,
      callId: context.callId
    });
  }

  /**
   * Validate redaction completeness
   */
  async validateRedaction(original: string, redacted: string): Promise<{
    valid: boolean;
    remainingSensitiveData: DataType[];
  }> {
    const detectedInOriginal = await this.detectSensitiveData(original);
    const detectedInRedacted = await this.detectSensitiveData(redacted);

    const remainingSensitiveData = detectedInRedacted.filter(
      type => detectedInOriginal.includes(type)
    );

    return {
      valid: remainingSensitiveData.length === 0,
      remainingSensitiveData
    };
  }
}

export const redactionDLPService = new RedactionDLPService();
