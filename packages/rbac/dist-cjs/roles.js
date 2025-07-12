"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseRoles = exports.AcademyRoles = exports.DataAnnotatorRoles = exports.Roles = void 0;
// Core roles for all user groups
exports.Roles = {
    // Data Annotators
    TaskAdmin: 'TaskAdmin', // Data labeling admin
    Reviewer: 'Reviewer', // QA reviewer
    Labeler: 'Labeler', // Data labeler
    BillingAdmin: 'BillingAdmin', // Billing management
    Owner: 'Owner', // Organization owner
    // Academy
    CodingStudent: 'CodingStudent', // Academy student
    AcademyReviewer: 'AcademyReviewer', // Academy instructor
    // Enterprise
    SuperAdmin: 'SuperAdmin', // Platform super admin
};
// Extended roles for Data Annotators
exports.DataAnnotatorRoles = {
    ProjectManager: 'ProjectManager', // Manage labeling projects
    SeniorLabeler: 'SeniorLabeler', // Advanced labeling tasks
    JuniorLabeler: 'JuniorLabeler', // Basic labeling tasks
    QualityAssurance: 'QualityAssurance', // QA specialist
    DataScientist: 'DataScientist', // ML model training
};
// Extended roles for Academy
exports.AcademyRoles = {
    Student: 'Student', // Basic student
    AdvancedStudent: 'AdvancedStudent', // Advanced coursework
    TeachingAssistant: 'TeachingAssistant', // Help other students
    Instructor: 'Instructor', // Course instructor
    CurriculumManager: 'CurriculumManager', // Manage course content
};
// Extended roles for Enterprise
exports.EnterpriseRoles = {
    ClientAdmin: 'ClientAdmin', // Enterprise admin
    ClientUser: 'ClientUser', // Regular enterprise user
    ClientViewer: 'ClientViewer', // Read-only access
    IntegrationManager: 'IntegrationManager', // API integration
};
