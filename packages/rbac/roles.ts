export const Roles = {
  TaskAdmin: 'TaskAdmin',
  Reviewer: 'Reviewer',
  Labeler: 'Labeler',
  BillingAdmin: 'BillingAdmin',
  Owner: 'Owner',
  CodingStudent: 'CodingStudent',
  AcademyReviewer: 'AcademyReviewer',
  SuperAdmin: 'SuperAdmin',
} as const;
export type Role = typeof Roles[keyof typeof Roles]; 