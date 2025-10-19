import React, { useState } from 'react';
import PhoneInput from './PhoneInput';
import { Contact, ContactFormProps } from '../../types/contact';

interface PhoneValidation {
  isValid: boolean;
  formattedNumber: string;
  countryCode: string;
  nationalNumber: string;
  carrier?: string;
  lineType?: 'mobile' | 'landline' | 'voip' | 'unknown';
  validationSource: 'twilio' | 'libphonenumber' | 'manual';
}

const ContactForm: React.FC<ContactFormProps> = ({
  industry,
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Contact>({
    id: initialData.id || '',
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    phoneNumber: initialData.phoneNumber || '',
    email: initialData.email || '',
    company: initialData.company || '',
    industry: industry,
    tags: initialData.tags || [],
    notes: initialData.notes || '',
    smsOptIn: initialData.smsOptIn || false,
    emailOptIn: initialData.emailOptIn || false,
    preferredContactTime: initialData.preferredContactTime || '9-17',
    timezone: initialData.timezone || 'UTC',
    customFields: initialData.customFields || {},
    createdAt: initialData.createdAt || new Date(),
    updatedAt: initialData.updatedAt || new Date(),
    lastContactedAt: initialData.lastContactedAt,
    ...initialData
  });

  const [phoneValidation, setPhoneValidation] = useState<PhoneValidation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof Contact, value: string | boolean | string[] | Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field as string]: ''
      }));
    }
  };

  const handleCustomFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePhoneChange = (phone: string, validation: PhoneValidation) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: phone
    }));
    setPhoneValidation(validation);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (phoneValidation && !phoneValidation.isValid) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    // Email validation (optional field)
    if (formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Industry-specific field validations
    if (formData.industry.toLowerCase() === 'healthcare') {
      if (formData.customFields.dateOfBirth && !formData.customFields.dateOfBirth.trim()) {
        newErrors.dateOfBirth = 'Date of birth is required for healthcare contacts';
      }
    }

    if (formData.industry.toLowerCase() === 'legal') {
      if (formData.customFields.caseType && !formData.customFields.caseType.trim()) {
        newErrors.caseType = 'Case type is required for legal contacts';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Ensure all required fields are properly set
      const contactData: Contact = {
        ...formData,
        id: formData.id || '', // Generate ID if not present
        createdAt: formData.createdAt || new Date(),
        updatedAt: new Date(), // Always update the timestamp
      };
      
      onSubmit(contactData);
    }
  };

  const getIndustrySpecificFields = () => {
    switch (industry.toLowerCase()) {
      case 'healthcare':
        return (
          <>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.customFields.dateOfBirth || ''}
                onChange={(e) => handleCustomFieldChange('dateOfBirth', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Provider
              </label>
              <input
                type="text"
                value={formData.customFields.insuranceProvider || ''}
                onChange={(e) => handleCustomFieldChange('insuranceProvider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter insurance provider"
              />
            </div>
          </>
        );

      case 'legal':
        return (
          <>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case Type
              </label>
              <select
                value={formData.customFields.caseType || ''}
                onChange={(e) => handleCustomFieldChange('caseType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.caseType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select case type</option>
                <option value="personal-injury">Personal Injury</option>
                <option value="family-law">Family Law</option>
                <option value="business-law">Business Law</option>
                <option value="criminal-law">Criminal Law</option>
                <option value="estate-planning">Estate Planning</option>
              </select>
              {errors.caseType && (
                <p className="mt-1 text-sm text-red-600">{errors.caseType}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case Status
              </label>
              <select
                value={formData.customFields.caseStatus || ''}
                onChange={(e) => handleCustomFieldChange('caseStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
                <option value="settled">Settled</option>
              </select>
            </div>
          </>
        );

      case 'retail':
        return (
          <>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Type
              </label>
              <select
                value={formData.customFields.customerType || ''}
                onChange={(e) => handleCustomFieldChange('customerType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select customer type</option>
                <option value="individual">Individual</option>
                <option value="business">Business</option>
                <option value="wholesale">Wholesale</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Store Location
              </label>
              <input
                type="text"
                value={formData.customFields.preferredStore || ''}
                onChange={(e) => handleCustomFieldChange('preferredStore', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter preferred store location"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter first name"
            required
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter last name"
            required
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <PhoneInput
          value={formData.phoneNumber}
          onChange={handlePhoneChange}
          country="US"
          placeholder="Enter phone number"
          required
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
        )}
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => handleInputChange('company', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter company name"
        />
      </div>

      {/* Industry-Specific Fields */}
      {getIndustrySpecificFields()}

      {/* Communication Preferences */}
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Communication Preferences
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.smsOptIn}
              onChange={(e) => handleInputChange('smsOptIn', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Opt-in for SMS notifications
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.emailOptIn}
              onChange={(e) => handleInputChange('emailOptIn', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Opt-in for email notifications
            </span>
          </label>
        </div>
      </div>

      {/* Preferred Contact Time */}
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Contact Time
        </label>
        <select
          value={formData.preferredContactTime}
          onChange={(e) => handleInputChange('preferredContactTime', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="9-17">9 AM - 5 PM</option>
          <option value="8-18">8 AM - 6 PM</option>
          <option value="10-16">10 AM - 4 PM</option>
          <option value="anytime">Anytime</option>
        </select>
      </div>

      {/* Notes */}
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter any additional notes about this contact"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isLoading || !phoneValidation?.isValid}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
