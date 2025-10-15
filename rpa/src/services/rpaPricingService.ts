// TETRIX RPA Pricing Service
// Handles pricing for RPA-as-a-Service across all industries

export interface RPAPricingTier {
  id: string;
  name: string;
  description: string;
  monthlyCost: number;
  features: string[];
  limits: RPALimits;
  targetMarket: string;
  industry: string;
  compliance: ComplianceAddon[];
  support: SupportLevel;
}

export interface RPALimits {
  bots: number;
  workflows: number;
  executions: number;
  storage: string;
  users: number;
  apiCalls: number;
  dataProcessing: string;
  retention: number; // days
}

export interface ComplianceAddon {
  id: string;
  name: string;
  description: string;
  monthlyCost: number;
  requirements: string[];
  certifications: string[];
  industry: string;
}

export interface SupportLevel {
  level: 'basic' | 'standard' | 'premium' | 'enterprise';
  responseTime: string;
  channels: string[];
  features: string[];
  sla: string;
}

export interface IndustryPricing {
  industry: string;
  basePricing: RPAPricingTier[];
  complianceAddons: ComplianceAddon[];
  customPricing: CustomPricingOption[];
  discounts: DiscountOption[];
}

export interface CustomPricingOption {
  id: string;
  name: string;
  description: string;
  pricing: CustomPricing;
  requirements: string[];
  timeline: string;
  support: string;
}

export interface CustomPricing {
  setup: number;
  monthly: number;
  perBot: number;
  perWorkflow: number;
  perExecution: number;
  storage: number;
  support: number;
}

export interface DiscountOption {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'volume';
  value: number;
  conditions: string[];
  applicable: string[];
}

export class TETRIXRPAPricingService {
  private pricingTiers: Map<string, RPAPricingTier[]> = new Map();
  private industryPricing: Map<string, IndustryPricing> = new Map();
  private complianceAddons: Map<string, ComplianceAddon[]> = new Map();
  private discountOptions: DiscountOption[] = [];

  constructor() {
    this.initializePricingStructure();
  }

  /**
   * Initialize pricing structure for all industries
   */
  private initializePricingStructure(): void {
    console.log('💰 Initializing TETRIX RPA Pricing Service...');
    
    // Initialize base pricing tiers
    this.initializeBasePricingTiers();
    
    // Initialize industry-specific pricing
    this.initializeIndustryPricing();
    
    // Initialize compliance addons
    this.initializeComplianceAddons();
    
    // Initialize discount options
    this.initializeDiscountOptions();
    
    console.log('✅ RPA Pricing Service initialized successfully');
  }

  /**
   * Initialize base pricing tiers
   */
  private initializeBasePricingTiers(): void {
    const baseTiers: RPAPricingTier[] = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for small businesses getting started with RPA',
        monthlyCost: 299,
        features: [
          '5 RPA bots',
          '10 workflows',
          '1,000 executions/month',
          '10GB storage',
          '5 users',
          'Basic workflows',
          'Email support',
          'Standard compliance',
          'Basic analytics',
          'API access'
        ],
        limits: {
          bots: 5,
          workflows: 10,
          executions: 1000,
          storage: '10GB',
          users: 5,
          apiCalls: 10000,
          dataProcessing: '1GB/month',
          retention: 30
        },
        targetMarket: 'Small businesses',
        industry: 'general',
        compliance: [],
        support: {
          level: 'basic',
          responseTime: '24-48 hours',
          channels: ['Email'],
          features: ['Documentation', 'Basic troubleshooting'],
          sla: '99.5%'
        }
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'Ideal for mid-market companies with growing automation needs',
        monthlyCost: 799,
        features: [
          '20 RPA bots',
          '50 workflows',
          '5,000 executions/month',
          '100GB storage',
          '25 users',
          'Advanced workflows',
          'Phone & email support',
          'Enhanced compliance',
          'Advanced analytics',
          'Priority API access',
          'Custom integrations',
          'Workflow designer'
        ],
        limits: {
          bots: 20,
          workflows: 50,
          executions: 5000,
          storage: '100GB',
          users: 25,
          apiCalls: 50000,
          dataProcessing: '10GB/month',
          retention: 90
        },
        targetMarket: 'Mid-market companies',
        industry: 'general',
        compliance: [],
        support: {
          level: 'standard',
          responseTime: '8-12 hours',
          channels: ['Email', 'Phone'],
          features: ['Documentation', 'Troubleshooting', 'Best practices'],
          sla: '99.7%'
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Comprehensive solution for large enterprises with complex automation requirements',
        monthlyCost: 2499,
        features: [
          'Unlimited RPA bots',
          'Unlimited workflows',
          'Unlimited executions',
          '1TB storage',
          'Unlimited users',
          'Enterprise workflows',
          'Dedicated support',
          'Full compliance suite',
          'Enterprise analytics',
          'Priority API access',
          'Custom integrations',
          'Advanced workflow designer',
          'White-label options',
          'On-premise deployment',
          'Dedicated account manager'
        ],
        limits: {
          bots: -1, // Unlimited
          workflows: -1, // Unlimited
          executions: -1, // Unlimited
          storage: '1TB',
          users: -1, // Unlimited
          apiCalls: -1, // Unlimited
          dataProcessing: 'Unlimited',
          retention: 365
        },
        targetMarket: 'Large enterprises',
        industry: 'general',
        compliance: [],
        support: {
          level: 'enterprise',
          responseTime: '2-4 hours',
          channels: ['Email', 'Phone', 'Chat', 'Video'],
          features: ['Documentation', 'Troubleshooting', 'Best practices', 'Custom training', 'Dedicated support'],
          sla: '99.9%'
        }
      }
    ];

    this.pricingTiers.set('general', baseTiers);
  }

  /**
   * Initialize industry-specific pricing
   */
  private initializeIndustryPricing(): void {
    const industries = [
      'healthcare', 'financial', 'legal', 'government', 'manufacturing',
      'retail', 'education', 'construction', 'logistics', 'hospitality',
      'wellness', 'beauty'
    ];

    for (const industry of industries) {
      this.industryPricing.set(industry, this.createIndustryPricing(industry));
    }
  }

  /**
   * Create industry-specific pricing
   */
  private createIndustryPricing(industry: string): IndustryPricing {
    const baseTiers = this.pricingTiers.get('general')!;
    const industryTiers = baseTiers.map(tier => ({
      ...tier,
      industry,
      monthlyCost: this.calculateIndustryPricing(tier.monthlyCost, industry),
      features: [...tier.features, ...this.getIndustrySpecificFeatures(industry)],
      compliance: this.getIndustryComplianceAddons(industry)
    }));

    return {
      industry,
      basePricing: industryTiers,
      complianceAddons: this.getIndustryComplianceAddons(industry),
      customPricing: this.getIndustryCustomPricing(industry),
      discounts: this.getIndustryDiscounts(industry)
    };
  }

  /**
   * Calculate industry-specific pricing
   */
  private calculateIndustryPricing(basePrice: number, industry: string): number {
    const industryMultipliers: Record<string, number> = {
      'healthcare': 1.3, // 30% premium for HIPAA compliance
      'financial': 1.4, // 40% premium for SOX compliance
      'legal': 1.2, // 20% premium for attorney-client privilege
      'government': 1.5, // 50% premium for government compliance
      'manufacturing': 1.1, // 10% premium for industrial compliance
      'retail': 0.9, // 10% discount for high volume
      'education': 0.8, // 20% discount for educational pricing
      'construction': 1.1, // 10% premium for safety compliance
      'logistics': 1.0, // Standard pricing
      'hospitality': 1.0, // Standard pricing
      'wellness': 1.2, // 20% premium for healthcare compliance
      'beauty': 0.9 // 10% discount for service industry
    };

    const multiplier = industryMultipliers[industry] || 1.0;
    return Math.round(basePrice * multiplier);
  }

  /**
   * Get industry-specific features
   */
  private getIndustrySpecificFeatures(industry: string): string[] {
    const industryFeatures: Record<string, string[]> = {
      'healthcare': [
        'HIPAA compliance',
        'EHR integration',
        'Patient data protection',
        'Healthcare workflows',
        'Medical record automation'
      ],
      'financial': [
        'SOX compliance',
        'Financial reporting',
        'Audit trails',
        'Banking integrations',
        'Fraud detection'
      ],
      'legal': [
        'Attorney-client privilege',
        'Document review automation',
        'Case management',
        'Legal research integration',
        'Billing automation'
      ],
      'government': [
        'FedRAMP compliance',
        'FISMA compliance',
        'Citizen services',
        'Public sector workflows',
        'Security clearance'
      ],
      'manufacturing': [
        'Quality control automation',
        'Production planning',
        'Supply chain management',
        'Safety compliance',
        'Industrial workflows'
      ],
      'retail': [
        'Inventory management',
        'Order processing',
        'Customer service',
        'E-commerce integration',
        'Price monitoring'
      ],
      'education': [
        'Student enrollment',
        'Academic administration',
        'Parent communication',
        'Educational workflows',
        'Campus management'
      ],
      'construction': [
        'Project management',
        'Safety compliance',
        'Resource management',
        'Construction workflows',
        'Permit processing'
      ],
      'logistics': [
        'Route optimization',
        'Fleet management',
        'Delivery tracking',
        'Logistics workflows',
        'Supply chain automation'
      ],
      'hospitality': [
        'Guest services',
        'Reservation management',
        'Concierge automation',
        'Hospitality workflows',
        'Property management'
      ],
      'wellness': [
        'Appointment scheduling',
        'Health assessments',
        'Wellness coaching',
        'Healthcare compliance',
        'Wellness workflows'
      ],
      'beauty': [
        'Service scheduling',
        'Client management',
        'Beauty workflows',
        'Appointment automation',
        'Service recommendations'
      ]
    };

    return industryFeatures[industry] || [];
  }

  /**
   * Get industry compliance addons
   */
  private getIndustryComplianceAddons(industry: string): ComplianceAddon[] {
    const complianceAddons: Record<string, ComplianceAddon[]> = {
      'healthcare': [
        {
          id: 'hipaa_compliance',
          name: 'HIPAA Compliance',
          description: 'Full HIPAA compliance for healthcare data protection',
          monthlyCost: 200,
          requirements: ['HIPAA training', 'Data encryption', 'Audit logging'],
          certifications: ['HIPAA', 'HITECH', 'FDA'],
          industry: 'healthcare'
        }
      ],
      'financial': [
        {
          id: 'sox_compliance',
          name: 'SOX Compliance',
          description: 'SOX compliance for financial reporting controls',
          monthlyCost: 300,
          requirements: ['SOX training', 'Financial controls', 'Audit trails'],
          certifications: ['SOX', 'PCI DSS', 'SOC 2'],
          industry: 'financial'
        }
      ],
      'legal': [
        {
          id: 'legal_compliance',
          name: 'Legal Compliance',
          description: 'Attorney-client privilege and legal compliance',
          monthlyCost: 250,
          requirements: ['Legal training', 'Privilege protection', 'Case management'],
          certifications: ['Bar Association', 'Legal Ethics'],
          industry: 'legal'
        }
      ],
      'government': [
        {
          id: 'government_compliance',
          name: 'Government Compliance',
          description: 'FedRAMP and FISMA compliance for government services',
          monthlyCost: 400,
          requirements: ['Security clearance', 'Government training', 'FedRAMP compliance'],
          certifications: ['FedRAMP', 'FISMA', 'NIST'],
          industry: 'government'
        }
      ]
    };

    return complianceAddons[industry] || [];
  }

  /**
   * Get industry custom pricing options
   */
  private getIndustryCustomPricing(industry: string): CustomPricingOption[] {
    return [
      {
        id: `${industry}_custom_001`,
        name: `${industry.charAt(0).toUpperCase() + industry.slice(1)} Custom Solution`,
        description: `Custom RPA solution tailored for ${industry} industry`,
        pricing: {
          setup: 10000,
          monthly: 5000,
          perBot: 500,
          perWorkflow: 100,
          perExecution: 0.01,
          storage: 0.1,
          support: 1000
        },
        requirements: [
          'Minimum 12-month commitment',
          'Custom development required',
          'Dedicated support team',
          'On-site implementation'
        ],
        timeline: '8-12 weeks',
        support: 'Dedicated account manager and technical support'
      }
    ];
  }

  /**
   * Get industry discount options
   */
  private getIndustryDiscounts(industry: string): DiscountOption[] {
    return [
      {
        id: `${industry}_volume_discount`,
        name: 'Volume Discount',
        description: 'Discount for high-volume usage',
        type: 'percentage',
        value: 15,
        conditions: ['Minimum 100 bots', '12-month commitment'],
        applicable: ['Professional', 'Enterprise']
      },
      {
        id: `${industry}_annual_discount`,
        name: 'Annual Payment Discount',
        description: 'Discount for annual payment',
        type: 'percentage',
        value: 10,
        conditions: ['Annual payment upfront'],
        applicable: ['All tiers']
      },
      {
        id: `${industry}_startup_discount`,
        name: 'Startup Discount',
        description: 'Special pricing for startups',
        type: 'percentage',
        value: 25,
        conditions: ['Startup verification', 'Less than 2 years old'],
        applicable: ['Starter', 'Professional']
      }
    ];
  }

  /**
   * Initialize compliance addons
   */
  private initializeComplianceAddons(): void {
    const addons: ComplianceAddon[] = [
      {
        id: 'hipaa_compliance',
        name: 'HIPAA Compliance',
        description: 'Full HIPAA compliance for healthcare data protection',
        monthlyCost: 200,
        requirements: ['HIPAA training', 'Data encryption', 'Audit logging'],
        certifications: ['HIPAA', 'HITECH', 'FDA'],
        industry: 'healthcare'
      },
      {
        id: 'sox_compliance',
        name: 'SOX Compliance',
        description: 'SOX compliance for financial reporting controls',
        monthlyCost: 300,
        requirements: ['SOX training', 'Financial controls', 'Audit trails'],
        certifications: ['SOX', 'PCI DSS', 'SOC 2'],
        industry: 'financial'
      },
      {
        id: 'gdpr_compliance',
        name: 'GDPR Compliance',
        description: 'GDPR compliance for data privacy and protection',
        monthlyCost: 150,
        requirements: ['GDPR training', 'Data protection', 'Privacy controls'],
        certifications: ['GDPR', 'ISO 27001'],
        industry: 'general'
      },
      {
        id: 'iso27001_compliance',
        name: 'ISO 27001 Compliance',
        description: 'ISO 27001 compliance for information security',
        monthlyCost: 250,
        requirements: ['ISO 27001 training', 'Security controls', 'Risk management'],
        certifications: ['ISO 27001', 'SOC 2'],
        industry: 'general'
      }
    ];

    this.complianceAddons.set('general', addons);
  }

  /**
   * Initialize discount options
   */
  private initializeDiscountOptions(): void {
    this.discountOptions = [
      {
        id: 'volume_discount',
        name: 'Volume Discount',
        description: 'Discount for high-volume usage',
        type: 'percentage',
        value: 15,
        conditions: ['Minimum 100 bots', '12-month commitment'],
        applicable: ['Professional', 'Enterprise']
      },
      {
        id: 'annual_discount',
        name: 'Annual Payment Discount',
        description: 'Discount for annual payment',
        type: 'percentage',
        value: 10,
        conditions: ['Annual payment upfront'],
        applicable: ['All tiers']
      },
      {
        id: 'startup_discount',
        name: 'Startup Discount',
        description: 'Special pricing for startups',
        type: 'percentage',
        value: 25,
        conditions: ['Startup verification', 'Less than 2 years old'],
        applicable: ['Starter', 'Professional']
      },
      {
        id: 'nonprofit_discount',
        name: 'Nonprofit Discount',
        description: 'Special pricing for nonprofit organizations',
        type: 'percentage',
        value: 30,
        conditions: ['Nonprofit verification', '501(c)(3) status'],
        applicable: ['Starter', 'Professional']
      }
    ];
  }

  /**
   * Get pricing for specific industry
   */
  getIndustryPricing(industry: string): IndustryPricing | undefined {
    return this.industryPricing.get(industry);
  }

  /**
   * Get all pricing tiers
   */
  getAllPricingTiers(): RPAPricingTier[] {
    return Array.from(this.pricingTiers.values()).flat();
  }

  /**
   * Get compliance addons for industry
   */
  getComplianceAddons(industry: string): ComplianceAddon[] {
    const industryPricing = this.industryPricing.get(industry);
    return industryPricing?.complianceAddons || [];
  }

  /**
   * Get discount options
   */
  getDiscountOptions(): DiscountOption[] {
    return this.discountOptions;
  }

  /**
   * Calculate pricing for specific configuration
   */
  calculatePricing(config: PricingConfiguration): PricingCalculation {
    const baseTier = this.getPricingTier(config.tierId);
    if (!baseTier) {
      throw new Error(`Pricing tier ${config.tierId} not found`);
    }

    let totalCost = baseTier.monthlyCost;
    const addons: ComplianceAddon[] = [];
    const discounts: DiscountOption[] = [];

    // Add compliance addons
    for (const addonId of config.complianceAddons) {
      const addon = this.getComplianceAddon(addonId);
      if (addon) {
        addons.push(addon);
        totalCost += addon.monthlyCost;
      }
    }

    // Apply discounts
    for (const discountId of config.discounts) {
      const discount = this.getDiscountOption(discountId);
      if (discount && this.isDiscountApplicable(discount, config)) {
        discounts.push(discount);
        if (discount.type === 'percentage') {
          totalCost *= (1 - discount.value / 100);
        } else if (discount.type === 'fixed') {
          totalCost -= discount.value;
        }
      }
    }

    return {
      baseTier,
      addons,
      discounts,
      subtotal: baseTier.monthlyCost + addons.reduce((sum, addon) => sum + addon.monthlyCost, 0),
      discountAmount: discounts.reduce((sum, discount) => {
        if (discount.type === 'percentage') {
          return sum + (baseTier.monthlyCost * discount.value / 100);
        } else if (discount.type === 'fixed') {
          return sum + discount.value;
        }
        return sum;
      }, 0),
      totalCost: Math.max(0, totalCost),
      savings: discounts.reduce((sum, discount) => {
        if (discount.type === 'percentage') {
          return sum + (baseTier.monthlyCost * discount.value / 100);
        } else if (discount.type === 'fixed') {
          return sum + discount.value;
        }
        return sum;
      }, 0)
    };
  }

  /**
   * Get pricing tier by ID
   */
  private getPricingTier(tierId: string): RPAPricingTier | undefined {
    for (const tiers of this.pricingTiers.values()) {
      const tier = tiers.find(t => t.id === tierId);
      if (tier) return tier;
    }
    return undefined;
  }

  /**
   * Get compliance addon by ID
   */
  private getComplianceAddon(addonId: string): ComplianceAddon | undefined {
    for (const addons of this.complianceAddons.values()) {
      const addon = addons.find(a => a.id === addonId);
      if (addon) return addon;
    }
    return undefined;
  }

  /**
   * Get discount option by ID
   */
  private getDiscountOption(discountId: string): DiscountOption | undefined {
    return this.discountOptions.find(d => d.id === discountId);
  }

  /**
   * Check if discount is applicable
   */
  private isDiscountApplicable(discount: DiscountOption, config: PricingConfiguration): boolean {
    // Check if discount applies to the selected tier
    if (!discount.applicable.includes(config.tierId)) {
      return false;
    }

    // Check conditions (simplified - would need more complex logic in real implementation)
    return true;
  }
}

// Supporting interfaces
export interface PricingConfiguration {
  tierId: string;
  industry: string;
  complianceAddons: string[];
  discounts: string[];
  customRequirements?: string[];
}

export interface PricingCalculation {
  baseTier: RPAPricingTier;
  addons: ComplianceAddon[];
  discounts: DiscountOption[];
  subtotal: number;
  discountAmount: number;
  totalCost: number;
  savings: number;
}
