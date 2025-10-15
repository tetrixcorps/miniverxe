// TETRIX Compliance Framework Service
// HIPAA, FERPA, SOX, GDPR, PCI DSS, and other industry compliance implementations

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  industry: string;
  version: string;
  effectiveDate: string;
  requirements: ComplianceRequirement[];
  controls: ComplianceControl[];
  assessments: ComplianceAssessment[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  controls: string[];
  isRequired: boolean;
  implementationGuidance: string;
  testingGuidance: string;
  references: string[];
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  type: 'technical' | 'administrative' | 'physical';
  category: string;
  implementation: string;
  testing: string;
  isImplemented: boolean;
  lastTested?: string;
  testResult?: 'pass' | 'fail' | 'partial' | 'not_tested';
  testNotes?: string;
  remediation?: string;
  owner?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceAssessment {
  id: string;
  name: string;
  description: string;
  frameworkId: string;
  type: 'self_assessment' | 'third_party' | 'audit' | 'penetration_test';
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
  startDate: string;
  endDate?: string;
  assessor: string;
  findings: ComplianceFinding[];
  score: number;
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceFinding {
  id: string;
  requirementId: string;
  controlId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  description: string;
  evidence: string[];
  remediation: string;
  dueDate?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceReport {
  id: string;
  name: string;
  description: string;
  frameworkId: string;
  organizationId: string;
  type: 'compliance_status' | 'gap_analysis' | 'risk_assessment' | 'audit_report';
  status: 'draft' | 'review' | 'approved' | 'published';
  data: ComplianceReportData;
  generatedAt: string;
  generatedBy: string;
  approvedBy?: string;
  publishedAt?: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  downloadUrl?: string;
}

export interface ComplianceReportData {
  summary: {
    totalRequirements: number;
    implementedRequirements: number;
    partialRequirements: number;
    notImplementedRequirements: number;
    complianceScore: number;
  };
  requirements: Array<{
    id: string;
    name: string;
    status: 'implemented' | 'partial' | 'not_implemented';
    score: number;
    findings: ComplianceFinding[];
  }>;
  controls: Array<{
    id: string;
    name: string;
    status: 'implemented' | 'partial' | 'not_implemented';
    testResult: 'pass' | 'fail' | 'partial' | 'not_tested';
    lastTested: string;
  }>;
  recommendations: string[];
  nextSteps: string[];
}

export interface ComplianceTraining {
  id: string;
  name: string;
  description: string;
  frameworkId: string;
  type: 'online' | 'in_person' | 'workshop' | 'certification';
  duration: number; // in minutes
  content: string[];
  assessments: ComplianceTrainingAssessment[];
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceTrainingAssessment {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'essay';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation: string;
}

export interface ComplianceIncident {
  id: string;
  title: string;
  description: string;
  frameworkId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  dueDate?: string;
  resolution?: string;
  lessonsLearned?: string;
  preventiveMeasures?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Compliance Framework Service
 */
export class ComplianceFrameworkService {
  private frameworks: Map<string, ComplianceFramework> = new Map();
  private assessments: Map<string, ComplianceAssessment> = new Map();
  private reports: Map<string, ComplianceReport> = new Map();
  private trainings: Map<string, ComplianceTraining> = new Map();
  private incidents: Map<string, ComplianceIncident> = new Map();

  constructor() {
    this.initializeFrameworks();
  }

  /**
   * Initialize compliance frameworks
   */
  private initializeFrameworks(): void {
    this.initializeHIPAA();
    this.initializeFERPA();
    this.initializeSOX();
    this.initializeGDPR();
    this.initializePCIDSS();
    this.initializeSOC2();
    this.initializeISO27001();
  }

  /**
   * Initialize HIPAA framework
   */
  private initializeHIPAA(): void {
    const hipaa: ComplianceFramework = {
      id: 'hipaa',
      name: 'HIPAA (Health Insurance Portability and Accountability Act)',
      description: 'Protects the privacy and security of individually identifiable health information',
      industry: 'healthcare',
      version: '2023',
      effectiveDate: '2023-01-01',
      requirements: [
        {
          id: 'hipaa_privacy_rule',
          name: 'Privacy Rule',
          description: 'Protect the privacy of individually identifiable health information',
          category: 'privacy',
          severity: 'critical',
          controls: ['access_controls', 'audit_logging', 'data_encryption', 'user_training'],
          isRequired: true,
          implementationGuidance: 'Implement administrative, physical, and technical safeguards to protect PHI',
          testingGuidance: 'Conduct regular risk assessments and penetration testing',
          references: ['45 CFR 164.502', '45 CFR 164.504', '45 CFR 164.506']
        },
        {
          id: 'hipaa_security_rule',
          name: 'Security Rule',
          description: 'Ensure the confidentiality, integrity, and availability of electronic protected health information',
          category: 'security',
          severity: 'critical',
          controls: ['technical_safeguards', 'administrative_safeguards', 'physical_safeguards'],
          isRequired: true,
          implementationGuidance: 'Implement technical, administrative, and physical safeguards for ePHI',
          testingGuidance: 'Regular security assessments and vulnerability testing',
          references: ['45 CFR 164.302', '45 CFR 164.304', '45 CFR 164.306']
        },
        {
          id: 'hipaa_breach_notification',
          name: 'Breach Notification Rule',
          description: 'Notify individuals and HHS of breaches of unsecured PHI',
          category: 'incident_response',
          severity: 'high',
          controls: ['breach_detection', 'notification_procedures', 'documentation'],
          isRequired: true,
          implementationGuidance: 'Establish breach detection and notification procedures',
          testingGuidance: 'Test breach notification procedures and response times',
          references: ['45 CFR 164.400', '45 CFR 164.402', '45 CFR 164.404']
        }
      ],
      controls: [
        {
          id: 'access_controls',
          name: 'Access Controls',
          description: 'Implement user authentication and authorization controls',
          type: 'technical',
          category: 'authentication',
          implementation: 'Multi-factor authentication, role-based access control, and regular access reviews',
          testing: 'Penetration testing, access reviews, and authentication testing',
          isImplemented: false,
          priority: 'critical'
        },
        {
          id: 'audit_logging',
          name: 'Audit Logging',
          description: 'Log and monitor access to PHI',
          type: 'technical',
          category: 'monitoring',
          implementation: 'Comprehensive audit logging of all PHI access and modifications',
          testing: 'Log analysis and monitoring system testing',
          isImplemented: false,
          priority: 'high'
        },
        {
          id: 'data_encryption',
          name: 'Data Encryption',
          description: 'Encrypt PHI at rest and in transit',
          type: 'technical',
          category: 'encryption',
          implementation: 'AES-256 encryption for data at rest, TLS 1.3 for data in transit',
          testing: 'Encryption testing and key management validation',
          isImplemented: false,
          priority: 'critical'
        },
        {
          id: 'user_training',
          name: 'User Training',
          description: 'Train workforce members on HIPAA requirements',
          type: 'administrative',
          category: 'training',
          implementation: 'Regular HIPAA training for all workforce members',
          testing: 'Training completion tracking and knowledge assessments',
          isImplemented: false,
          priority: 'high'
        }
      ],
      assessments: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.frameworks.set('hipaa', hipaa);
  }

  /**
   * Initialize FERPA framework
   */
  private initializeFERPA(): void {
    const ferpa: ComplianceFramework = {
      id: 'ferpa',
      name: 'FERPA (Family Educational Rights and Privacy Act)',
      description: 'Protects the privacy of student education records',
      industry: 'education',
      version: '2023',
      effectiveDate: '2023-01-01',
      requirements: [
        {
          id: 'ferpa_privacy_protection',
          name: 'Privacy Protection',
          description: 'Protect the privacy of student education records',
          category: 'privacy',
          severity: 'high',
          controls: ['access_controls', 'consent_management', 'data_retention'],
          isRequired: true,
          implementationGuidance: 'Implement controls to protect student education records',
          testingGuidance: 'Regular privacy assessments and access reviews',
          references: ['20 U.S.C. § 1232g', '34 CFR Part 99']
        },
        {
          id: 'ferpa_consent_management',
          name: 'Consent Management',
          description: 'Manage parental and student consent for record disclosure',
          category: 'consent',
          severity: 'high',
          controls: ['consent_tracking', 'consent_verification', 'consent_withdrawal'],
          isRequired: true,
          implementationGuidance: 'Implement consent management system for record disclosure',
          testingGuidance: 'Test consent workflows and verification processes',
          references: ['34 CFR 99.30', '34 CFR 99.31']
        }
      ],
      controls: [
        {
          id: 'access_controls',
          name: 'Access Controls',
          description: 'Control access to student education records',
          type: 'technical',
          category: 'authentication',
          implementation: 'Role-based access control and regular access reviews',
          testing: 'Access review testing and permission validation',
          isImplemented: false,
          priority: 'high'
        },
        {
          id: 'consent_management',
          name: 'Consent Management',
          description: 'Manage parental and student consent',
          type: 'administrative',
          category: 'consent',
          implementation: 'Consent tracking and verification system',
          testing: 'Consent workflow testing and verification',
          isImplemented: false,
          priority: 'high'
        }
      ],
      assessments: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.frameworks.set('ferpa', ferpa);
  }

  /**
   * Initialize SOX framework
   */
  private initializeSOX(): void {
    const sox: ComplianceFramework = {
      id: 'sox',
      name: 'SOX (Sarbanes-Oxley Act)',
      description: 'Mandates certain practices in financial record keeping and reporting',
      industry: 'financial',
      version: '2023',
      effectiveDate: '2023-01-01',
      requirements: [
        {
          id: 'sox_internal_controls',
          name: 'Internal Controls',
          description: 'Establish and maintain internal controls over financial reporting',
          category: 'financial_controls',
          severity: 'critical',
          controls: ['control_documentation', 'control_testing', 'deficiency_management'],
          isRequired: true,
          implementationGuidance: 'Document and test internal controls over financial reporting',
          testingGuidance: 'Regular control testing and deficiency assessment',
          references: ['Section 404', 'Section 302']
        },
        {
          id: 'sox_audit_committee',
          name: 'Audit Committee Independence',
          description: 'Ensure audit committee independence and oversight',
          category: 'governance',
          severity: 'high',
          controls: ['committee_independence', 'oversight_procedures', 'reporting'],
          isRequired: true,
          implementationGuidance: 'Establish independent audit committee with proper oversight',
          testingGuidance: 'Committee independence assessment and oversight review',
          references: ['Section 301', 'Section 407']
        }
      ],
      controls: [
        {
          id: 'control_documentation',
          name: 'Control Documentation',
          description: 'Document internal controls over financial reporting',
          type: 'administrative',
          category: 'documentation',
          implementation: 'Comprehensive documentation of all financial controls',
          testing: 'Documentation review and control walkthroughs',
          isImplemented: false,
          priority: 'critical'
        },
        {
          id: 'control_testing',
          name: 'Control Testing',
          description: 'Test internal controls for effectiveness',
          type: 'administrative',
          category: 'testing',
          implementation: 'Regular testing of financial controls',
          testing: 'Control effectiveness testing and validation',
          isImplemented: false,
          priority: 'high'
        }
      ],
      assessments: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.frameworks.set('sox', sox);
  }

  /**
   * Initialize GDPR framework
   */
  private initializeGDPR(): void {
    const gdpr: ComplianceFramework = {
      id: 'gdpr',
      name: 'GDPR (General Data Protection Regulation)',
      description: 'EU data privacy and security law',
      industry: 'all',
      version: '2023',
      effectiveDate: '2023-01-01',
      requirements: [
        {
          id: 'gdpr_lawfulness',
          name: 'Lawfulness, Fairness and Transparency',
          description: 'Process personal data lawfully, fairly and transparently',
          category: 'privacy',
          severity: 'critical',
          controls: ['lawful_basis', 'transparency_notices', 'consent_management'],
          isRequired: true,
          implementationGuidance: 'Establish lawful basis for processing and provide transparent notices',
          testingGuidance: 'Review processing activities and consent mechanisms',
          references: ['Article 5(1)(a)', 'Article 6', 'Article 7']
        },
        {
          id: 'gdpr_data_minimization',
          name: 'Data Minimization',
          description: 'Collect only necessary personal data',
          category: 'privacy',
          severity: 'high',
          controls: ['data_mapping', 'retention_policies', 'purpose_limitation'],
          isRequired: true,
          implementationGuidance: 'Implement data minimization principles and retention policies',
          testingGuidance: 'Data mapping and retention policy review',
          references: ['Article 5(1)(c)', 'Article 5(1)(e)']
        },
        {
          id: 'gdpr_rights',
          name: 'Data Subject Rights',
          description: 'Enable data subjects to exercise their rights',
          category: 'privacy',
          severity: 'high',
          controls: ['rights_management', 'response_procedures', 'verification'],
          isRequired: true,
          implementationGuidance: 'Implement procedures to handle data subject rights requests',
          testingGuidance: 'Test data subject rights procedures and response times',
          references: ['Chapter III', 'Articles 12-23']
        }
      ],
      controls: [
        {
          id: 'lawful_basis',
          name: 'Lawful Basis',
          description: 'Establish lawful basis for processing personal data',
          type: 'administrative',
          category: 'legal',
          implementation: 'Document lawful basis for all processing activities',
          testing: 'Review processing activities and lawful basis documentation',
          isImplemented: false,
          priority: 'critical'
        },
        {
          id: 'consent_management',
          name: 'Consent Management',
          description: 'Manage consent for personal data processing',
          type: 'technical',
          category: 'consent',
          implementation: 'Consent management system with withdrawal capabilities',
          testing: 'Test consent workflows and withdrawal procedures',
          isImplemented: false,
          priority: 'high'
        },
        {
          id: 'data_mapping',
          name: 'Data Mapping',
          description: 'Map personal data processing activities',
          type: 'administrative',
          category: 'documentation',
          implementation: 'Comprehensive data mapping of all processing activities',
          testing: 'Review data mapping accuracy and completeness',
          isImplemented: false,
          priority: 'high'
        }
      ],
      assessments: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.frameworks.set('gdpr', gdpr);
  }

  /**
   * Initialize PCI DSS framework
   */
  private initializePCIDSS(): void {
    const pci: ComplianceFramework = {
      id: 'pci_dss',
      name: 'PCI DSS (Payment Card Industry Data Security Standard)',
      description: 'Protects credit card data',
      industry: 'financial',
      version: '4.0',
      effectiveDate: '2023-01-01',
      requirements: [
        {
          id: 'pci_secure_network',
          name: 'Secure Network and Systems',
          description: 'Build and maintain a secure network and systems',
          category: 'network_security',
          severity: 'critical',
          controls: ['firewall_configuration', 'default_passwords', 'network_segmentation'],
          isRequired: true,
          implementationGuidance: 'Implement secure network architecture and firewall rules',
          testingGuidance: 'Network security testing and firewall configuration review',
          references: ['Requirement 1', 'Requirement 2']
        },
        {
          id: 'pci_cardholder_data',
          name: 'Protect Cardholder Data',
          description: 'Protect stored cardholder data',
          category: 'data_protection',
          severity: 'critical',
          controls: ['data_encryption', 'key_management', 'data_retention'],
          isRequired: true,
          implementationGuidance: 'Encrypt cardholder data and implement key management',
          testingGuidance: 'Encryption testing and key management validation',
          references: ['Requirement 3', 'Requirement 4']
        },
        {
          id: 'pci_vulnerability_management',
          name: 'Vulnerability Management',
          description: 'Maintain a vulnerability management program',
          category: 'security',
          severity: 'high',
          controls: ['vulnerability_scanning', 'patch_management', 'secure_configuration'],
          isRequired: true,
          implementationGuidance: 'Implement vulnerability scanning and patch management',
          testingGuidance: 'Vulnerability assessment and patch management review',
          references: ['Requirement 5', 'Requirement 6']
        }
      ],
      controls: [
        {
          id: 'firewall_configuration',
          name: 'Firewall Configuration',
          description: 'Configure and maintain firewalls',
          type: 'technical',
          category: 'network',
          implementation: 'Proper firewall configuration and rule management',
          testing: 'Firewall testing and configuration review',
          isImplemented: false,
          priority: 'critical'
        },
        {
          id: 'data_encryption',
          name: 'Data Encryption',
          description: 'Encrypt cardholder data',
          type: 'technical',
          category: 'encryption',
          implementation: 'Strong encryption for cardholder data at rest and in transit',
          testing: 'Encryption testing and key management validation',
          isImplemented: false,
          priority: 'critical'
        },
        {
          id: 'vulnerability_scanning',
          name: 'Vulnerability Scanning',
          description: 'Regular vulnerability scanning',
          type: 'technical',
          category: 'security',
          implementation: 'Regular vulnerability scans and remediation',
          testing: 'Vulnerability assessment and remediation testing',
          isImplemented: false,
          priority: 'high'
        }
      ],
      assessments: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.frameworks.set('pci_dss', pci);
  }

  /**
   * Initialize SOC 2 framework
   */
  private initializeSOC2(): void {
    const soc2: ComplianceFramework = {
      id: 'soc2',
      name: 'SOC 2 Type 1 & Type 2',
      description: 'Report on Controls at a Service Organization',
      industry: 'all',
      version: '2023',
      effectiveDate: '2023-01-01',
      requirements: [
        {
          id: 'soc2_cc1',
          name: 'CC1 - Control Environment',
          description: 'Establish and maintain a control environment',
          category: 'governance',
          severity: 'high',
          controls: ['governance_structure', 'ethical_values', 'management_oversight'],
          isRequired: true,
          implementationGuidance: 'Establish governance structure and ethical values',
          testingGuidance: 'Review governance structure and ethical values',
          references: ['CC1.1', 'CC1.2', 'CC1.3']
        },
        {
          id: 'soc2_cc6',
          name: 'CC6 - Logical and Physical Access Controls',
          description: 'Implement logical and physical access controls',
          category: 'access_control',
          severity: 'critical',
          controls: ['access_management', 'physical_security', 'privileged_access'],
          isRequired: true,
          implementationGuidance: 'Implement comprehensive access controls',
          testingGuidance: 'Access control testing and review',
          references: ['CC6.1', 'CC6.2', 'CC6.3']
        }
      ],
      controls: [
        {
          id: 'governance_structure',
          name: 'Governance Structure',
          description: 'Establish governance structure',
          type: 'administrative',
          category: 'governance',
          implementation: 'Clear governance structure and responsibilities',
          testing: 'Governance structure review and assessment',
          isImplemented: false,
          priority: 'high'
        },
        {
          id: 'access_management',
          name: 'Access Management',
          description: 'Manage user access and privileges',
          type: 'technical',
          category: 'access_control',
          implementation: 'Comprehensive access management system',
          testing: 'Access management testing and review',
          isImplemented: false,
          priority: 'critical'
        }
      ],
      assessments: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.frameworks.set('soc2', soc2);
  }

  /**
   * Initialize ISO 27001 framework
   */
  private initializeISO27001(): void {
    const iso27001: ComplianceFramework = {
      id: 'iso27001',
      name: 'ISO 27001:2022',
      description: 'Information Security Management System',
      industry: 'all',
      version: '2022',
      effectiveDate: '2023-01-01',
      requirements: [
        {
          id: 'iso27001_context',
          name: 'Context of the Organization',
          description: 'Understand the organization and its context',
          category: 'governance',
          severity: 'high',
          controls: ['context_analysis', 'stakeholder_identification', 'scope_definition'],
          isRequired: true,
          implementationGuidance: 'Analyze organizational context and stakeholders',
          testingGuidance: 'Review context analysis and stakeholder identification',
          references: ['Clause 4.1', 'Clause 4.2']
        },
        {
          id: 'iso27001_risk_assessment',
          name: 'Risk Assessment',
          description: 'Assess information security risks',
          category: 'risk_management',
          severity: 'critical',
          controls: ['risk_identification', 'risk_analysis', 'risk_evaluation'],
          isRequired: true,
          implementationGuidance: 'Implement comprehensive risk assessment process',
          testingGuidance: 'Risk assessment review and validation',
          references: ['Clause 6.1.2']
        }
      ],
      controls: [
        {
          id: 'context_analysis',
          name: 'Context Analysis',
          description: 'Analyze organizational context',
          type: 'administrative',
          category: 'governance',
          implementation: 'Comprehensive analysis of organizational context',
          testing: 'Context analysis review and validation',
          isImplemented: false,
          priority: 'high'
        },
        {
          id: 'risk_identification',
          name: 'Risk Identification',
          description: 'Identify information security risks',
          type: 'administrative',
          category: 'risk_management',
          implementation: 'Systematic risk identification process',
          testing: 'Risk identification process review',
          isImplemented: false,
          priority: 'critical'
        }
      ],
      assessments: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.frameworks.set('iso27001', iso27001);
  }

  /**
   * Get framework by ID
   */
  getFramework(frameworkId: string): ComplianceFramework | null {
    return this.frameworks.get(frameworkId) || null;
  }

  /**
   * Get all frameworks
   */
  getAllFrameworks(): ComplianceFramework[] {
    return Array.from(this.frameworks.values());
  }

  /**
   * Get frameworks by industry
   */
  getFrameworksByIndustry(industry: string): ComplianceFramework[] {
    return Array.from(this.frameworks.values()).filter(framework => 
      framework.industry === industry || framework.industry === 'all'
    );
  }

  /**
   * Create compliance assessment
   */
  async createAssessment(assessment: Omit<ComplianceAssessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComplianceAssessment> {
    const newAssessment: ComplianceAssessment = {
      ...assessment,
      id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.assessments.set(newAssessment.id, newAssessment);
    console.log(`✅ Created compliance assessment: ${newAssessment.name} for framework: ${newAssessment.frameworkId}`);
    return newAssessment;
  }

  /**
   * Update compliance assessment
   */
  async updateAssessment(assessmentId: string, updates: Partial<ComplianceAssessment>): Promise<ComplianceAssessment | null> {
    const assessment = this.assessments.get(assessmentId);
    if (!assessment) {
      console.warn(`Assessment with ID ${assessmentId} not found.`);
      return null;
    }

    const updatedAssessment = {
      ...assessment,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.assessments.set(assessmentId, updatedAssessment);
    console.log(`✅ Updated compliance assessment: ${updatedAssessment.name}`);
    return updatedAssessment;
  }

  /**
   * Get assessment by ID
   */
  getAssessment(assessmentId: string): ComplianceAssessment | null {
    return this.assessments.get(assessmentId) || null;
  }

  /**
   * Get assessments by framework
   */
  getAssessmentsByFramework(frameworkId: string): ComplianceAssessment[] {
    return Array.from(this.assessments.values()).filter(assessment => 
      assessment.frameworkId === frameworkId
    );
  }

  /**
   * Create compliance report
   */
  async createReport(report: Omit<ComplianceReport, 'id' | 'generatedAt'>): Promise<ComplianceReport> {
    const newReport: ComplianceReport = {
      ...report,
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      generatedAt: new Date().toISOString()
    };

    this.reports.set(newReport.id, newReport);
    console.log(`✅ Created compliance report: ${newReport.name} for framework: ${newReport.frameworkId}`);
    return newReport;
  }

  /**
   * Get report by ID
   */
  getReport(reportId: string): ComplianceReport | null {
    return this.reports.get(reportId) || null;
  }

  /**
   * Get reports by framework
   */
  getReportsByFramework(frameworkId: string): ComplianceReport[] {
    return Array.from(this.reports.values()).filter(report => 
      report.frameworkId === frameworkId
    );
  }

  /**
   * Create compliance training
   */
  async createTraining(training: Omit<ComplianceTraining, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComplianceTraining> {
    const newTraining: ComplianceTraining = {
      ...training,
      id: `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.trainings.set(newTraining.id, newTraining);
    console.log(`✅ Created compliance training: ${newTraining.name} for framework: ${newTraining.frameworkId}`);
    return newTraining;
  }

  /**
   * Get training by ID
   */
  getTraining(trainingId: string): ComplianceTraining | null {
    return this.trainings.get(trainingId) || null;
  }

  /**
   * Get trainings by framework
   */
  getTrainingsByFramework(frameworkId: string): ComplianceTraining[] {
    return Array.from(this.trainings.values()).filter(training => 
      training.frameworkId === frameworkId
    );
  }

  /**
   * Create compliance incident
   */
  async createIncident(incident: Omit<ComplianceIncident, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComplianceIncident> {
    const newIncident: ComplianceIncident = {
      ...incident,
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.incidents.set(newIncident.id, newIncident);
    console.log(`✅ Created compliance incident: ${newIncident.title} for framework: ${newIncident.frameworkId}`);
    return newIncident;
  }

  /**
   * Update compliance incident
   */
  async updateIncident(incidentId: string, updates: Partial<ComplianceIncident>): Promise<ComplianceIncident | null> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      console.warn(`Incident with ID ${incidentId} not found.`);
      return null;
    }

    const updatedIncident = {
      ...incident,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.incidents.set(incidentId, updatedIncident);
    console.log(`✅ Updated compliance incident: ${updatedIncident.title}`);
    return updatedIncident;
  }

  /**
   * Get incident by ID
   */
  getIncident(incidentId: string): ComplianceIncident | null {
    return this.incidents.get(incidentId) || null;
  }

  /**
   * Get incidents by framework
   */
  getIncidentsByFramework(frameworkId: string): ComplianceIncident[] {
    return Array.from(this.incidents.values()).filter(incident => 
      incident.frameworkId === frameworkId
    );
  }

  /**
   * Get compliance status for organization
   */
  async getComplianceStatus(organizationId: string, frameworkId: string): Promise<{
    framework: ComplianceFramework;
    status: 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_assessed';
    score: number;
    requirements: Array<{
      id: string;
      name: string;
      status: 'compliant' | 'partially_compliant' | 'non_compliant';
      score: number;
    }>;
    controls: Array<{
      id: string;
      name: string;
      status: 'implemented' | 'partial' | 'not_implemented';
      testResult: 'pass' | 'fail' | 'partial' | 'not_tested';
    }>;
    recommendations: string[];
  }> {
    const framework = this.getFramework(frameworkId);
    if (!framework) {
      throw new Error(`Framework ${frameworkId} not found`);
    }

    // Simulate compliance status calculation
    const requirements = framework.requirements.map(req => ({
      id: req.id,
      name: req.name,
      status: this.calculateRequirementStatus(req),
      score: this.calculateRequirementScore(req)
    }));

    const controls = framework.controls.map(control => ({
      id: control.id,
      name: control.name,
      status: control.isImplemented ? 'implemented' : 'not_implemented',
      testResult: control.testResult || 'not_tested'
    }));

    const overallScore = this.calculateOverallScore(requirements);
    const status = this.determineComplianceStatus(overallScore);

    const recommendations = this.generateRecommendations(requirements, controls);

    console.log(`✅ Retrieved compliance status for organization ${organizationId} and framework ${frameworkId}`);

    return {
      framework,
      status,
      score: overallScore,
      requirements,
      controls,
      recommendations
    };
  }

  /**
   * Calculate requirement status
   */
  private calculateRequirementStatus(requirement: ComplianceRequirement): 'compliant' | 'partially_compliant' | 'non_compliant' {
    // Simulate status calculation based on controls
    const implementedControls = requirement.controls.length * 0.7; // 70% implemented
    if (implementedControls >= requirement.controls.length) {
      return 'compliant';
    } else if (implementedControls >= requirement.controls.length * 0.5) {
      return 'partially_compliant';
    } else {
      return 'non_compliant';
    }
  }

  /**
   * Calculate requirement score
   */
  private calculateRequirementScore(requirement: ComplianceRequirement): number {
    const status = this.calculateRequirementStatus(requirement);
    switch (status) {
      case 'compliant': return 100;
      case 'partially_compliant': return 60;
      case 'non_compliant': return 20;
      default: return 0;
    }
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(requirements: Array<{ score: number }>): number {
    if (requirements.length === 0) return 0;
    const totalScore = requirements.reduce((sum, req) => sum + req.score, 0);
    return Math.round(totalScore / requirements.length);
  }

  /**
   * Determine compliance status
   */
  private determineComplianceStatus(score: number): 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_assessed' {
    if (score >= 90) return 'compliant';
    if (score >= 70) return 'partially_compliant';
    if (score >= 30) return 'non_compliant';
    return 'not_assessed';
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(requirements: Array<{ status: string; name: string }>, controls: Array<{ status: string; name: string }>): string[] {
    const recommendations: string[] = [];

    requirements.forEach(req => {
      if (req.status === 'non_compliant') {
        recommendations.push(`Implement controls for ${req.name}`);
      } else if (req.status === 'partially_compliant') {
        recommendations.push(`Complete implementation of ${req.name}`);
      }
    });

    controls.forEach(control => {
      if (control.status === 'not_implemented') {
        recommendations.push(`Implement ${control.name} control`);
      }
    });

    return recommendations;
  }
}
