// Stripe Price ID Mapping for TETRIX Services
// Maps Stripe price IDs to pricing page services

export interface PriceMapping {
  priceId: string;
  serviceType: 'healthcare' | 'legal' | 'business' | 'construction' | 'logistics' | 'government' | 'education' | 'retail' | 'hospitality' | 'wellness' | 'beauty';
  tier: string;
  planName: string;
  basePrice: number;
  perUnitPrice?: number;
  period: string;
  description: string;
  features: string[];
  requiresESIM: boolean;
  isTrialEligible: boolean;
}

// Environment-specific price mappings
const STRIPE_PRICE_MAPPINGS: Record<string, PriceMapping> = {
  // Healthcare Service Prices
  'price_healthcare_individual': {
    priceId: 'price_healthcare_individual',
    serviceType: 'healthcare',
    tier: 'individual',
    planName: 'Individual Practice',
    basePrice: 150,
    period: 'per provider/month',
    description: '1-4 Providers',
    features: [
      '2,000 AI voice sessions/month',
      'Basic benefit verification',
      'Appointment scheduling',
      'Patient communication',
      'Basic EHR integration',
      'HIPAA compliance',
      'Email support'
    ],
    requiresESIM: false,
    isTrialEligible: true
  },
  
  'price_healthcare_small': {
    priceId: 'price_healthcare_small',
    serviceType: 'healthcare',
    tier: 'small',
    planName: 'Small Practice',
    basePrice: 200,
    perUnitPrice: 100,
    period: 'base + $100/provider',
    description: '5-49 Providers',
    features: [
      '5,000 AI voice sessions/month',
      'Prior authorization assistance',
      'Prescription follow-up automation',
      'Appointment scheduling',
      'Up to 2 EHR integrations',
      'Basic workflows',
      'Email support'
    ],
    requiresESIM: false,
    isTrialEligible: true
  },
  
  'price_healthcare_professional': {
    priceId: 'price_healthcare_professional',
    serviceType: 'healthcare',
    tier: 'professional',
    planName: 'Professional',
    basePrice: 500,
    perUnitPrice: 75,
    period: 'base + $75/provider',
    description: '50-499 Providers',
    features: [
      '10,000 AI voice sessions/month',
      'Advanced prior authorization',
      'Prescription follow-up automation',
      'Up to 5 EHR integrations',
      'Advanced analytics & reporting',
      'Priority support + phone',
      'Standard integrations'
    ],
    requiresESIM: true,
    isTrialEligible: true
  },
  
  'price_healthcare_enterprise': {
    priceId: 'price_healthcare_enterprise',
    serviceType: 'healthcare',
    tier: 'enterprise',
    planName: 'Enterprise',
    basePrice: 2000,
    perUnitPrice: 50,
    period: 'base + $50/provider',
    description: '500+ Providers',
    features: [
      'Unlimited AI voice sessions',
      'Unlimited EHR integrations',
      'Custom healthcare workflows',
      'Advanced analytics & reporting',
      '24/7 dedicated support',
      'Dedicated account manager',
      'White-label options'
    ],
    requiresESIM: true,
    isTrialEligible: false
  },

  // Legal Service Prices
  'price_legal_solo': {
    priceId: 'price_legal_solo',
    serviceType: 'legal',
    tier: 'solo',
    planName: 'Solo Practice',
    basePrice: 150,
    period: 'per attorney/month',
    description: '1-4 Attorneys',
    features: [
      '2,000 AI legal assistant sessions/month',
      'Basic case management',
      'Document generation',
      'Client communication',
      'Time tracking and billing',
      'Attorney-client privilege protection',
      'Email support'
    ],
    requiresESIM: false,
    isTrialEligible: true
  },
  
  'price_legal_small': {
    priceId: 'price_legal_small',
    serviceType: 'legal',
    tier: 'small',
    planName: 'Small Firm',
    basePrice: 500,
    perUnitPrice: 125,
    period: 'base + $125/attorney',
    description: '5-24 Attorneys',
    features: [
      '5,000 AI legal assistant sessions/month',
      'Case management automation',
      'Document generation',
      'Client communication workflows',
      'Time tracking and billing',
      'Basic legal research',
      'Email support'
    ],
    requiresESIM: false,
    isTrialEligible: true
  },
  
  'price_legal_midsize': {
    priceId: 'price_legal_midsize',
    serviceType: 'legal',
    tier: 'midsize',
    planName: 'Mid-Size Firm',
    basePrice: 1000,
    perUnitPrice: 100,
    period: 'base + $100/attorney',
    description: '25-99 Attorneys',
    features: [
      '10,000 AI legal assistant sessions/month',
      'Advanced case management',
      'Document generation',
      'Legal research integration',
      'Client communication workflows',
      'Conflict checking',
      'Priority support + phone'
    ],
    requiresESIM: true,
    isTrialEligible: true
  },
  
  'price_legal_enterprise': {
    priceId: 'price_legal_enterprise',
    serviceType: 'legal',
    tier: 'enterprise',
    planName: 'Enterprise Law Firm',
    basePrice: 3000,
    perUnitPrice: 75,
    period: 'base + $75/attorney',
    description: '100+ Attorneys',
    features: [
      'Unlimited AI legal assistant sessions',
      'Advanced case management automation',
      'Document generation and automation',
      'Legal research integration',
      'Advanced analytics and reporting',
      '24/7 dedicated support',
      'Dedicated account manager'
    ],
    requiresESIM: true,
    isTrialEligible: false
  },

  // Business Service Prices
  'price_business_starter': {
    priceId: 'price_business_starter',
    serviceType: 'business',
    tier: 'starter',
    planName: 'Starter',
    basePrice: 99,
    period: 'per month',
    description: 'Small businesses, startups (1-10 employees)',
    features: [
      '1,000 voice minutes included',
      '1,000 SMS messages included',
      '500 2FA attempts included',
      '2 toll-free numbers',
      'Basic AI workflow automation',
      'Email support',
      'Basic analytics'
    ],
    requiresESIM: true,
    isTrialEligible: true
  },
  
  'price_business_professional': {
    priceId: 'price_business_professional',
    serviceType: 'business',
    tier: 'professional',
    planName: 'Professional',
    basePrice: 299,
    period: 'per month',
    description: 'Growing businesses (11-100 employees)',
    features: [
      '5,000 voice minutes included',
      '5,000 SMS messages included',
      '2,500 2FA attempts included',
      '5 toll-free numbers',
      'Advanced AI automation + data labeling',
      'Priority support + phone',
      'Advanced analytics'
    ],
    requiresESIM: true,
    isTrialEligible: true
  },
  
  'price_business_enterprise': {
    priceId: 'price_business_enterprise',
    serviceType: 'business',
    tier: 'enterprise',
    planName: 'Enterprise',
    basePrice: 799,
    period: 'per month',
    description: 'Large enterprises (100+ employees)',
    features: [
      '15,000 voice minutes included',
      '15,000 SMS messages included',
      '7,500 2FA attempts included',
      '15 toll-free numbers',
      'Full AI suite + custom models',
      'Dedicated account manager',
      'Real-time analytics'
    ],
    requiresESIM: true,
    isTrialEligible: false
  },
  
  'price_business_custom': {
    priceId: 'price_business_custom',
    serviceType: 'business',
    tier: 'custom',
    planName: 'Custom Enterprise',
    basePrice: 0,
    period: 'custom pricing',
    description: 'Fortune 500, government, high-volume',
    features: [
      'Unlimited usage with volume discounts',
      'Custom pricing based on usage',
      'Dedicated infrastructure',
      '24/7 support with SLA guarantees',
      'Custom AI model training',
      'White-label options',
      'Custom integrations'
    ],
    requiresESIM: true,
    isTrialEligible: false
  },

  // Construction Service Prices
  'price_construction_individual': {
    priceId: 'price_construction_individual',
    serviceType: 'construction',
    tier: 'individual',
    planName: 'Individual Contractor',
    basePrice: 150,
    period: 'per contractor/month',
    description: '1-4 Contractors',
    features: [
      '2,000 AI voice sessions/month',
      'Project status updates',
      'Safety alerts and notifications',
      'Resource management',
      'Basic reporting',
      'Mobile app access',
      'Email support'
    ],
    requiresESIM: false,
    isTrialEligible: true
  },
  
  'price_construction_small': {
    priceId: 'price_construction_small',
    serviceType: 'construction',
    tier: 'small',
    planName: 'Small Construction',
    basePrice: 200,
    perUnitPrice: 100,
    period: 'base + $100/contractor',
    description: '5-24 Contractors',
    features: [
      '5,000 AI voice sessions/month',
      'Project management automation',
      'Safety compliance tracking',
      'Resource optimization',
      'Advanced reporting',
      'Team collaboration tools',
      'Priority support'
    ],
    requiresESIM: false,
    isTrialEligible: true
  },
  
  'price_construction_professional': {
    priceId: 'price_construction_professional',
    serviceType: 'construction',
    tier: 'professional',
    planName: 'Professional Construction',
    basePrice: 500,
    perUnitPrice: 75,
    period: 'base + $75/contractor',
    description: '25-99 Contractors',
    features: [
      '10,000 AI voice sessions/month',
      'Advanced project management',
      'Safety compliance automation',
      'Resource optimization AI',
      'Advanced analytics & reporting',
      'Integration with construction software',
      'Priority support + phone'
    ],
    requiresESIM: true,
    isTrialEligible: true
  },
  
  'price_construction_enterprise': {
    priceId: 'price_construction_enterprise',
    serviceType: 'construction',
    tier: 'enterprise',
    planName: 'Enterprise Construction',
    basePrice: 2000,
    perUnitPrice: 50,
    period: 'base + $50/contractor',
    description: '100+ Contractors',
    features: [
      'Unlimited AI voice sessions',
      'Enterprise project management',
      'Advanced safety compliance',
      'AI-powered resource optimization',
      'Custom analytics & reporting',
      'White-label options',
      '24/7 dedicated support',
      'Dedicated account manager'
    ],
    requiresESIM: true,
    isTrialEligible: false
  },

  // Logistics Service Prices
  'price_logistics_individual': {
    priceId: 'price_logistics_individual',
    serviceType: 'logistics',
    tier: 'individual',
    planName: 'Individual Fleet',
    basePrice: 150,
    period: 'per vehicle/month',
    description: '1-4 Vehicles',
    features: [
      '2,000 AI voice sessions/month',
      'Real-time vehicle tracking',
      'Driver communication',
      'Delivery management',
      'Basic reporting',
      'Mobile app access',
      'Email support'
    ],
    requiresESIM: false,
    isTrialEligible: true
  },
  
  'price_logistics_small': {
    priceId: 'price_logistics_small',
    serviceType: 'logistics',
    tier: 'small',
    planName: 'Small Fleet',
    basePrice: 200,
    perUnitPrice: 100,
    period: 'base + $100/vehicle',
    description: '5-24 Vehicles',
    features: [
      '5,000 AI voice sessions/month',
      'Advanced fleet tracking',
      'Route optimization',
      'Driver performance analytics',
      'Delivery automation',
      'Team management tools',
      'Priority support'
    ],
    requiresESIM: false,
    isTrialEligible: true
  },
  
  'price_logistics_professional': {
    priceId: 'price_logistics_professional',
    serviceType: 'logistics',
    tier: 'professional',
    planName: 'Professional Fleet',
    basePrice: 500,
    perUnitPrice: 75,
    period: 'base + $75/vehicle',
    description: '25-99 Vehicles',
    features: [
      '10,000 AI voice sessions/month',
      'Advanced fleet management',
      'AI-powered route optimization',
      'Predictive maintenance',
      'Advanced analytics & reporting',
      'Integration with logistics software',
      'Priority support + phone'
    ],
    requiresESIM: true,
    isTrialEligible: true
  },
  
  'price_logistics_enterprise': {
    priceId: 'price_logistics_enterprise',
    serviceType: 'logistics',
    tier: 'enterprise',
    planName: 'Enterprise Fleet',
    basePrice: 2000,
    perUnitPrice: 50,
    period: 'base + $50/vehicle',
    description: '100+ Vehicles',
    features: [
      'Unlimited AI voice sessions',
      'Enterprise fleet management',
      'AI-powered logistics optimization',
      'Predictive analytics',
      'Custom reporting & dashboards',
      'White-label options',
      '24/7 dedicated support',
      'Dedicated account manager'
    ],
    requiresESIM: true,
    isTrialEligible: false
  }
};

// Trial price ID for 7-day free trials
export const TRIAL_PRICE_ID = process.env.STRIPE_TRIAL_PRICE_ID || 'price_trial_7day';

// Helper functions
export function getPriceMapping(priceId: string): PriceMapping | null {
  return STRIPE_PRICE_MAPPINGS[priceId] || null;
}

export function getPriceMappingByService(serviceType: string, tier: string): PriceMapping | null {
  const key = `price_${serviceType}_${tier}`;
  return STRIPE_PRICE_MAPPINGS[key] || null;
}

export function getAllPriceMappings(): PriceMapping[] {
  return Object.values(STRIPE_PRICE_MAPPINGS);
}

export function getPriceMappingsByService(serviceType: string): PriceMapping[] {
  return Object.values(STRIPE_PRICE_MAPPINGS).filter(
    mapping => mapping.serviceType === serviceType
  );
}

export function isTrialEligible(priceId: string): boolean {
  const mapping = getPriceMapping(priceId);
  return mapping ? mapping.isTrialEligible : false;
}

export function requiresESIM(priceId: string): boolean {
  const mapping = getPriceMapping(priceId);
  return mapping ? mapping.requiresESIM : false;
}

// Export the mappings
export { STRIPE_PRICE_MAPPINGS };
