// TCPA Compliance Service
// Validates contacts against DNC lists, enforces time zone restrictions, and ensures consent

import { auditEvidenceService } from '../compliance/auditEvidenceService';
import { consentManagementService } from '../compliance/consentManagementService';
// Note: In production, use a timezone lookup service or library
// For now, using area code to timezone mapping

export interface ContactValidation {
  phoneNumber: string;
  isValid: boolean;
  reason?: string;
  timezone?: string;
  isMobile?: boolean;
  dncStatus?: 'not_listed' | 'listed' | 'unknown';
  consentStatus?: 'granted' | 'missing' | 'expired' | 'revoked';
  safeToCall?: boolean;
  nextSafeCallTime?: Date;
}

export interface DNCListEntry {
  phoneNumber: string;
  addedAt: Date;
  source: 'ftc' | 'carrier' | 'internal' | 'customer_request';
  expiresAt?: Date;
}

export interface TCPAComplianceConfig {
  enforceTimeZoneRestrictions: boolean;
  callingHoursStart: number; // 8 = 8 AM
  callingHoursEnd: number; // 21 = 9 PM
  requireConsentForMobile: boolean;
  dncListUpdateInterval: number; // milliseconds
  timezoneLookupEnabled: boolean;
}

class TCPAComplianceService {
  private dncList: Map<string, DNCListEntry> = new Map();
  private config: TCPAComplianceConfig;
  private timezoneCache: Map<string, string> = new Map();

  constructor(config?: Partial<TCPAComplianceConfig>) {
    this.config = {
      enforceTimeZoneRestrictions: true,
      callingHoursStart: 8,
      callingHoursEnd: 21,
      requireConsentForMobile: true,
      dncListUpdateInterval: 24 * 60 * 60 * 1000, // 24 hours
      timezoneLookupEnabled: true,
      ...config
    };
  }

  /**
   * Validate contact before dialing
   */
  async validateContact(
    tenantId: string,
    phoneNumber: string,
    callTime?: Date
  ): Promise<ContactValidation> {
    const validation: ContactValidation = {
      phoneNumber,
      isValid: false,
      safeToCall: false
    };

    // 1. Check DNC list
    const dncStatus = this.checkDNCList(phoneNumber);
    validation.dncStatus = dncStatus;

    if (dncStatus === 'listed') {
      validation.isValid = false;
      validation.reason = 'Contact is on Do Not Call list';
      validation.safeToCall = false;
      return validation;
    }

    // 2. Detect if mobile number
    const isMobile = await this.isMobileNumber(phoneNumber);
    validation.isMobile = isMobile;

    // 3. Check consent for mobile numbers
    if (isMobile && this.config.requireConsentForMobile) {
      const consentStatus = await this.checkConsent(tenantId, phoneNumber);
      validation.consentStatus = consentStatus;

      if (consentStatus !== 'granted') {
        validation.isValid = false;
        validation.reason = `No prior express written consent for mobile number (status: ${consentStatus})`;
        validation.safeToCall = false;
        return validation;
      }
    }

    // 4. Check time zone restrictions
    if (this.config.enforceTimeZoneRestrictions) {
      const timezoneCheck = await this.checkTimeZoneRestrictions(phoneNumber, callTime || new Date());
      validation.timezone = timezoneCheck.timezone;

      if (!timezoneCheck.isWithinHours) {
        validation.isValid = false;
        validation.reason = `Outside calling hours for recipient timezone (${timezoneCheck.currentTime} in ${timezoneCheck.timezone})`;
        validation.safeToCall = false;
        validation.nextSafeCallTime = timezoneCheck.nextSafeCallTime;
        return validation;
      }
    }

    // All checks passed
    validation.isValid = true;
    validation.safeToCall = true;
    validation.dncStatus = dncStatus || 'not_listed';

    // Log validation
    await auditEvidenceService.logEvent({
      tenantId,
      callId: phoneNumber,
      eventType: 'data.access',
      eventData: {
        action: 'tcpa_contact_validation',
        phoneNumber,
        isValid: validation.isValid,
        reason: validation.reason,
        isMobile,
        dncStatus: validation.dncStatus
      },
      metadata: {
        service: 'tcpa_compliance'
      }
    });

    return validation;
  }

  /**
   * Check if phone number is on DNC list
   */
  private checkDNCList(phoneNumber: string): 'not_listed' | 'listed' | 'unknown' {
    // Normalize phone number
    const normalized = this.normalizePhoneNumber(phoneNumber);
    
    const entry = this.dncList.get(normalized);
    if (entry) {
      // Check if entry has expired
      if (entry.expiresAt && entry.expiresAt < new Date()) {
        this.dncList.delete(normalized);
        return 'not_listed';
      }
      return 'listed';
    }

    return 'not_listed';
  }

  /**
   * Add phone number to DNC list
   */
  async addToDNCList(
    tenantId: string,
    phoneNumber: string,
    source: DNCListEntry['source'] = 'customer_request',
    expiresAt?: Date
  ): Promise<void> {
    const normalized = this.normalizePhoneNumber(phoneNumber);
    
    const entry: DNCListEntry = {
      phoneNumber: normalized,
      addedAt: new Date(),
      source,
      expiresAt
    };

    this.dncList.set(normalized, entry);

    // Log DNC addition
    await auditEvidenceService.logEvent({
      tenantId,
      callId: phoneNumber,
      eventType: 'data.access',
      eventData: {
        action: 'dnc_list_added',
        phoneNumber: normalized,
        source
      },
      metadata: {
        service: 'tcpa_compliance'
      }
    });
  }

  /**
   * Remove phone number from DNC list
   */
  async removeFromDNCList(tenantId: string, phoneNumber: string): Promise<void> {
    const normalized = this.normalizePhoneNumber(phoneNumber);
    this.dncList.delete(normalized);

    await auditEvidenceService.logEvent({
      tenantId,
      callId: phoneNumber,
      eventType: 'data.access',
      eventData: {
        action: 'dnc_list_removed',
        phoneNumber: normalized
      },
      metadata: {
        service: 'tcpa_compliance'
      }
    });
  }

  /**
   * Check consent status for phone number
   */
  private async checkConsent(
    tenantId: string,
    phoneNumber: string
  ): Promise<'granted' | 'missing' | 'expired' | 'revoked'> {
    try {
      const consentStatus = await consentManagementService.getConsentStatus(
        tenantId,
        phoneNumber
      );

      // Check for marketing communications consent
      const marketingConsent = consentStatus.consents.find(
        c => c.consentType === 'marketing_communications' && c.channel === 'voice'
      );

      if (!marketingConsent) {
        return 'missing';
      }

      if (!marketingConsent.granted) {
        return 'revoked';
      }

      if (marketingConsent.expiresAt && marketingConsent.expiresAt < new Date()) {
        return 'expired';
      }

      return 'granted';
    } catch (error) {
      console.error('Error checking consent:', error);
      return 'missing';
    }
  }

  /**
   * Detect if phone number is mobile
   */
  private async isMobileNumber(phoneNumber: string): Promise<boolean> {
    // In production, use carrier lookup API (Telnyx, Twilio, etc.)
    // For now, use heuristics based on area code and number patterns
    
    const normalized = this.normalizePhoneNumber(phoneNumber);
    
    // US mobile numbers typically:
    // - Area codes 200-999 (excluding some landline-only area codes)
    // - Exchange codes that indicate mobile carriers
    
    // Simple heuristic: Check if number matches mobile patterns
    // This is a simplified check - in production, use carrier lookup API
    
    // For now, assume all numbers could be mobile (conservative approach)
    // In production, integrate with Telnyx Number Lookup API or similar
    return true; // Conservative: treat all as mobile until carrier lookup confirms
  }

  /**
   * Check time zone restrictions
   */
  private async checkTimeZoneRestrictions(
    phoneNumber: string,
    callTime: Date
  ): Promise<{
    timezone: string;
    isWithinHours: boolean;
    currentTime: string;
    nextSafeCallTime?: Date;
  }> {
    const timezone = await this.getTimezoneFromPhone(phoneNumber);
    const recipientTime = this.getTimeInTimezone(callTime, timezone);
    const currentHour = recipientTime.getHours();

    const isWithinHours = 
      currentHour >= this.config.callingHoursStart && 
      currentHour < this.config.callingHoursEnd;

    let nextSafeCallTime: Date | undefined;
    if (!isWithinHours) {
      // Calculate next safe call time
      const nextCall = new Date(recipientTime);
      if (currentHour < this.config.callingHoursStart) {
        // Before calling hours - set to start of calling hours today
        nextCall.setHours(this.config.callingHoursStart, 0, 0, 0);
      } else {
        // After calling hours - set to start of calling hours tomorrow
        nextCall.setDate(nextCall.getDate() + 1);
        nextCall.setHours(this.config.callingHoursStart, 0, 0, 0);
      }
      nextSafeCallTime = nextCall;
    }

    return {
      timezone,
      isWithinHours,
      currentTime: recipientTime.toLocaleTimeString('en-US', { timeZone: timezone }),
      nextSafeCallTime
    };
  }

  /**
   * Get timezone from phone number
   */
  private async getTimezoneFromPhone(phoneNumber: string): Promise<string> {
    // Check cache first
    const cached = this.timezoneCache.get(phoneNumber);
    if (cached) {
      return cached;
    }

    // Normalize phone number
    const normalized = this.normalizePhoneNumber(phoneNumber);
    
    // Extract area code (first 3 digits for US numbers)
    if (normalized.startsWith('+1') || normalized.startsWith('1')) {
      const areaCode = normalized.replace(/^\+?1/, '').substring(0, 3);
      
      // Use tz-lookup library to get timezone from coordinates
      // For phone numbers, we'd need area code to coordinates mapping
      // For now, use a simplified approach with area code to timezone mapping
      
      // In production, use a service like:
      // - Telnyx Number Lookup API
      // - Twilio Lookup API
      // - Area code to timezone database
      
      // Simplified: Use area code to timezone mapping (would need full database)
      // For now, default to US/Eastern (most common)
      const timezone = this.getTimezoneFromAreaCode(areaCode);
      this.timezoneCache.set(phoneNumber, timezone);
      return timezone;
    }

    // Default to US/Eastern for non-US numbers (conservative)
    const defaultTz = 'America/New_York';
    this.timezoneCache.set(phoneNumber, defaultTz);
    return defaultTz;
  }

  /**
   * Get timezone from area code (simplified - would need full database)
   */
  private getTimezoneFromAreaCode(areaCode: string): string {
    // Simplified mapping - in production, use comprehensive area code database
    // This is a sample of common area codes
    
    const areaCodeMap: Record<string, string> = {
      // Eastern Time
      '212': 'America/New_York', // NYC
      '646': 'America/New_York',
      '917': 'America/New_York',
      '718': 'America/New_York',
      '347': 'America/New_York',
      '929': 'America/New_York',
      '516': 'America/New_York', // Long Island
      '631': 'America/New_York',
      '914': 'America/New_York',
      '845': 'America/New_York',
      '201': 'America/New_York', // NJ
      '551': 'America/New_York',
      '609': 'America/New_York',
      '732': 'America/New_York',
      '856': 'America/New_York',
      '862': 'America/New_York',
      '973': 'America/New_York',
      '215': 'America/New_York', // Philadelphia
      '267': 'America/New_York',
      '445': 'America/New_York',
      '484': 'America/New_York',
      '610': 'America/New_York',
      '717': 'America/New_York',
      '724': 'America/New_York',
      '814': 'America/New_York',
      '878': 'America/New_York',
      '202': 'America/New_York', // DC
      '240': 'America/New_York',
      '301': 'America/New_York',
      '410': 'America/New_York',
      '443': 'America/New_York',
      '667': 'America/New_York',
      // Central Time
      '312': 'America/Chicago', // Chicago
      '773': 'America/Chicago',
      '872': 'America/Chicago',
      '708': 'America/Chicago',
      '847': 'America/Chicago',
      '224': 'America/Chicago',
      '331': 'America/Chicago',
      '630': 'America/Chicago',
      '469': 'America/Chicago', // Dallas
      '214': 'America/Chicago',
      '972': 'America/Chicago',
      '817': 'America/Chicago',
      '682': 'America/Chicago',
      '940': 'America/Chicago',
      '903': 'America/Chicago',
      '430': 'America/Chicago',
      // Mountain Time
      '303': 'America/Denver', // Denver
      '720': 'America/Denver',
      '970': 'America/Denver',
      '602': 'America/Phoenix', // Phoenix (no DST)
      '480': 'America/Phoenix',
      '520': 'America/Phoenix',
      '623': 'America/Phoenix',
      '928': 'America/Phoenix',
      // Pacific Time
      '213': 'America/Los_Angeles', // LA
      '310': 'America/Los_Angeles',
      '323': 'America/Los_Angeles',
      '424': 'America/Los_Angeles',
      '661': 'America/Los_Angeles',
      '747': 'America/Los_Angeles',
      '818': 'America/Los_Angeles',
      '415': 'America/Los_Angeles', // SF
      '510': 'America/Los_Angeles',
      '650': 'America/Los_Angeles',
      '669': 'America/Los_Angeles',
      '707': 'America/Los_Angeles',
      '925': 'America/Los_Angeles',
      '408': 'America/Los_Angeles',
      '831': 'America/Los_Angeles',
      '209': 'America/Los_Angeles',
      '559': 'America/Los_Angeles',
      '916': 'America/Los_Angeles',
      '206': 'America/Los_Angeles', // Seattle
      '253': 'America/Los_Angeles',
      '360': 'America/Los_Angeles',
      '425': 'America/Los_Angeles',
      '509': 'America/Los_Angeles',
      '564': 'America/Los_Angeles'
    };

    return areaCodeMap[areaCode] || 'America/New_York'; // Default to Eastern
  }

  /**
   * Get time in specific timezone
   */
  private getTimeInTimezone(date: Date, timezone: string): Date {
    // Convert date to timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(date);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
    const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');

    return new Date(year, month, day, hour, minute, second);
  }

  /**
   * Normalize phone number
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    let normalized = phoneNumber.replace(/[^\d+]/g, '');
    
    // Add +1 for US numbers if missing
    if (normalized.length === 10) {
      normalized = '+1' + normalized;
    } else if (normalized.startsWith('1') && normalized.length === 11) {
      normalized = '+' + normalized;
    } else if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }

    return normalized;
  }

  /**
   * Bulk validate contacts
   */
  async validateContacts(
    tenantId: string,
    contacts: Array<{ phoneNumber: string; contactId: string }>,
    callTime?: Date
  ): Promise<Map<string, ContactValidation>> {
    const results = new Map<string, ContactValidation>();

    const validationPromises = contacts.map(async (contact) => {
      const validation = await this.validateContact(tenantId, contact.phoneNumber, callTime);
      results.set(contact.contactId, validation);
    });

    await Promise.all(validationPromises);

    return results;
  }

  /**
   * Get DNC list size
   */
  getDNCListSize(): number {
    return this.dncList.size;
  }

  /**
   * Load DNC list from external source (FTC, carrier, etc.)
   */
  async loadDNCList(source: 'ftc' | 'carrier' | 'internal', entries: DNCListEntry[]): Promise<void> {
    for (const entry of entries) {
      this.dncList.set(this.normalizePhoneNumber(entry.phoneNumber), entry);
    }
  }
}

export const tcpaComplianceService = new TCPAComplianceService();
