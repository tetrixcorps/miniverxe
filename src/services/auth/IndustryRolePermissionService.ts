// TETRIX Industry-Specific Role and Permission Management Service
// RBAC (Role-Based Access Control) and ABAC (Attribute-Based Access Control) implementation

export interface IndustryRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  industry: string;
  level: 'admin' | 'manager' | 'user' | 'viewer' | 'guest';
  permissions: string[];
  restrictions: string[];
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface IndustryPermission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  industry: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  isSystemPermission: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCondition {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'between';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface IndustryUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  industry: string;
  organizationId: string;
  organizationName: string;
  roles: string[];
  permissions: string[];
  attributes: Record<string, any>;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndustryOrganization {
  id: string;
  name: string;
  industry: string;
  type: 'enterprise' | 'small_business' | 'nonprofit' | 'government' | 'education';
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  complianceRequirements: string[];
  customFields: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  industry: string;
  rules: AccessRule[];
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccessRule {
  id: string;
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  subjects: string[]; // roles, users, groups
  resources: string[];
  actions: string[];
  conditions: PermissionCondition[];
  priority: number;
  isActive: boolean;
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  policyId?: string;
  ruleId?: string;
  conditions?: PermissionCondition[];
  timestamp: string;
}

export interface IndustryCompliance {
  id: string;
  name: string;
  industry: string;
  requirements: ComplianceRequirement[];
  controls: ComplianceControl[];
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
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  type: 'technical' | 'administrative' | 'physical';
  implementation: string;
  testing: string;
  isImplemented: boolean;
  lastTested?: string;
  testResult?: 'pass' | 'fail' | 'partial';
}

/**
 * Industry-Specific Role and Permission Management Service
 */
export class IndustryRolePermissionService {
  private roles: Map<string, IndustryRole> = new Map();
  private permissions: Map<string, IndustryPermission> = new Map();
  private users: Map<string, IndustryUser> = new Map();
  private organizations: Map<string, IndustryOrganization> = new Map();
  private policies: Map<string, AccessPolicy> = new Map();
  private compliance: Map<string, IndustryCompliance> = new Map();

  constructor() {
    this.initializeDefaultRoles();
    this.initializeDefaultPermissions();
    this.initializeDefaultPolicies();
    this.initializeComplianceFrameworks();
  }

  /**
   * Initialize default roles for each industry
   */
  private initializeDefaultRoles(): void {
    const industries = [
      'healthcare', 'legal', 'real_estate', 'ecommerce', 'construction',
      'logistics', 'government', 'education', 'retail', 'hospitality',
      'wellness', 'beauty', 'banking', 'insurance', 'manufacturing'
    ];

    industries.forEach(industry => {
      // Admin role
      this.roles.set(`${industry}_admin`, {
        id: `${industry}_admin`,
        name: `${industry}_admin`,
        displayName: `${this.capitalize(industry)} Administrator`,
        description: `Full administrative access for ${industry} industry`,
        industry,
        level: 'admin',
        permissions: this.getAdminPermissions(industry),
        restrictions: [],
        isSystemRole: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system'
      });

      // Manager role
      this.roles.set(`${industry}_manager`, {
        id: `${industry}_manager`,
        name: `${industry}_manager`,
        displayName: `${this.capitalize(industry)} Manager`,
        description: `Management access for ${industry} industry`,
        industry,
        level: 'manager',
        permissions: this.getManagerPermissions(industry),
        restrictions: this.getManagerRestrictions(industry),
        isSystemRole: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system'
      });

      // User role
      this.roles.set(`${industry}_user`, {
        id: `${industry}_user`,
        name: `${industry}_user`,
        displayName: `${this.capitalize(industry)} User`,
        description: `Standard user access for ${industry} industry`,
        industry,
        level: 'user',
        permissions: this.getUserPermissions(industry),
        restrictions: this.getUserRestrictions(industry),
        isSystemRole: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system'
      });

      // Viewer role
      this.roles.set(`${industry}_viewer`, {
        id: `${industry}_viewer`,
        name: `${industry}_viewer`,
        displayName: `${this.capitalize(industry)} Viewer`,
        description: `Read-only access for ${industry} industry`,
        industry,
        level: 'viewer',
        permissions: this.getViewerPermissions(industry),
        restrictions: this.getViewerRestrictions(industry),
        isSystemRole: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system'
      });
    });
  }

  /**
   * Initialize default permissions for each industry
   */
  private initializeDefaultPermissions(): void {
    const industries = [
      'healthcare', 'legal', 'real_estate', 'ecommerce', 'construction',
      'logistics', 'government', 'education', 'retail', 'hospitality',
      'wellness', 'beauty', 'banking', 'insurance', 'manufacturing'
    ];

    industries.forEach(industry => {
      // Core permissions
      this.addPermission({
        id: `${industry}_read`,
        name: `${industry}_read`,
        displayName: `Read ${this.capitalize(industry)} Data`,
        description: `Read access to ${industry} data and records`,
        category: 'data_access',
        industry,
        resource: `${industry}_data`,
        action: 'read',
        isSystemPermission: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      this.addPermission({
        id: `${industry}_write`,
        name: `${industry}_write`,
        displayName: `Write ${this.capitalize(industry)} Data`,
        description: `Write access to ${industry} data and records`,
        category: 'data_access',
        industry,
        resource: `${industry}_data`,
        action: 'write',
        isSystemPermission: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      this.addPermission({
        id: `${industry}_delete`,
        name: `${industry}_delete`,
        displayName: `Delete ${this.capitalize(industry)} Data`,
        description: `Delete access to ${industry} data and records`,
        category: 'data_access',
        industry,
        resource: `${industry}_data`,
        action: 'delete',
        isSystemPermission: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Industry-specific permissions
      this.addIndustrySpecificPermissions(industry);
    });
  }

  /**
   * Add industry-specific permissions
   */
  private addIndustrySpecificPermissions(industry: string): void {
    switch (industry) {
      case 'healthcare':
        this.addPermission({
          id: 'healthcare_patient_access',
          name: 'healthcare_patient_access',
          displayName: 'Patient Data Access',
          description: 'Access to patient health information',
          category: 'patient_care',
          industry,
          resource: 'patient_data',
          action: 'read',
          conditions: [
            {
              attribute: 'user.role',
              operator: 'in',
              value: ['healthcare_provider', 'healthcare_admin']
            }
          ],
          isSystemPermission: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        this.addPermission({
          id: 'healthcare_hipaa_compliance',
          name: 'healthcare_hipaa_compliance',
          displayName: 'HIPAA Compliance Access',
          description: 'Access to HIPAA-compliant features and data',
          category: 'compliance',
          industry,
          resource: 'hipaa_data',
          action: 'read',
          isSystemPermission: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        break;

      case 'legal':
        this.addPermission({
          id: 'legal_case_access',
          name: 'legal_case_access',
          displayName: 'Case Data Access',
          description: 'Access to legal case information',
          category: 'case_management',
          industry,
          resource: 'case_data',
          action: 'read',
          isSystemPermission: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        this.addPermission({
          id: 'legal_attorney_privilege',
          name: 'legal_attorney_privilege',
          displayName: 'Attorney-Client Privilege',
          description: 'Access to privileged attorney-client communications',
          category: 'privilege',
          industry,
          resource: 'privileged_data',
          action: 'read',
          isSystemPermission: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        break;

      case 'real_estate':
        this.addPermission({
          id: 'real_estate_mls_access',
          name: 'real_estate_mls_access',
          displayName: 'MLS Data Access',
          description: 'Access to Multiple Listing Service data',
          category: 'mls_access',
          industry,
          resource: 'mls_data',
          action: 'read',
          isSystemPermission: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        this.addPermission({
          id: 'real_estate_property_management',
          name: 'real_estate_property_management',
          displayName: 'Property Management',
          description: 'Manage property listings and transactions',
          category: 'property_management',
          industry,
          resource: 'property_data',
          action: 'write',
          isSystemPermission: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        break;

      case 'ecommerce':
        this.addPermission({
          id: 'ecommerce_product_management',
          name: 'ecommerce_product_management',
          displayName: 'Product Management',
          description: 'Manage e-commerce products and inventory',
          category: 'product_management',
          industry,
          resource: 'product_data',
          action: 'write',
          isSystemPermission: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        this.addPermission({
          id: 'ecommerce_order_processing',
          name: 'ecommerce_order_processing',
          displayName: 'Order Processing',
          description: 'Process and manage customer orders',
          category: 'order_management',
          industry,
          resource: 'order_data',
          action: 'write',
          isSystemPermission: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        break;

      // Add more industry-specific permissions as needed
      default:
        break;
    }
  }

  /**
   * Initialize default access policies
   */
  private initializeDefaultPolicies(): void {
    const industries = [
      'healthcare', 'legal', 'real_estate', 'ecommerce', 'construction',
      'logistics', 'government', 'education', 'retail', 'hospitality',
      'wellness', 'beauty', 'banking', 'insurance', 'manufacturing'
    ];

    industries.forEach(industry => {
      this.policies.set(`${industry}_default_policy`, {
        id: `${industry}_default_policy`,
        name: `${this.capitalize(industry)} Default Policy`,
        description: `Default access policy for ${industry} industry`,
        industry,
        rules: this.getDefaultPolicyRules(industry),
        isActive: true,
        priority: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  }

  /**
   * Initialize compliance frameworks
   */
  private initializeComplianceFrameworks(): void {
    // HIPAA for Healthcare
    this.compliance.set('hipaa', {
      id: 'hipaa',
      name: 'HIPAA Compliance',
      industry: 'healthcare',
      requirements: [
        {
          id: 'hipaa_privacy_rule',
          name: 'Privacy Rule',
          description: 'Protect the privacy of individually identifiable health information',
          category: 'privacy',
          severity: 'critical',
          controls: ['access_controls', 'audit_logging', 'data_encryption'],
          isRequired: true
        },
        {
          id: 'hipaa_security_rule',
          name: 'Security Rule',
          description: 'Ensure the confidentiality, integrity, and availability of electronic protected health information',
          category: 'security',
          severity: 'critical',
          controls: ['technical_safeguards', 'administrative_safeguards', 'physical_safeguards'],
          isRequired: true
        }
      ],
      controls: [
        {
          id: 'hipaa_access_controls',
          name: 'Access Controls',
          description: 'Implement user authentication and authorization controls',
          type: 'technical',
          implementation: 'Multi-factor authentication and role-based access control',
          testing: 'Regular access reviews and penetration testing',
          isImplemented: false
        }
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // FERPA for Education
    this.compliance.set('ferpa', {
      id: 'ferpa',
      name: 'FERPA Compliance',
      industry: 'education',
      requirements: [
        {
          id: 'ferpa_privacy_protection',
          name: 'Privacy Protection',
          description: 'Protect the privacy of student education records',
          category: 'privacy',
          severity: 'high',
          controls: ['access_controls', 'audit_logging', 'data_encryption'],
          isRequired: true
        }
      ],
      controls: [
        {
          id: 'ferpa_access_controls',
          name: 'Access Controls',
          description: 'Implement user authentication and authorization controls for student data',
          type: 'technical',
          implementation: 'Role-based access control and data encryption',
          testing: 'Regular access reviews and compliance audits',
          isImplemented: false
        }
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Get admin permissions for an industry
   */
  private getAdminPermissions(industry: string): string[] {
    return [
      `${industry}_read`,
      `${industry}_write`,
      `${industry}_delete`,
      `${industry}_admin`,
      `${industry}_manage_users`,
      `${industry}_manage_roles`,
      `${industry}_manage_permissions`,
      `${industry}_view_analytics`,
      `${industry}_export_data`,
      `${industry}_import_data`,
      `${industry}_system_config`
    ];
  }

  /**
   * Get manager permissions for an industry
   */
  private getManagerPermissions(industry: string): string[] {
    return [
      `${industry}_read`,
      `${industry}_write`,
      `${industry}_manage_users`,
      `${industry}_view_analytics`,
      `${industry}_export_data`
    ];
  }

  /**
   * Get user permissions for an industry
   */
  private getUserPermissions(industry: string): string[] {
    return [
      `${industry}_read`,
      `${industry}_write`
    ];
  }

  /**
   * Get viewer permissions for an industry
   */
  private getViewerPermissions(industry: string): string[] {
    return [
      `${industry}_read`
    ];
  }

  /**
   * Get manager restrictions for an industry
   */
  private getManagerRestrictions(industry: string): string[] {
    return [
      `${industry}_delete`,
      `${industry}_system_config`
    ];
  }

  /**
   * Get user restrictions for an industry
   */
  private getUserRestrictions(industry: string): string[] {
    return [
      `${industry}_delete`,
      `${industry}_manage_users`,
      `${industry}_manage_roles`,
      `${industry}_manage_permissions`,
      `${industry}_system_config`
    ];
  }

  /**
   * Get viewer restrictions for an industry
   */
  private getViewerRestrictions(industry: string): string[] {
    return [
      `${industry}_write`,
      `${industry}_delete`,
      `${industry}_manage_users`,
      `${industry}_manage_roles`,
      `${industry}_manage_permissions`,
      `${industry}_system_config`
    ];
  }

  /**
   * Get default policy rules for an industry
   */
  private getDefaultPolicyRules(industry: string): AccessRule[] {
    return [
      {
        id: `${industry}_admin_rule`,
        name: `${this.capitalize(industry)} Admin Rule`,
        description: `Allow admin access for ${industry} industry`,
        effect: 'allow',
        subjects: [`${industry}_admin`],
        resources: [`${industry}_data`],
        actions: ['read', 'write', 'delete', 'admin'],
        conditions: [],
        priority: 1,
        isActive: true
      },
      {
        id: `${industry}_manager_rule`,
        name: `${this.capitalize(industry)} Manager Rule`,
        description: `Allow manager access for ${industry} industry`,
        effect: 'allow',
        subjects: [`${industry}_manager`],
        resources: [`${industry}_data`],
        actions: ['read', 'write'],
        conditions: [],
        priority: 2,
        isActive: true
      },
      {
        id: `${industry}_user_rule`,
        name: `${this.capitalize(industry)} User Rule`,
        description: `Allow user access for ${industry} industry`,
        effect: 'allow',
        subjects: [`${industry}_user`],
        resources: [`${industry}_data`],
        actions: ['read', 'write'],
        conditions: [],
        priority: 3,
        isActive: true
      },
      {
        id: `${industry}_viewer_rule`,
        name: `${this.capitalize(industry)} Viewer Rule`,
        description: `Allow viewer access for ${industry} industry`,
        effect: 'allow',
        subjects: [`${industry}_viewer`],
        resources: [`${industry}_data`],
        actions: ['read'],
        conditions: [],
        priority: 4,
        isActive: true
      }
    ];
  }

  /**
   * Add a permission
   */
  private addPermission(permission: IndustryPermission): void {
    this.permissions.set(permission.id, permission);
  }

  /**
   * Create a new role
   */
  async createRole(role: Omit<IndustryRole, 'id' | 'createdAt' | 'updatedAt'>): Promise<IndustryRole> {
    const newRole: IndustryRole = {
      ...role,
      id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.roles.set(newRole.id, newRole);
    console.log(`✅ Created role: ${newRole.name} for industry: ${newRole.industry}`);
    return newRole;
  }

  /**
   * Update an existing role
   */
  async updateRole(roleId: string, updates: Partial<IndustryRole>): Promise<IndustryRole | null> {
    const role = this.roles.get(roleId);
    if (!role) {
      console.warn(`Role with ID ${roleId} not found.`);
      return null;
    }

    const updatedRole = {
      ...role,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.roles.set(roleId, updatedRole);
    console.log(`✅ Updated role: ${updatedRole.name} for industry: ${updatedRole.industry}`);
    return updatedRole;
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: string): Promise<boolean> {
    const role = this.roles.get(roleId);
    if (!role) {
      console.warn(`Role with ID ${roleId} not found.`);
      return false;
    }

    if (role.isSystemRole) {
      console.warn(`Cannot delete system role: ${role.name}`);
      return false;
    }

    this.roles.delete(roleId);
    console.log(`✅ Deleted role: ${role.name}`);
    return true;
  }

  /**
   * Get role by ID
   */
  getRole(roleId: string): IndustryRole | null {
    return this.roles.get(roleId) || null;
  }

  /**
   * Get roles by industry
   */
  getRolesByIndustry(industry: string): IndustryRole[] {
    return Array.from(this.roles.values()).filter(role => role.industry === industry);
  }

  /**
   * Get all roles
   */
  getAllRoles(): IndustryRole[] {
    return Array.from(this.roles.values());
  }

  /**
   * Create a new permission
   */
  async createPermission(permission: Omit<IndustryPermission, 'id' | 'createdAt' | 'updatedAt'>): Promise<IndustryPermission> {
    const newPermission: IndustryPermission = {
      ...permission,
      id: `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.permissions.set(newPermission.id, newPermission);
    console.log(`✅ Created permission: ${newPermission.name} for industry: ${newPermission.industry}`);
    return newPermission;
  }

  /**
   * Update an existing permission
   */
  async updatePermission(permissionId: string, updates: Partial<IndustryPermission>): Promise<IndustryPermission | null> {
    const permission = this.permissions.get(permissionId);
    if (!permission) {
      console.warn(`Permission with ID ${permissionId} not found.`);
      return null;
    }

    const updatedPermission = {
      ...permission,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.permissions.set(permissionId, updatedPermission);
    console.log(`✅ Updated permission: ${updatedPermission.name} for industry: ${updatedPermission.industry}`);
    return updatedPermission;
  }

  /**
   * Delete a permission
   */
  async deletePermission(permissionId: string): Promise<boolean> {
    const permission = this.permissions.get(permissionId);
    if (!permission) {
      console.warn(`Permission with ID ${permissionId} not found.`);
      return false;
    }

    if (permission.isSystemPermission) {
      console.warn(`Cannot delete system permission: ${permission.name}`);
      return false;
    }

    this.permissions.delete(permissionId);
    console.log(`✅ Deleted permission: ${permission.name}`);
    return true;
  }

  /**
   * Get permission by ID
   */
  getPermission(permissionId: string): IndustryPermission | null {
    return this.permissions.get(permissionId) || null;
  }

  /**
   * Get permissions by industry
   */
  getPermissionsByIndustry(industry: string): IndustryPermission[] {
    return Array.from(this.permissions.values()).filter(permission => permission.industry === industry);
  }

  /**
   * Get all permissions
   */
  getAllPermissions(): IndustryPermission[] {
    return Array.from(this.permissions.values());
  }

  /**
   * Create a new user
   */
  async createUser(user: Omit<IndustryUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IndustryUser> {
    const newUser: IndustryUser = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.set(newUser.id, newUser);
    console.log(`✅ Created user: ${newUser.email} for industry: ${newUser.industry}`);
    return newUser;
  }

  /**
   * Update an existing user
   */
  async updateUser(userId: string, updates: Partial<IndustryUser>): Promise<IndustryUser | null> {
    const user = this.users.get(userId);
    if (!user) {
      console.warn(`User with ID ${userId} not found.`);
      return null;
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.users.set(userId, updatedUser);
    console.log(`✅ Updated user: ${updatedUser.email} for industry: ${updatedUser.industry}`);
    return updatedUser;
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      console.warn(`User with ID ${userId} not found.`);
      return false;
    }

    this.users.delete(userId);
    console.log(`✅ Deleted user: ${user.email}`);
    return true;
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): IndustryUser | null {
    return this.users.get(userId) || null;
  }

  /**
   * Get users by industry
   */
  getUsersByIndustry(industry: string): IndustryUser[] {
    return Array.from(this.users.values()).filter(user => user.industry === industry);
  }

  /**
   * Get all users
   */
  getAllUsers(): IndustryUser[] {
    return Array.from(this.users.values());
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<boolean> {
    const user = this.users.get(userId);
    const role = this.roles.get(roleId);

    if (!user || !role) {
      console.warn(`User ${userId} or role ${roleId} not found.`);
      return false;
    }

    if (user.industry !== role.industry) {
      console.warn(`User industry ${user.industry} does not match role industry ${role.industry}.`);
      return false;
    }

    if (!user.roles.includes(roleId)) {
      user.roles.push(roleId);
      user.permissions.push(...role.permissions);
      this.users.set(userId, user);
      console.log(`✅ Assigned role ${role.name} to user ${user.email}`);
      return true;
    }

    return false;
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    const user = this.users.get(userId);
    const role = this.roles.get(roleId);

    if (!user || !role) {
      console.warn(`User ${userId} or role ${roleId} not found.`);
      return false;
    }

    const roleIndex = user.roles.indexOf(roleId);
    if (roleIndex > -1) {
      user.roles.splice(roleIndex, 1);
      // Remove role permissions from user
      role.permissions.forEach(permissionId => {
        const permissionIndex = user.permissions.indexOf(permissionId);
        if (permissionIndex > -1) {
          user.permissions.splice(permissionIndex, 1);
        }
      });
      this.users.set(userId, user);
      console.log(`✅ Removed role ${role.name} from user ${user.email}`);
      return true;
    }

    return false;
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      console.warn(`User ${userId} not found.`);
      return false;
    }

    return user.permissions.includes(permission);
  }

  /**
   * Check if user has role
   */
  async hasRole(userId: string, role: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      console.warn(`User ${userId} not found.`);
      return false;
    }

    return user.roles.includes(role);
  }

  /**
   * Evaluate access decision
   */
  async evaluateAccess(userId: string, resource: string, action: string): Promise<AccessDecision> {
    const user = this.users.get(userId);
    if (!user) {
      return {
        allowed: false,
        reason: 'User not found',
        timestamp: new Date().toISOString()
      };
    }

    // Check user permissions
    const hasPermission = user.permissions.some(permission => {
      const perm = this.permissions.get(permission);
      return perm && perm.resource === resource && perm.action === action;
    });

    if (hasPermission) {
      return {
        allowed: true,
        reason: 'User has required permission',
        timestamp: new Date().toISOString()
      };
    }

    // Check role-based access
    const hasRoleAccess = user.roles.some(roleId => {
      const role = this.roles.get(roleId);
      return role && role.permissions.some(permission => {
        const perm = this.permissions.get(permission);
        return perm && perm.resource === resource && perm.action === action;
      });
    });

    if (hasRoleAccess) {
      return {
        allowed: true,
        reason: 'User has required role',
        timestamp: new Date().toISOString()
      };
    }

    // Check policy-based access
    const policy = this.policies.get(`${user.industry}_default_policy`);
    if (policy) {
      const policyDecision = this.evaluatePolicy(policy, user, resource, action);
      if (policyDecision.allowed) {
        return policyDecision;
      }
    }

    return {
      allowed: false,
      reason: 'Access denied by policy',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Evaluate policy rules
   */
  private evaluatePolicy(policy: AccessPolicy, user: IndustryUser, resource: string, action: string): AccessDecision {
    for (const rule of policy.rules) {
      if (!rule.isActive) continue;

      const matchesSubject = rule.subjects.some(subject => user.roles.includes(subject));
      const matchesResource = rule.resources.includes(resource);
      const matchesAction = rule.actions.includes(action);

      if (matchesSubject && matchesResource && matchesAction) {
        // Check conditions
        const conditionsMet = this.evaluateConditions(rule.conditions, user);
        if (conditionsMet) {
          return {
            allowed: rule.effect === 'allow',
            reason: `Policy rule: ${rule.name}`,
            policyId: policy.id,
            ruleId: rule.id,
            conditions: rule.conditions,
            timestamp: new Date().toISOString()
          };
        }
      }
    }

    return {
      allowed: false,
      reason: 'No matching policy rule',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Evaluate conditions
   */
  private evaluateConditions(conditions: PermissionCondition[], user: IndustryUser): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let logicalOperator = 'AND';

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, user);
      
      if (logicalOperator === 'AND') {
        result = result && conditionResult;
      } else if (logicalOperator === 'OR') {
        result = result || conditionResult;
      }

      logicalOperator = condition.logicalOperator || 'AND';
    }

    return result;
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(condition: PermissionCondition, user: IndustryUser): boolean {
    const attributeValue = this.getAttributeValue(condition.attribute, user);

    switch (condition.operator) {
      case 'equals':
        return attributeValue === condition.value;
      case 'not_equals':
        return attributeValue !== condition.value;
      case 'contains':
        return String(attributeValue).includes(String(condition.value));
      case 'not_contains':
        return !String(attributeValue).includes(String(condition.value));
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(attributeValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(attributeValue);
      case 'greater_than':
        return Number(attributeValue) > Number(condition.value);
      case 'less_than':
        return Number(attributeValue) < Number(condition.value);
      case 'between':
        const [min, max] = Array.isArray(condition.value) ? condition.value : [0, 0];
        return Number(attributeValue) >= Number(min) && Number(attributeValue) <= Number(max);
      default:
        return false;
    }
  }

  /**
   * Get attribute value from user
   */
  private getAttributeValue(attribute: string, user: IndustryUser): any {
    const parts = attribute.split('.');
    let value = user;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as any)[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Get compliance requirements for industry
   */
  getComplianceRequirements(industry: string): IndustryCompliance | null {
    return this.compliance.get(industry) || null;
  }

  /**
   * Get all compliance frameworks
   */
  getAllComplianceFrameworks(): IndustryCompliance[] {
    return Array.from(this.compliance.values());
  }

  /**
   * Check compliance for user
   */
  async checkCompliance(userId: string): Promise<{ compliant: boolean; requirements: ComplianceRequirement[] }> {
    const user = this.users.get(userId);
    if (!user) {
      return { compliant: false, requirements: [] };
    }

    const compliance = this.compliance.get(user.industry);
    if (!compliance) {
      return { compliant: true, requirements: [] };
    }

    const requirements = compliance.requirements.filter(req => req.isRequired);
    const compliant = requirements.every(req => {
      // Check if user has required permissions
      return req.controls.every(control => {
        const permission = this.permissions.get(control);
        return permission && user.permissions.includes(permission.id);
      });
    });

    return { compliant, requirements };
  }

  /**
   * Utility method to capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
