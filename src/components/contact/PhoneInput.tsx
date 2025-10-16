import React, { useState, useEffect } from 'react';

interface PhoneValidation {
  isValid: boolean;
  formattedNumber: string;
  countryCode: string;
  nationalNumber: string;
  carrier?: string;
  lineType?: 'mobile' | 'landline' | 'voip' | 'unknown';
  validationSource: 'twilio' | 'libphonenumber' | 'manual';
}

interface PhoneInputProps {
  value: string;
  onChange: (phone: string, validation: PhoneValidation) => void;
  country?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  country = 'US',
  placeholder = 'Enter phone number',
  required = false,
  className = '',
  disabled = false
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<PhoneValidation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validatePhone = async (phone: string) => {
    if (!phone || phone.length < 10) {
      setValidation({
        isValid: false,
        formattedNumber: phone,
        countryCode: country,
        nationalNumber: phone,
        validationSource: 'manual'
      });
      setError('Phone number must be at least 10 digits');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/contacts/validate-phone', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ phone, country })
      });

      if (!response.ok) {
        throw new Error('Phone validation failed');
      }

      const result = await response.json();
      setValidation(result);
      onChange(phone, result);
      
      if (!result.isValid) {
        setError('Invalid phone number format');
      }
    } catch (error) {
      console.error('Phone validation error:', error);
      setError('Unable to validate phone number');
      
      // Fallback validation
      const basicValidation = {
        isValid: phone.length >= 10 && /^[\d\s\-\+\(\)]+$/.test(phone),
        formattedNumber: phone,
        countryCode: country,
        nationalNumber: phone,
        validationSource: 'manual' as const
      };
      
      setValidation(basicValidation);
      onChange(phone, basicValidation);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    validatePhone(phone);
  };

  const formatPhoneDisplay = (phone: string) => {
    // Basic US phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className={`phone-input-container ${className}`}>
      <div className="relative">
        <input
          type="tel"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled || isValidating}
          className={`
            w-full px-3 py-2 border rounded-md text-gray-900 placeholder-gray-500 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${validation?.isValid ? 'border-green-500' : validation?.isValid === false ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${isValidating ? 'pr-10' : ''}
          `}
        />
        
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {validation && !isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {validation.isValid ? (
              <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {validation && (
        <div className={`mt-1 text-sm ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
          {validation.isValid ? (
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Valid phone number
              {validation.lineType && (
                <span className="ml-2 text-gray-500">({validation.lineType})</span>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error || 'Invalid phone number format'}
            </div>
          )}
        </div>
      )}

      {/* Formatted Number Display */}
      {validation?.isValid && validation.formattedNumber !== value && (
        <div className="mt-1 text-xs text-gray-500">
          Formatted: {formatPhoneDisplay(validation.formattedNumber)}
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
