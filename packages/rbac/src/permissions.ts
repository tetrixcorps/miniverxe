// Core permissions for all user groups
export const Permissions = {
  AssignTask: 'task.assign',
  ReviewTask: 'task.review',
  AdminContactRead: 'admin:contact:read',
  AdminContactUpdate: 'admin:contact:update',
  AdminLogout: 'admin:logout',
  UserList: 'user:list',
  UserRead: 'user:read',
  UserUpdate: 'user:update',
  UserRoleUpdate: 'user:role:update',
  ProjectRead: 'project:read',
} as const;

// Extended permissions for Data Annotators
export const DataAnnotatorPermissions = {
  // Project Management
  ProjectCreate: 'project:create',
  ProjectUpdate: 'project:update',
  ProjectDelete: 'project:delete',
  ProjectAssign: 'project:assign',
  
  // Task Management
  TaskCreate: 'task:create',
  TaskAssign: 'task:assign',
  TaskSubmit: 'task:submit',
  TaskReview: 'task:review',
  TaskApprove: 'task:approve',
  TaskReject: 'task:reject',
  
  // Data Management
  DatasetUpload: 'dataset:upload',
  DatasetDownload: 'dataset:download',
  DatasetAnnotate: 'dataset:annotate',
  
  // Quality Control
  QualityReview: 'quality:review',
  QualityApprove: 'quality:approve',
  QualityMetrics: 'quality:metrics',
  
  // Billing & Analytics
  BillingView: 'billing:view',
  BillingManage: 'billing:manage',
  AnalyticsView: 'analytics:view',
  AnalyticsExport: 'analytics:export',
} as const;

// Extended permissions for Academy
export const AcademyPermissions = {
  // Course Management
  CourseEnroll: 'course:enroll',
  CourseView: 'course:view',
  CourseSubmit: 'course:submit',
  CourseGrade: 'course:grade',
  
  // Assignment Management
  AssignmentSubmit: 'assignment:submit',
  AssignmentReview: 'assignment:review',
  AssignmentGrade: 'assignment:grade',
  
  // Learning Resources
  ResourceAccess: 'resource:access',
  ResourceCreate: 'resource:create',
  ResourceShare: 'resource:share',
  
  // Progress Tracking
  ProgressView: 'progress:view',
  ProgressUpdate: 'progress:update',
  CertificateGenerate: 'certificate:generate',
} as const;

// Extended permissions for Enterprise
export const EnterprisePermissions = {
  // Organization Management
  OrgCreate: 'org:create',
  OrgUpdate: 'org:update',
  OrgDelete: 'org:delete',
  OrgView: 'org:view',
  
  // User Management
  UserInvite: 'user:invite',
  UserRemove: 'user:remove',
  UserRoleAssign: 'user:role:assign',
  
  // API Access
  ApiAccess: 'api:access',
  ApiKeyManage: 'api:key:manage',
  ApiRateLimit: 'api:rate:limit',
  
  // Integration
  IntegrationCreate: 'integration:create',
  IntegrationUpdate: 'integration:update',
  IntegrationDelete: 'integration:delete',
  
  // Reporting
  ReportGenerate: 'report:generate',
  ReportSchedule: 'report:schedule',
  ReportExport: 'report:export',
} as const;

// Combined permissions type
export type Permission = typeof Permissions[keyof typeof Permissions] |
                        typeof DataAnnotatorPermissions[keyof typeof DataAnnotatorPermissions] |
                        typeof AcademyPermissions[keyof typeof AcademyPermissions] |
                        typeof EnterprisePermissions[keyof typeof EnterprisePermissions]; 