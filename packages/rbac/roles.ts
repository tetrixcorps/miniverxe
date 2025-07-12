// Core roles for all user groups
export const Roles = {
  // Data Annotators
  TaskAdmin: 'TaskAdmin',        // Data labeling admin
  Reviewer: 'Reviewer',          // QA reviewer
  Labeler: 'Labeler',            // Data labeler
  BillingAdmin: 'BillingAdmin',  // Billing management
  Owner: 'Owner',                // Organization owner
  
  // Academy
  CodingStudent: 'CodingStudent', // Academy student
  AcademyReviewer: 'AcademyReviewer', // Academy instructor
  
  // Enterprise
  SuperAdmin: 'SuperAdmin',      // Platform super admin
} as const;

// Extended roles for Data Annotators
export const DataAnnotatorRoles = {
  ProjectManager: 'ProjectManager',     // Manage labeling projects
  SeniorLabeler: 'SeniorLabeler',       // Advanced labeling tasks
  JuniorLabeler: 'JuniorLabeler',       // Basic labeling tasks
  QualityAssurance: 'QualityAssurance', // QA specialist
  DataScientist: 'DataScientist',       // ML model training
} as const;

// Extended roles for Academy
export const AcademyRoles = {
  Student: 'Student',                   // Basic student
  AdvancedStudent: 'AdvancedStudent',   // Advanced coursework
  TeachingAssistant: 'TeachingAssistant', // Help other students
  Instructor: 'Instructor',             // Course instructor
  CurriculumManager: 'CurriculumManager', // Manage course content
} as const;

// Extended roles for Enterprise
export const EnterpriseRoles = {
  ClientAdmin: 'ClientAdmin',           // Enterprise admin
  ClientUser: 'ClientUser',             // Regular enterprise user
  ClientViewer: 'ClientViewer',         // Read-only access
  IntegrationManager: 'IntegrationManager', // API integration
} as const;

// Combined roles type
export type Role = typeof Roles[keyof typeof Roles] | 
                  typeof DataAnnotatorRoles[keyof typeof DataAnnotatorRoles] |
                  typeof AcademyRoles[keyof typeof AcademyRoles] |
                  typeof EnterpriseRoles[keyof typeof EnterpriseRoles]; 