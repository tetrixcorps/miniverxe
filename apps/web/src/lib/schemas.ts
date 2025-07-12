import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
});

export const TaskListSchema = z.array(TaskSchema);

export const TaskDetailsSchema = TaskSchema.extend({
  // Add more fields if needed
});

export const AnalyticsRowSchema = z.object({
  project: z.string(),
  status: z.string(),
  date: z.string(),
  metric: z.any(), // Adjust type as needed
});
export const AnalyticsListSchema = z.array(AnalyticsRowSchema);

export const BillingRowSchema = z.object({
  number: z.string(),
  date: z.string(),
  amount: z.number().or(z.string()),
  status: z.string(),
});
export const BillingListSchema = z.array(BillingRowSchema);

export const ReviewTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  submittedBy: z.string().optional(),
  submittedAt: z.string().optional(),
});
export const ReviewTaskListSchema = z.array(ReviewTaskSchema);

export type Task = z.infer<typeof TaskSchema>;
export type TaskDetails = z.infer<typeof TaskDetailsSchema>;
export type AnalyticsRow = z.infer<typeof AnalyticsRowSchema>;
export type BillingRow = z.infer<typeof BillingRowSchema>;
export type ReviewTask = z.infer<typeof ReviewTaskSchema>;

// Code Academy Assignments
export const AcademyAssignmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  dueDate: z.string().optional(),
  status: z.string(),
  // ...other fields as needed
});
export const AcademyAssignmentListSchema = z.array(AcademyAssignmentSchema);
export type AcademyAssignment = z.infer<typeof AcademyAssignmentSchema>;

// Code Academy Review
export const AcademyReviewSchema = z.object({
  id: z.string(),
  assignmentId: z.string(),
  reviewer: z.string(),
  status: z.enum(['approved', 'rejected', 'pending']),
  comment: z.string().optional(),
  reviewedAt: z.string().optional(),
});
export const AcademyReviewListSchema = z.array(AcademyReviewSchema);
export type AcademyReview = z.infer<typeof AcademyReviewSchema>;

// Code Academy CI Results
export const AcademyCISchema = z.object({
  id: z.string(),
  assignmentId: z.string(),
  status: z.string(),
  output: z.string().optional(),
  createdAt: z.string().optional(),
});
export const AcademyCIListSchema = z.array(AcademyCISchema);
export type AcademyCI = z.infer<typeof AcademyCISchema>;

// Code Academy Threaded Comments
export const AcademyCommentSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  author: z.string(),
  content: z.string(),
  createdAt: z.string(),
});
export const AcademyCommentListSchema = z.array(AcademyCommentSchema);
export type AcademyComment = z.infer<typeof AcademyCommentSchema>; 