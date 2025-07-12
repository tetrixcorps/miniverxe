"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissionMap = void 0;
exports.getPermissionsForRole = getPermissionsForRole;
exports.roleHasPermission = roleHasPermission;
exports.getRolesForUserGroup = getRolesForUserGroup;
const roles_js_1 = require("./roles.js");
const permissions_js_1 = require("./permissions.js");
// Role-Permission mapping for all user groups
exports.RolePermissionMap = {
    // Data Annotators
    [roles_js_1.Roles.TaskAdmin]: [
        permissions_js_1.Permissions.AssignTask,
        permissions_js_1.Permissions.ReviewTask,
        permissions_js_1.DataAnnotatorPermissions.ProjectCreate,
        permissions_js_1.DataAnnotatorPermissions.ProjectUpdate,
        permissions_js_1.DataAnnotatorPermissions.ProjectDelete,
        permissions_js_1.DataAnnotatorPermissions.TaskAssign,
        permissions_js_1.DataAnnotatorPermissions.TaskReview,
        permissions_js_1.DataAnnotatorPermissions.QualityReview,
        permissions_js_1.DataAnnotatorPermissions.BillingView,
        permissions_js_1.DataAnnotatorPermissions.AnalyticsView,
    ],
    [roles_js_1.Roles.Reviewer]: [
        permissions_js_1.Permissions.ReviewTask,
        permissions_js_1.DataAnnotatorPermissions.TaskReview,
        permissions_js_1.DataAnnotatorPermissions.TaskApprove,
        permissions_js_1.DataAnnotatorPermissions.TaskReject,
        permissions_js_1.DataAnnotatorPermissions.QualityReview,
        permissions_js_1.DataAnnotatorPermissions.QualityMetrics,
    ],
    [roles_js_1.Roles.Labeler]: [
        permissions_js_1.DataAnnotatorPermissions.TaskSubmit,
        permissions_js_1.DataAnnotatorPermissions.DatasetAnnotate,
        permissions_js_1.AcademyPermissions.ProgressView,
    ],
    [roles_js_1.Roles.BillingAdmin]: [
        permissions_js_1.DataAnnotatorPermissions.BillingView,
        permissions_js_1.DataAnnotatorPermissions.BillingManage,
        permissions_js_1.DataAnnotatorPermissions.AnalyticsView,
        permissions_js_1.DataAnnotatorPermissions.AnalyticsExport,
    ],
    [roles_js_1.DataAnnotatorRoles.ProjectManager]: [
        permissions_js_1.DataAnnotatorPermissions.ProjectCreate,
        permissions_js_1.DataAnnotatorPermissions.ProjectUpdate,
        permissions_js_1.DataAnnotatorPermissions.ProjectAssign,
        permissions_js_1.DataAnnotatorPermissions.TaskCreate,
        permissions_js_1.DataAnnotatorPermissions.TaskAssign,
        permissions_js_1.DataAnnotatorPermissions.DatasetUpload,
        permissions_js_1.DataAnnotatorPermissions.DatasetDownload,
        permissions_js_1.DataAnnotatorPermissions.AnalyticsView,
    ],
    [roles_js_1.DataAnnotatorRoles.SeniorLabeler]: [
        permissions_js_1.DataAnnotatorPermissions.TaskSubmit,
        permissions_js_1.DataAnnotatorPermissions.DatasetAnnotate,
        permissions_js_1.DataAnnotatorPermissions.QualityReview,
        permissions_js_1.DataAnnotatorPermissions.QualityApprove,
    ],
    [roles_js_1.DataAnnotatorRoles.JuniorLabeler]: [
        permissions_js_1.DataAnnotatorPermissions.TaskSubmit,
        permissions_js_1.DataAnnotatorPermissions.DatasetAnnotate,
    ],
    [roles_js_1.DataAnnotatorRoles.QualityAssurance]: [
        permissions_js_1.DataAnnotatorPermissions.QualityReview,
        permissions_js_1.DataAnnotatorPermissions.QualityApprove,
        permissions_js_1.DataAnnotatorPermissions.QualityMetrics,
        permissions_js_1.DataAnnotatorPermissions.TaskApprove,
        permissions_js_1.DataAnnotatorPermissions.TaskReject,
    ],
    [roles_js_1.DataAnnotatorRoles.DataScientist]: [
        permissions_js_1.DataAnnotatorPermissions.DatasetDownload,
        permissions_js_1.DataAnnotatorPermissions.AnalyticsView,
        permissions_js_1.DataAnnotatorPermissions.AnalyticsExport,
        permissions_js_1.DataAnnotatorPermissions.QualityMetrics,
    ],
    // Academy
    [roles_js_1.Roles.CodingStudent]: [
        permissions_js_1.AcademyPermissions.CourseEnroll,
        permissions_js_1.AcademyPermissions.CourseView,
        permissions_js_1.AcademyPermissions.AssignmentSubmit,
        permissions_js_1.AcademyPermissions.ResourceAccess,
        permissions_js_1.AcademyPermissions.ProgressView,
    ],
    [roles_js_1.Roles.AcademyReviewer]: [
        permissions_js_1.AcademyPermissions.AssignmentReview,
        permissions_js_1.AcademyPermissions.AssignmentGrade,
        permissions_js_1.AcademyPermissions.CourseGrade,
        permissions_js_1.AcademyPermissions.CertificateGenerate,
    ],
    [roles_js_1.AcademyRoles.Student]: [
        permissions_js_1.AcademyPermissions.CourseEnroll,
        permissions_js_1.AcademyPermissions.CourseView,
        permissions_js_1.AcademyPermissions.AssignmentSubmit,
        permissions_js_1.AcademyPermissions.ResourceAccess,
        permissions_js_1.AcademyPermissions.ProgressView,
    ],
    [roles_js_1.AcademyRoles.AdvancedStudent]: [
        permissions_js_1.AcademyPermissions.CourseEnroll,
        permissions_js_1.AcademyPermissions.CourseView,
        permissions_js_1.AcademyPermissions.AssignmentSubmit,
        permissions_js_1.AcademyPermissions.ResourceAccess,
        permissions_js_1.AcademyPermissions.ProgressView,
        permissions_js_1.AcademyPermissions.ResourceShare,
    ],
    [roles_js_1.AcademyRoles.TeachingAssistant]: [
        permissions_js_1.AcademyPermissions.AssignmentReview,
        permissions_js_1.AcademyPermissions.AssignmentGrade,
        permissions_js_1.AcademyPermissions.ResourceCreate,
        permissions_js_1.AcademyPermissions.ResourceShare,
        permissions_js_1.AcademyPermissions.ProgressView,
    ],
    [roles_js_1.AcademyRoles.Instructor]: [
        permissions_js_1.AcademyPermissions.CourseSubmit,
        permissions_js_1.AcademyPermissions.CourseGrade,
        permissions_js_1.AcademyPermissions.AssignmentReview,
        permissions_js_1.AcademyPermissions.AssignmentGrade,
        permissions_js_1.AcademyPermissions.ResourceCreate,
        permissions_js_1.AcademyPermissions.ResourceShare,
        permissions_js_1.AcademyPermissions.CertificateGenerate,
    ],
    [roles_js_1.AcademyRoles.CurriculumManager]: [
        permissions_js_1.AcademyPermissions.CourseSubmit,
        permissions_js_1.AcademyPermissions.CourseGrade,
        permissions_js_1.AcademyPermissions.ResourceCreate,
        permissions_js_1.AcademyPermissions.ResourceShare,
        permissions_js_1.AcademyPermissions.CertificateGenerate,
    ],
    // Enterprise
    [roles_js_1.EnterpriseRoles.ClientAdmin]: [
        permissions_js_1.EnterprisePermissions.OrgView,
        permissions_js_1.EnterprisePermissions.OrgUpdate,
        permissions_js_1.EnterprisePermissions.UserInvite,
        permissions_js_1.EnterprisePermissions.UserRemove,
        permissions_js_1.EnterprisePermissions.UserRoleAssign,
        permissions_js_1.EnterprisePermissions.ApiAccess,
        permissions_js_1.EnterprisePermissions.ApiKeyManage,
        permissions_js_1.EnterprisePermissions.ReportGenerate,
        permissions_js_1.EnterprisePermissions.ReportExport,
    ],
    [roles_js_1.EnterpriseRoles.ClientUser]: [
        permissions_js_1.EnterprisePermissions.OrgView,
        permissions_js_1.EnterprisePermissions.ApiAccess,
        permissions_js_1.EnterprisePermissions.ReportGenerate,
    ],
    [roles_js_1.EnterpriseRoles.ClientViewer]: [
        permissions_js_1.EnterprisePermissions.OrgView,
        permissions_js_1.EnterprisePermissions.ReportGenerate,
    ],
    [roles_js_1.EnterpriseRoles.IntegrationManager]: [
        permissions_js_1.EnterprisePermissions.ApiAccess,
        permissions_js_1.EnterprisePermissions.ApiKeyManage,
        permissions_js_1.EnterprisePermissions.ApiRateLimit,
        permissions_js_1.EnterprisePermissions.IntegrationCreate,
        permissions_js_1.EnterprisePermissions.IntegrationUpdate,
        permissions_js_1.EnterprisePermissions.IntegrationDelete,
    ],
    // Super Admin has all permissions
    [roles_js_1.Roles.SuperAdmin]: [
        // Core permissions
        ...Object.values(permissions_js_1.Permissions),
        // Data Annotator permissions
        ...Object.values(permissions_js_1.DataAnnotatorPermissions),
        // Academy permissions
        ...Object.values(permissions_js_1.AcademyPermissions),
        // Enterprise permissions
        ...Object.values(permissions_js_1.EnterprisePermissions),
    ],
};
// Helper function to get permissions for a role
function getPermissionsForRole(role) {
    return exports.RolePermissionMap[role] || [];
}
// Helper function to check if a role has a specific permission
function roleHasPermission(role, permission) {
    const rolePermissions = getPermissionsForRole(role);
    return rolePermissions.includes(permission);
}
// Helper function to get all roles for a user group
function getRolesForUserGroup(userGroup) {
    switch (userGroup) {
        case 'data-annotator':
            return [
                ...Object.values(roles_js_1.Roles).filter(role => ['TaskAdmin', 'Reviewer', 'Labeler', 'BillingAdmin', 'Owner'].includes(role)),
                ...Object.values(roles_js_1.DataAnnotatorRoles)
            ];
        case 'academy':
            return [
                ...Object.values(roles_js_1.Roles).filter(role => ['CodingStudent', 'AcademyReviewer'].includes(role)),
                ...Object.values(roles_js_1.AcademyRoles)
            ];
        case 'enterprise':
            return [
                ...Object.values(roles_js_1.Roles).filter(role => ['SuperAdmin'].includes(role)),
                ...Object.values(roles_js_1.EnterpriseRoles)
            ];
        default:
            return [];
    }
}
