import React from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAcademyReviewQueue, removeAssignmentFromQueue, submitTaskReview } from '../../lib/utils';
import { Spinner } from '../../components/ui/spinner';
import { useAuth } from '../../hooks/useAuth';
import { AcademyAssignmentListSchema } from '../../lib/schemas';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingState from '../../components/ui/LoadingState';

interface Assignment {
  id: string;
  title: string;
  description: string;
  submittedBy?: string;
  submittedAt?: string;
}

const ReviewAcademy: React.FC = () => {
  const { user } = useAuth();
  const token = user?.accessToken || user?.stsTokenManager?.accessToken;
  const queryClient = useQueryClient();

  // Fetch review queue with Zod validation
  const { data, isLoading, error } = useQuery<Assignment[] | null>({
    queryKey: ['academy-review-queue'],
    queryFn: async () => {
      const result = await fetchAcademyReviewQueue(token);
      const parsed = AcademyAssignmentListSchema.safeParse(result?.data);
      if (!parsed.success) {
        toast.error('Invalid review queue data received.');
        return null;
      }
      return parsed.data;
    },
    enabled: !!token,
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: (data: { assignmentId: string; status: 'approved' | 'rejected'; feedback?: string }) =>
      submitTaskReview({ taskId: data.assignmentId, status: data.status, feedback: data.feedback }, token),
    onSuccess: () => {
      toast.success('Review submitted!');
      queryClient.invalidateQueries({ queryKey: ['academy-review-queue'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit review');
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (assignmentId: string) => removeAssignmentFromQueue(assignmentId, token),
    onSuccess: () => {
      toast.success('Assignment removed from queue.');
      queryClient.invalidateQueries({ queryKey: ['academy-review-queue'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to remove assignment');
    },
  });

  const handleReview = async (assignment: Assignment) => {
    try {
      const result = await NiceModal.show<{ status: 'approved' | 'rejected'; feedback?: string }>('review-modal', {
        itemId: assignment.id,
        context: 'assignment',
        title: `Review Assignment: ${assignment.title}`,
        details: (
          <div className="mb-4 p-3 bg-gray-50 rounded border text-sm">
            <strong>Description:</strong> {assignment.description}
          </div>
        ),
      });
      if (result) {
        reviewMutation.mutate({ assignmentId: assignment.id, ...result });
      }
    } catch (e) {
      // Modal was cancelled or closed
    }
  };

  const handleRemove = async (assignment: Assignment) => {
    const confirmed = await NiceModal.show('confirm-modal', {
      title: 'Remove Assignment',
      message: 'Are you sure you want to remove this assignment from the queue? This action cannot be undone.',
    });
    if (confirmed) {
      removeMutation.mutate(assignment.id);
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Review Queue</h2>
        {isLoading ? (
          <LoadingState message="Loading review queue..." />
        ) : error ? (
          <ErrorMessage error={error} fallback="Error loading review queue." />
        ) : !data ? (
          <ErrorMessage error="Invalid review queue data." fallback="No assignments to review." />
        ) : data.length > 0 ? (
          <ul className="space-y-4">
            {data.map((assignment) => (
              <li key={assignment.id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-lg">{assignment.title}</div>
                  <div className="text-gray-600 text-sm mb-2">Submitted by: {assignment.submittedBy || 'N/A'} on {assignment.submittedAt || 'N/A'}</div>
                  <div className="text-gray-700 text-sm">{assignment.description}</div>
                </div>
                <div className="flex flex-col gap-2 mt-4 md:mt-0 md:flex-row md:items-center">
                  <button
                    className="px-6 py-2 bg-brand-orange text-white rounded font-semibold hover:bg-brand-red focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    onClick={() => handleReview(assignment)}
                    disabled={reviewMutation.isPending}
                  >
                    {reviewMutation.isPending ? <Spinner className="inline-block w-4 h-4 mr-2" /> : null}
                    Review
                  </button>
                  <button
                    className="px-6 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
                    onClick={() => handleRemove(assignment)}
                    disabled={removeMutation.isPending}
                  >
                    {removeMutation.isPending ? <Spinner className="inline-block w-4 h-4 mr-2" /> : null}
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">No assignments to review.</div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ReviewAcademy; 