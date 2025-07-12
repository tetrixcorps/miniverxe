import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  TaskListSchema,
  TaskDetailsSchema,
  AnalyticsListSchema,
  BillingListSchema,
  ReviewTaskListSchema,
  AcademyAssignmentSchema,
  AcademyAssignmentListSchema,
} from './schemas'
import { z } from 'zod'
import { toast } from 'react-hot-toast'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API utility: Fetch tasks
export async function fetchTasks(token: string) {
  const res = await fetch('/api/tasks', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let errorMsg = 'Failed to fetch tasks';
    let errorCode = undefined;
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorMsg;
      errorCode = errorData.code;
    } catch {}
    const error = new Error(errorMsg);
    if (errorCode) (error as any).code = errorCode;
    throw error;
  }
  const data = await res.json();
  const parsed = TaskListSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid tasks response from server');
  }
  return parsed.data;
}

// API utility: Delete task
export async function deleteTask(taskId: string, token: string) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let errorMsg = 'Failed to delete task';
    let errorCode = undefined;
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorMsg;
      errorCode = errorData.code;
    } catch {}
    const error = new Error(errorMsg);
    if (errorCode) (error as any).code = errorCode;
    throw error;
  }
  return res.json();
}

// API utility: Fetch single task details
export async function fetchTaskDetails(taskId: string, token: string) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let errorMsg = 'Failed to fetch task details';
    let errorCode = undefined;
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorMsg;
      errorCode = errorData.code;
    } catch {}
    const error = new Error(errorMsg);
    if (errorCode) (error as any).code = errorCode;
    throw error;
  }
  const data = await res.json();
  const parsed = TaskDetailsSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid task details response from server');
  }
  return parsed.data;
}

// API utility: Assign task
export async function assignTask({ user, dueDate }: { user: string; dueDate: string }, token: string) {
  const res = await fetch('/api/tasks/assign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user, dueDate }),
  });
  if (!res.ok) {
    let errorMsg = 'Failed to assign task';
    let errorCode = undefined;
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorMsg;
      errorCode = errorData.code;
    } catch {}
    const error = new Error(errorMsg);
    if (errorCode) (error as any).code = errorCode;
    throw error;
  }
  // If the API returns the assigned task, validate it; otherwise, just return void
  if (res.headers.get('content-type')?.includes('application/json')) {
    const data = await res.json();
    const parsed = TaskDetailsSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error('Invalid assign task response from server');
    }
    return parsed.data;
  }
  return undefined;
}

// API utility: Fetch analytics data
export async function fetchAnalytics({ project, status, dateFrom, dateTo }: { project?: string; status?: string; dateFrom?: string; dateTo?: string }, token: string) {
  const params = new URLSearchParams();
  if (project) params.append('project', project);
  if (status) params.append('status', status);
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);
  const res = await fetch(`/api/analytics?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let errorMsg = 'Failed to fetch analytics';
    let errorCode = undefined;
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorMsg;
      errorCode = errorData.code;
    } catch {}
    const error = new Error(errorMsg);
    if (errorCode) (error as any).code = errorCode;
    throw error;
  }
  const data = await res.json();
  const parsed = AnalyticsListSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid analytics response from server');
  }
  return parsed.data;
}

// API utility: Fetch billing/invoice data
export async function fetchBilling(token: string) {
  const res = await fetch('/api/billing', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let errorMsg = 'Failed to fetch billing data';
    let errorCode = undefined;
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorMsg;
      errorCode = errorData.code;
    } catch {}
    const error = new Error(errorMsg);
    if (errorCode) (error as any).code = errorCode;
    throw error;
  }
  const data = await res.json();
  const parsed = BillingListSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid billing response from server');
  }
  return parsed.data;
}

// API utility: Fetch review queue (tasks needing review)
export async function fetchReviewQueue(token: string) {
  const res = await fetch('/api/review-queue', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let errorMsg = 'Failed to fetch review queue';
    let errorCode = undefined;
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorMsg;
      errorCode = errorData.code;
    } catch {}
    const error = new Error(errorMsg);
    if (errorCode) (error as any).code = errorCode;
    throw error;
  }
  const data = await res.json();
  const parsed = ReviewTaskListSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid review queue response from server');
  }
  return parsed.data;
}

// API utility: Submit a review for a task
export async function submitTaskReview({ taskId, status, feedback }: { taskId: string; status: 'approved' | 'rejected'; feedback?: string }, token: string) {
  const res = await fetch(`/api/tasks/${taskId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, feedback }),
  });
  if (!res.ok) {
    let errorMsg = 'Failed to submit review';
    let errorCode = undefined;
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorMsg;
      errorCode = errorData.code;
    } catch {}
    const error = new Error(errorMsg);
    if (errorCode) (error as any).code = errorCode;
    throw error;
  }
  return res.json();
}

// API utility: Fetch assignments for the student
export async function fetchAssignments(token: string) {
  const res = await fetch('/api/assignments', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json();
}

// API utility: Submit an assignment
export async function submitAssignment({ file, comment, assignmentId }: { file: File; comment: string; assignmentId?: string }, token: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('comment', comment);
  if (assignmentId) formData.append('assignmentId', assignmentId);
  const res = await fetch('/api/assignments/submit', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to submit assignment');
  return res.json();
}

// API utility: Fetch assignments needing review (academy)
export async function fetchAcademyReviewQueue(token: string) {
  const res = await fetch('/api/academy/review-queue', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch academy review queue');
  return res.json();
}

// API utility: Remove assignment from review queue
export async function removeAssignmentFromQueue(assignmentId: string, token: string) {
  const res = await fetch(`/api/academy/review-queue/${assignmentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to remove assignment from queue');
  return res.json();
}

// API utility: Fetch CI results for the student
export async function fetchCIResults(token: string) {
  const res = await fetch('/api/ci-results', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch CI results');
  return res.json();
}

export async function fetchAcademyAssignments() {
  try {
    const res = await fetch('/api/academy/assignments');
    const data = await res.json();
    const parsed = AcademyAssignmentListSchema.safeParse(data);
    if (!parsed.success) {
      toast.error('Invalid assignment data received.');
      return { error: 'Invalid data', data: null };
    }
    return { error: null, data: parsed.data };
  } catch (e) {
    toast.error('Failed to fetch assignments.');
    return { error: 'Network error', data: null };
  }
}

export async function submitAcademyAssignment(payload: z.infer<typeof AcademyAssignmentSchema>) {
  try {
    const res = await fetch('/api/academy/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || 'Submission failed.');
      return { error: data.message || 'Submission failed', data: null };
    }
    const parsed = AcademyAssignmentSchema.safeParse(data);
    if (!parsed.success) {
      toast.error('Invalid response from server.');
      return { error: 'Invalid response', data: null };
    }
    toast.success('Assignment submitted!');
    return { error: null, data: parsed.data };
  } catch (e) {
    toast.error('Network error.');
    return { error: 'Network error', data: null };
  }
}
