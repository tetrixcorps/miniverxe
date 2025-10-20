export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  company?: string;
  industry: string;
  tags: string[];
  notes?: string;
  smsOptIn: boolean;
  emailOptIn: boolean;
  preferredContactTime?: string;
  timezone: string;
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: string;
}

export interface PhoneValidation {
  isValid: boolean;
  formattedNumber: string;
  countryCode: string;
  nationalNumber: string;
  validationSource: 'api' | 'manual';
}

export interface ContactFormProps {
  industry: string;
  initialData?: Partial<Contact>;
  onSubmit: (contact: Contact) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ContactManagementProps {
  industry: string;
  onContactSelect: (contact: Contact) => void;
  onContactCreate: (contact: Contact) => void;
  onContactUpdate: (contact: Contact) => void;
  onContactDelete: (contactId: string) => void;
  onSendSMS?: (contact: Contact) => void;
  showSMSActions?: boolean;
}




