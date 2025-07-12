import { Roles, DataAnnotatorRoles, AcademyRoles, EnterpriseRoles } from './roles.js';
import { Permissions, DataAnnotatorPermissions, AcademyPermissions, EnterprisePermissions } from './permissions.js';

// Role-Permission mapping for all user groups
export const RolePermissionMap = {
  // Data Annotators
  [Roles.TaskAdmin]: [
    Permissions.AssignTask,
    Permissions.ReviewTask,
    DataAnnotatorPermissions.ProjectCreate,
    DataAnnotatorPermissions.ProjectUpdate,
    DataAnnotatorPermissions.ProjectDelete,
    DataAnnotatorPermissions.TaskAssign,
    DataAnnotatorPermissions.TaskReview,
    DataAnnotatorPermissions.QualityReview,
    DataAnnotatorPermissions.BillingView,
    DataAnnotatorPermissions.AnalyticsView,
  ],
  
  [Roles.Reviewer]: [
    Permissions.ReviewTask,
    DataAnnotatorPermissions.TaskReview,
    DataAnnotatorPermissions.TaskApprove,
    DataAnnotatorPermissions.TaskReject,
    DataAnnotatorPermissions.QualityReview,
    DataAnnotatorPermissions.QualityMetrics,
  ],
  
  [Roles.Labeler]: [
    DataAnnotatorPermissions.TaskSubmit,
    DataAnnotatorPermissions.DatasetAnnotate,
    AcademyPermissions.ProgressView,
  ],
  
  [Roles.BillingAdmin]: [
    DataAnnotatorPermissions.BillingView,
    DataAnnotatorPermissions.BillingManage,
    DataAnnotatorPermissions.AnalyticsView,
    DataAnnotatorPermissions.AnalyticsExport,
  ],
  
  [DataAnnotatorRoles.ProjectManager]: [
    DataAnnotatorPermissions.ProjectCreate,
    DataAnnotatorPermissions.ProjectUpdate,
    DataAnnotatorPermissions.ProjectAssign,
    DataAnnotatorPermissions.TaskCreate,
    DataAnnotatorPermissions.TaskAssign,
    DataAnnotatorPermissions.DatasetUpload,
    DataAnnotatorPermissions.DatasetDownload,
    DataAnnotatorPermissions.AnalyticsView,
  ],
  
  [DataAnnotatorRoles.SeniorLabeler]: [
    DataAnnotatorPermissions.TaskSubmit,
    DataAnnotatorPermissions.DatasetAnnotate,
    DataAnnotatorPermissions.QualityReview,
    DataAnnotatorPermissions.QualityApprove,
  ],
  
  [DataAnnotatorRoles.JuniorLabeler]: [
    DataAnnotatorPermissions.TaskSubmit,
    DataAnnotatorPermissions.DatasetAnnotate,
  ],
  
  [DataAnnotatorRoles.QualityAssurance]: [
    DataAnnotatorPermissions.QualityReview,
    DataAnnotatorPermissions.QualityApprove,
    DataAnnotatorPermissions.QualityMetrics,
    DataAnnotatorPermissions.TaskApprove,
    DataAnnotatorPermissions.TaskReject,
  ],
  
  [DataAnnotatorRoles.DataScientist]: [
    DataAnnotatorPermissions.DatasetDownload,
    DataAnnotatorPermissions.AnalyticsView,
    DataAnnotatorPermissions.AnalyticsExport,
    DataAnnotatorPermissions.QualityMetrics,
  ],
  
  // Academy
  [Roles.CodingStudent]: [
    AcademyPermissions.CourseEnroll,
    AcademyPermissions.CourseView,
    AcademyPermissions.AssignmentSubmit,
    AcademyPermissions.ResourceAccess,
    AcademyPermissions.ProgressView,
  ],
  
  [Roles.AcademyReviewer]: [
    AcademyPermissions.AssignmentReview,
    AcademyPermissions.AssignmentGrade,
    AcademyPermissions.CourseGrade,
    AcademyPermissions.CertificateGenerate,
  ],
  
  [AcademyRoles.Student]: [
    AcademyPermissions.CourseEnroll,
    AcademyPermissions.CourseView,
    AcademyPermissions.AssignmentSubmit,
    AcademyPermissions.ResourceAccess,
    AcademyPermissions.ProgressView,
  ],
  
  [AcademyRoles.AdvancedStudent]: [
    AcademyPermissions.CourseEnroll,
    AcademyPermissions.CourseView,
    AcademyPermissions.AssignmentSubmit,
    AcademyPermissions.ResourceAccess,
    AcademyPermissions.ProgressView,
    AcademyPermissions.ResourceShare,
  ],
  
  [AcademyRoles.TeachingAssistant]: [
    AcademyPermissions.AssignmentReview,
    AcademyPermissions.AssignmentGrade,
    AcademyPermissions.ResourceCreate,
    AcademyPermissions.ResourceShare,
    AcademyPermissions.ProgressView,
  ],
  
  [AcademyRoles.Instructor]: [
    AcademyPermissions.CourseSubmit,
    AcademyPermissions.CourseGrade,
    AcademyPermissions.AssignmentReview,
    AcademyPermissions.AssignmentGrade,
    AcademyPermissions.ResourceCreate,
    AcademyPermissions.ResourceShare,
    AcademyPermissions.CertificateGenerate,
  ],
  
  [AcademyRoles.CurriculumManager]: [
    AcademyPermissions.CourseSubmit,
    AcademyPermissions.CourseGrade,
    AcademyPermissions.ResourceCreate,
    AcademyPermissions.ResourceShare,
    AcademyPermissions.CertificateGenerate,
  ],
  
  // Enterprise
  [EnterpriseRoles.ClientAdmin]: [
    EnterprisePermissions.OrgView,
    EnterprisePermissions.OrgUpdate,
    EnterprisePermissions.UserInvite,
    EnterprisePermissions.UserRemove,
    EnterprisePermissions.UserRoleAssign,
    EnterprisePermissions.ApiAccess,
    EnterprisePermissions.ApiKeyManage,
    EnterprisePermissions.ReportGenerate,
    EnterprisePermissions.ReportExport,
  ],
  
  [EnterpriseRoles.ClientUser]: [
    EnterprisePermissions.OrgView,
    EnterprisePermissions.ApiAccess,
    EnterprisePermissions.ReportGenerate,
  ],
  
  [EnterpriseRoles.ClientViewer]: [
    EnterprisePermissions.OrgView,
    EnterprisePermissions.ReportGenerate,
  ],
  
  [EnterpriseRoles.IntegrationManager]: [
    EnterprisePermissions.ApiAccess,
    EnterprisePermissions.ApiKeyManage,
    EnterprisePermissions.ApiRateLimit,
    EnterprisePermissions.IntegrationCreate,
    EnterprisePermissions.IntegrationUpdate,
    EnterprisePermissions.IntegrationDelete,
  ],
  
  // Super Admin has all permissions
  [Roles.SuperAdmin]: [
    // Core permissions
    ...Object.values(Permissions),
    // Data Annotator permissions
    ...Object.values(DataAnnotatorPermissions),
    // Academy permissions
    ...Object.values(AcademyPermissions),
    // Enterprise permissions
    ...Object.values(EnterprisePermissions),
  ],
} as const;

// Helper function to get permissions for a role
export function getPermissionsForRole(role: string): readonly string[] {
  return RolePermissionMap[role as keyof typeof RolePermissionMap] || [];
}

// Helper function to check if a role has a specific permission
export function roleHasPermission(role: string, permission: string): boolean {
  const rolePermissions = getPermissionsForRole(role);
  return rolePermissions.includes(permission);
}

// Helper function to get all roles for a user group
export function getRolesForUserGroup(userGroup: 'data-annotator' | 'academy' | 'enterprise'): readonly string[] {
  switch (userGroup) {
    case 'data-annotator':
      return [
        ...Object.values(Roles).filter(role => 
          ['TaskAdmin', 'Reviewer', 'Labeler', 'BillingAdmin', 'Owner'].includes(role)
        ),
        ...Object.values(DataAnnotatorRoles)
      ] as const;
    case 'academy':
      return [
        ...Object.values(Roles).filter(role => 
          ['CodingStudent', 'AcademyReviewer'].includes(role)
        ),
        ...Object.values(AcademyRoles)
      ] as const;
    case 'enterprise':
      return [
        ...Object.values(Roles).filter(role => 
          ['SuperAdmin'].includes(role)
        ),
        ...Object.values(EnterpriseRoles)
      ] as const;
    default:
      return [] as const;
  }
} 