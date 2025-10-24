/**
 * Phone Number Formatter for TETRIX 2FA System
 * 
 * This utility provides comprehensive phone number formatting and validation
 * for international numbers in E.164 format, specifically designed for
 * Telnyx Verify API integration.
 * 
 * @author TETRIX Corporation
 * @version 2.0
 * @date 2025-01-22
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
  countryCode?: string;
  nationalNumber?: string;
  countryName?: string;
}

export interface CountryInfo {
  code: string;
  name: string;
  dialCode: string;
  minLength: number;
  maxLength: number;
  pattern: RegExp;
}

/**
 * Comprehensive country data for phone number validation
 * Based on Telnyx Verify API supported countries
 */
export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  // North America
  { code: 'US', name: 'United States', dialCode: '+1', minLength: 10, maxLength: 10, pattern: /^1[2-9]\d{2}[2-9]\d{6}$/ },
  { code: 'CA', name: 'Canada', dialCode: '+1', minLength: 10, maxLength: 10, pattern: /^1[2-9]\d{2}[2-9]\d{6}$/ },
  { code: 'MX', name: 'Mexico', dialCode: '+52', minLength: 10, maxLength: 10, pattern: /^52[1-9]\d{8}$/ },
  
  // Europe
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', minLength: 10, maxLength: 11, pattern: /^44[1-9]\d{8,9}$/ },
  { code: 'DE', name: 'Germany', dialCode: '+49', minLength: 10, maxLength: 12, pattern: /^49[1-9]\d{8,10}$/ },
  { code: 'FR', name: 'France', dialCode: '+33', minLength: 9, maxLength: 9, pattern: /^33[1-9]\d{8}$/ },
  { code: 'ES', name: 'Spain', dialCode: '+34', minLength: 9, maxLength: 9, pattern: /^34[6-9]\d{8}$/ },
  { code: 'IT', name: 'Italy', dialCode: '+39', minLength: 9, maxLength: 11, pattern: /^39[3-9]\d{8,10}$/ },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', minLength: 9, maxLength: 9, pattern: /^31[6-9]\d{8}$/ },
  
  // Asia-Pacific
  { code: 'AU', name: 'Australia', dialCode: '+61', minLength: 9, maxLength: 9, pattern: /^61[2-9]\d{8}$/ },
  { code: 'JP', name: 'Japan', dialCode: '+81', minLength: 10, maxLength: 11, pattern: /^81[1-9]\d{8,9}$/ },
  { code: 'SG', name: 'Singapore', dialCode: '+65', minLength: 8, maxLength: 8, pattern: /^65[6-9]\d{7}$/ },
  { code: 'IN', name: 'India', dialCode: '+91', minLength: 10, maxLength: 10, pattern: /^91[6-9]\d{9}$/ },
  
  // Latin America
  { code: 'BR', name: 'Brazil', dialCode: '+55', minLength: 10, maxLength: 11, pattern: /^55[1-9]\d{8,9}$/ },
  { code: 'AR', name: 'Argentina', dialCode: '+54', minLength: 10, maxLength: 10, pattern: /^54[1-9]\d{8}$/ },
  { code: 'CL', name: 'Chile', dialCode: '+56', minLength: 8, maxLength: 9, pattern: /^56[2-9]\d{7,8}$/ },
  { code: 'CO', name: 'Colombia', dialCode: '+57', minLength: 10, maxLength: 10, pattern: /^57[1-9]\d{8}$/ },
  
  // Middle East
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', minLength: 9, maxLength: 9, pattern: /^971[1-9]\d{8}$/ },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', minLength: 9, maxLength: 9, pattern: /^966[1-9]\d{8}$/ },
  { code: 'IL', name: 'Israel', dialCode: '+972', minLength: 9, maxLength: 9, pattern: /^972[1-9]\d{8}$/ },
];

/**
 * Phone Number Formatter Class
 * 
 * Provides comprehensive phone number formatting and validation
 * for international numbers in E.164 format.
 */
export class PhoneNumberFormatter {
  private static instance: PhoneNumberFormatter;
  
  private constructor() {}
  
  public static getInstance(): PhoneNumberFormatter {
    if (!PhoneNumberFormatter.instance) {
      PhoneNumberFormatter.instance = new PhoneNumberFormatter();
    }
    return PhoneNumberFormatter.instance;
  }

  /**
   * Format phone number for display
   * @param phoneNumber - Raw phone number input
   * @returns Formatted phone number string
   */
  public formatForDisplay(phoneNumber: string): string {
    if (!phoneNumber) return '';
    
    // Clean the input
    const cleanPhone = this.cleanPhoneNumber(phoneNumber);
    
    // If it's already in E.164 format, format for display
    if (cleanPhone.startsWith('+')) {
      return this.formatE164ForDisplay(cleanPhone);
    }
    
    // Otherwise, try to format as we type
    return this.formatAsYouType(cleanPhone);
  }

  /**
   * Clean phone number by removing non-digit characters except +
   * @param phoneNumber - Raw phone number
   * @returns Cleaned phone number
   */
  private cleanPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters except +
    let clean = phoneNumber.replace(/[^\d+]/g, '');
    
    // Remove double plus signs
    if (clean.startsWith('++')) {
      clean = clean.substring(1);
    }
    
    // Ensure it starts with +
    if (!clean.startsWith('+') && clean.length > 0) {
      clean = '+' + clean;
    }
    
    return clean;
  }

  /**
   * Format E.164 number for display
   * @param e164Number - E.164 formatted number
   * @returns Display formatted number
   */
  private formatE164ForDisplay(e164Number: string): string {
    const digits = e164Number.slice(1);
    const countryInfo = this.detectCountry(digits);
    
    if (countryInfo) {
      return this.formatByCountry(e164Number, countryInfo);
    }
    
    // Fallback formatting for unknown countries
    return this.formatGeneric(e164Number);
  }

  /**
   * Format phone number as user types
   * @param phoneNumber - Phone number being typed
   * @returns Formatted phone number
   */
  private formatAsYouType(phoneNumber: string): string {
    if (!phoneNumber || phoneNumber === '+') return '+';
    
    const digits = phoneNumber.slice(1);
    
    if (digits.length === 0) return '+';
    
    // Try to detect country and format accordingly
    const countryInfo = this.detectCountry(digits);
    
    if (countryInfo) {
      return this.formatByCountry(phoneNumber, countryInfo);
    }
    
    // Generic formatting for unknown countries
    return this.formatGeneric(phoneNumber);
  }

  /**
   * Format phone number by country rules
   * @param phoneNumber - Full phone number
   * @param countryInfo - Country information
   * @returns Formatted phone number
   */
  private formatByCountry(phoneNumber: string, countryInfo: CountryInfo): string {
    const digits = phoneNumber.slice(1);
    const nationalNumber = digits.slice(countryInfo.dialCode.length - 1);
    
    switch (countryInfo.code) {
      case 'US':
      case 'CA':
        return this.formatUSCanada(phoneNumber);
      case 'GB':
        return this.formatUK(phoneNumber);
      case 'DE':
        return this.formatGermany(phoneNumber);
      case 'FR':
        return this.formatFrance(phoneNumber);
      case 'AU':
        return this.formatAustralia(phoneNumber);
      case 'JP':
        return this.formatJapan(phoneNumber);
      case 'IN':
        return this.formatIndia(phoneNumber);
      case 'BR':
        return this.formatBrazil(phoneNumber);
      default:
        return this.formatGeneric(phoneNumber);
    }
  }

  /**
   * Format US/Canada numbers: +1 (555) 123-4567
   */
  private formatUSCanada(phoneNumber: string): string {
    const digits = phoneNumber.slice(1);
    if (digits.length <= 1) return phoneNumber;
    if (digits.length <= 4) return `+1 (${digits.slice(1)})`;
    if (digits.length <= 7) return `+1 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  /**
   * Format UK numbers: +44 20 7946 0958
   */
  private formatUK(phoneNumber: string): string {
    const digits = phoneNumber.slice(1);
    if (digits.length <= 2) return phoneNumber;
    if (digits.length <= 4) return `+44 ${digits.slice(2)}`;
    if (digits.length <= 7) return `+44 ${digits.slice(2, 4)} ${digits.slice(4)}`;
    if (digits.length <= 10) return `+44 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    return `+44 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)} ${digits.slice(10)}`;
  }

  /**
   * Format Germany numbers: +49 30 12345678
   */
  private formatGermany(phoneNumber: string): string {
    const digits = phoneNumber.slice(1);
    if (digits.length <= 2) return phoneNumber;
    if (digits.length <= 4) return `+49 ${digits.slice(2)}`;
    if (digits.length <= 7) return `+49 ${digits.slice(2, 4)} ${digits.slice(4)}`;
    return `+49 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  /**
   * Format France numbers: +33 1 23 45 67 89
   */
  private formatFrance(phoneNumber: string): string {
    const digits = phoneNumber.slice(1);
    if (digits.length <= 2) return phoneNumber;
    if (digits.length <= 4) return `+33 ${digits.slice(2)}`;
    if (digits.length <= 6) return `+33 ${digits.slice(2, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8) return `+33 ${digits.slice(2, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
    return `+33 ${digits.slice(2, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
  }

  /**
   * Format Australia numbers: +61 2 1234 5678
   */
  private formatAustralia(phoneNumber: string): string {
    const digits = phoneNumber.slice(1);
    if (digits.length <= 2) return phoneNumber;
    if (digits.length <= 4) return `+61 ${digits.slice(2)}`;
    if (digits.length <= 7) return `+61 ${digits.slice(2, 3)} ${digits.slice(3)}`;
    return `+61 ${digits.slice(2, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  }

  /**
   * Format Japan numbers: +81 3 1234 5678
   */
  private formatJapan(phoneNumber: string): string {
    const digits = phoneNumber.slice(1);
    if (digits.length <= 2) return phoneNumber;
    if (digits.length <= 4) return `+81 ${digits.slice(2)}`;
    if (digits.length <= 7) return `+81 ${digits.slice(2, 3)} ${digits.slice(3)}`;
    return `+81 ${digits.slice(2, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  }

  /**
   * Format India numbers: +91 98765 43210
   */
  private formatIndia(phoneNumber: string): string {
    const digits = phoneNumber.slice(1);
    if (digits.length <= 2) return phoneNumber;
    if (digits.length <= 4) return `+91 ${digits.slice(2)}`;
    if (digits.length <= 7) return `+91 ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `+91 ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
  }

  /**
   * Format Brazil numbers: +55 11 99999 9999
   */
  private formatBrazil(phoneNumber: string): string {
    const digits = phoneNumber.slice(1);
    if (digits.length <= 2) return phoneNumber;
    if (digits.length <= 4) return `+55 ${digits.slice(2)}`;
    if (digits.length <= 7) return `+55 ${digits.slice(2, 4)} ${digits.slice(4)}`;
    return `+55 ${digits.slice(2, 4)} ${digits.slice(4, 9)} ${digits.slice(9)}`;
  }

  /**
   * Generic formatting for unknown countries
   */
  private formatGeneric(phoneNumber: string): string {
    const digits = phoneNumber.slice(1);
    if (digits.length <= 2) return phoneNumber;
    if (digits.length <= 4) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 7) return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }

  /**
   * Detect country from phone number digits
   * @param digits - Phone number digits (without +)
   * @returns Country information or null
   */
  private detectCountry(digits: string): CountryInfo | null {
    for (const country of SUPPORTED_COUNTRIES) {
      const dialCode = country.dialCode.slice(1); // Remove +
      if (digits.startsWith(dialCode)) {
        return country;
      }
    }
    return null;
  }

  /**
   * Validate phone number for E.164 format
   * @param phoneNumber - Phone number to validate
   * @returns Validation result with detailed information
   */
  public validatePhoneNumber(phoneNumber: string): PhoneValidationResult {
    if (!phoneNumber) {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Clean the phone number
    const cleanPhone = this.cleanPhoneNumber(phoneNumber);
    
    // Must start with +
    if (!cleanPhone.startsWith('+')) {
      return { isValid: false, error: 'Phone number must start with +' };
    }

    // Extract digits after +
    const digits = cleanPhone.slice(1);
    
    // Must contain only digits
    if (!/^\d+$/.test(digits)) {
      return { isValid: false, error: 'Phone number must contain only digits after country code' };
    }

    // Must be between 7 and 15 digits (E.164 standard)
    if (digits.length < 7 || digits.length > 15) {
      return { 
        isValid: false, 
        error: 'Phone number must be between 7 and 15 digits (E.164 standard)' 
      };
    }

    // Detect country and validate accordingly
    const countryInfo = this.detectCountry(digits);
    
    if (countryInfo) {
      // Validate against country-specific rules
      const nationalNumber = digits.slice(countryInfo.dialCode.length - 1);
      
      if (nationalNumber.length < countryInfo.minLength || nationalNumber.length > countryInfo.maxLength) {
        return {
          isValid: false,
          error: `${countryInfo.name} numbers must be between ${countryInfo.minLength} and ${countryInfo.maxLength} digits`
        };
      }
      
      if (!countryInfo.pattern.test(digits)) {
        return {
          isValid: false,
          error: `Invalid ${countryInfo.name} phone number format`
        };
      }
      
      return {
        isValid: true,
        formatted: cleanPhone,
        countryCode: countryInfo.code,
        nationalNumber: nationalNumber,
        countryName: countryInfo.name
      };
    }

    // For unknown countries, just validate E.164 format
    if (digits.startsWith('0')) {
      return { isValid: false, error: 'Phone number cannot start with 0' };
    }

    return {
      isValid: true,
      formatted: cleanPhone,
      countryCode: 'UNKNOWN',
      nationalNumber: digits,
      countryName: 'Unknown Country'
    };
  }

  /**
   * Get supported countries list
   * @returns Array of supported country information
   */
  public getSupportedCountries(): CountryInfo[] {
    return SUPPORTED_COUNTRIES;
  }

  /**
   * Check if a country is supported
   * @param countryCode - Two-letter country code
   * @returns True if country is supported
   */
  public isCountrySupported(countryCode: string): boolean {
    return SUPPORTED_COUNTRIES.some(country => country.code === countryCode);
  }

  /**
   * Get country information by code
   * @param countryCode - Two-letter country code
   * @returns Country information or null
   */
  public getCountryInfo(countryCode: string): CountryInfo | null {
    return SUPPORTED_COUNTRIES.find(country => country.code === countryCode) || null;
  }
}

// Export singleton instance
export const phoneFormatter = PhoneNumberFormatter.getInstance();

// Export utility functions
export const formatPhoneNumber = (phoneNumber: string): string => {
  return phoneFormatter.formatForDisplay(phoneNumber);
};

export const validatePhoneNumber = (phoneNumber: string): PhoneValidationResult => {
  return phoneFormatter.validatePhoneNumber(phoneNumber);
};

export const getSupportedCountries = (): CountryInfo[] => {
  return phoneFormatter.getSupportedCountries();
};

export const isCountrySupported = (countryCode: string): boolean => {
  return phoneFormatter.isCountrySupported(countryCode);
};
