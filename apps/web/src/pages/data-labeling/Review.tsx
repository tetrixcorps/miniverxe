import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../lib/api';
import { Spinner } from '../../components/ui/spinner';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { withErrorBoundary } from '../../components/ui/withErrorBoundary';
import LoadingState from '../../components/ui/LoadingState';
import ErrorDisplay from '../../components/ui/ErrorDisplay';

interface Review {
  id: string;
  taskId: string;
  projectName: string;
  submittedBy: string;
  submittedAt: string;
  status: string;
  annotations: any;
  comments?: string;
}

function Review() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reviewsData, isLoading, error, refetch } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const result = await apiService.getReviewQueue();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data?.reviews || [];
    },
  });

  const reviews = reviewsData || [];

  const submitReviewMutation = useMutation({
    mutationFn: (data: {
      taskId: string;
      status: 'approved' | 'rejected';
      feedback?: string;
    }) => {
      return apiService.submitTaskReview(data);
    },
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit review');
    },
  });

  const handleApprove = (review: Review) => {
    submitReviewMutation.mutate({
      taskId: review.taskId,
      status: 'approved',
      feedback: 'Approved by reviewer'
    });
  };

  const handleReject = (review: Review) => {
    submitReviewMutation.mutate({
      taskId: review.taskId,
      status: 'rejected',
      feedback: 'Rejected by reviewer'
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading reviews..." />;
  }
  
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        title="Failed to load reviews"
        description="Unable to load review queue. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Review Queue</h2>
      <ul className="space-y-4">
        {Array.isArray(reviews) && reviews.length > 0 ? reviews.map((review: Review) => (
          <li key={review.id} className="bg-white rounded shadow p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-lg">Task: {review.taskId}</div>
                <div className="text-gray-600 text-sm mb-2">Project: {review.projectName}</div>
                <div className="text-gray-600 text-sm mb-2">Submitted by: {review.submittedBy}</div>
                <div className="text-gray-600 text-sm mb-2">Submitted: {review.submittedAt}</div>
                <div className="text-gray-700 text-sm">{review.comments}</div>
              </div>
              <div className="flex flex-col gap-2 mt-4 md:mt-0 md:flex-row md:items-center">
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                  onClick={() => handleApprove(review)}
                  disabled={submitReviewMutation.isPending}
                >
                  {submitReviewMutation.isPending ? <Spinner className="inline-block w-4 h-4 mr-2" /> : null}
                  Approve
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
                  onClick={() => handleReject(review)}
                  disabled={submitReviewMutation.isPending}
                >
                  {submitReviewMutation.isPending ? <Spinner className="inline-block w-4 h-4 mr-2" /> : null}
                  Reject
                </button>
              </div>
            </div>
          </li>
        )) : <li className="text-gray-500">No reviews found.</li>}
      </ul>
    </div>
  );
}

export default withErrorBoundary(Review, {
  title: 'Review Error',
  showDetails: false
}); 