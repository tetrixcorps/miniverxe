export declare const Roles: {
    readonly TaskAdmin: "TaskAdmin";
    readonly Reviewer: "Reviewer";
    readonly Labeler: "Labeler";
    readonly BillingAdmin: "BillingAdmin";
    readonly Owner: "Owner";
    readonly CodingStudent: "CodingStudent";
    readonly AcademyReviewer: "AcademyReviewer";
    readonly SuperAdmin: "SuperAdmin";
};
export declare const DataAnnotatorRoles: {
    readonly ProjectManager: "ProjectManager";
    readonly SeniorLabeler: "SeniorLabeler";
    readonly JuniorLabeler: "JuniorLabeler";
    readonly QualityAssurance: "QualityAssurance";
    readonly DataScientist: "DataScientist";
};
export declare const AcademyRoles: {
    readonly Student: "Student";
    readonly AdvancedStudent: "AdvancedStudent";
    readonly TeachingAssistant: "TeachingAssistant";
    readonly Instructor: "Instructor";
    readonly CurriculumManager: "CurriculumManager";
};
export declare const EnterpriseRoles: {
    readonly ClientAdmin: "ClientAdmin";
    readonly ClientUser: "ClientUser";
    readonly ClientViewer: "ClientViewer";
    readonly IntegrationManager: "IntegrationManager";
};
export type Role = typeof Roles[keyof typeof Roles] | typeof DataAnnotatorRoles[keyof typeof DataAnnotatorRoles] | typeof AcademyRoles[keyof typeof AcademyRoles] | typeof EnterpriseRoles[keyof typeof EnterpriseRoles];
