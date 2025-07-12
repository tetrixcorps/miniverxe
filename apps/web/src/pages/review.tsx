import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCan } from '../hooks/useCan';
import NiceModal from '@ebay/nice-modal-react';
import { Permissions } from '@tetrix/rbac';
import { Spinner } from '../components/ui/spinner';
import apiService from '../lib/api';

interface Review {
  id: string;
  taskId: string;
  projectId: string;
  projectName: string;
  submittedBy: string;
  submittedAt: string;
  status: string;
  annotations: any;
  comments?: string;
}

export default function ReviewPage() {
  const canReview = useCan(Permissions.ReviewTask);

  const { data: reviewData, isLoading, error } = useQuery({
    queryKey: ['review-queue'],
    queryFn: () => apiService.getReviewQueue(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Ensure reviews have projectId (fallback to empty string if missing)
  const reviews: Review[] = (reviewData?.data?.reviews || []).map((r: any) => ({
    ...r,
    projectId: r.projectId || '',
  }));

  const [lsModalUrl, setLsModalUrl] = useState<string | null>(null);
  const [lsModalError, setLsModalError] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Log Label Studio modal events
  useEffect(() => {
    if (lsModalUrl) {
      apiService.logLabelStudioEvent({ type: 'review-modal-open', details: { url: lsModalUrl } });
      return () => {
        apiService.logLabelStudioEvent({ type: 'review-modal-close', details: { url: lsModalUrl } });
      };
    }
  }, [lsModalUrl]);

  // Analytics handler
  const handleShowAnalytics = async () => {
    setShowAnalytics(true);
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const { data, error } = await apiService.getLabelStudioAnalytics();
      if (error || !data) {
        setAnalyticsError(error || 'Failed to load analytics');
        setAnalyticsData(null);
      } else {
        setAnalyticsData(data);
      }
    } catch (e: any) {
      setAnalyticsError(e.message || 'Failed to load analytics');
      setAnalyticsData(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleReview = async (taskId: string) => {
    try {
      const result = await NiceModal.show<{ status: 'approved' | 'rejected'; feedback?: string }>('review-modal', {
        itemId: taskId,
        context: 'task',
      });
      if (result) {
        alert(`Task ${result.status}${result.feedback ? `\nFeedback: ${result.feedback}` : ''}`);
      }
    } catch (e) {
      // Modal was cancelled or closed
    }
  };

  const handleComments = async (taskId: string) => {
    await NiceModal.show('threaded-comments-modal', {
      threadId: taskId,
      context: 'task',
    });
  };

  const handleLabelStudioReview = async (review: Review) => {
    setLsModalError(null);
    try {
      const { data, error } = await apiService.reviewAuthenticate({
        projectId: review.projectId,
        taskId: review.taskId,
        labelId: review.id,
      });
      if (error || !data?.authenticatedUrl) {
        setLsModalError(error || 'Failed to get Label Studio review URL');
        return;
      }
      setLsModalUrl(data.authenticatedUrl);
    } catch (e: any) {
      setLsModalError(e.message || 'Failed to open Label Studio');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-8 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="h-8 w-8" />
          <p className="mt-4 text-gray-600">Loading review queue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="mb-4 border-l-4 border-red-400 bg-red-50 p-4 text-red-800">
          Error loading review queue. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Review Labeled Data</h1>
      
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{review.projectName}</p>
                  <p className="text-sm text-gray-600">Submitted by: {review.submittedBy}</p>
                  <p className="text-sm text-gray-600">
                    Submitted: {new Date(review.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  review.status === 'approved' ? 'bg-green-100 text-green-800' :
                  review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {review.status}
                </span>
              </div>
              
              {/* Mock labeled data display (could be replaced with Label Studio iframe) */}
              <div className="border rounded p-4 bg-white mb-4">
                <p className="mb-2 font-semibold">Labeled Data Preview</p>
                <div className="h-32 flex items-center justify-center text-gray-400">
                  [Label Studio iframe or data preview here]
                </div>
                {/* Review in Label Studio button for reviewers */}
                {canReview && review.status === 'completed' && (
                  <button
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => handleLabelStudioReview(review)}
                  >
                    Review in Label Studio
                  </button>
                )}
                {lsModalError && <div className="text-red-500 text-xs mt-2">{lsModalError}</div>}
              </div>

              {/* Review buttons, only for reviewers */}
              {canReview && review.status === 'pending' && (
                <div className="flex gap-4">
                  <button
                    className="px-6 py-2 bg-brand-orange text-white rounded font-semibold hover:bg-brand-red focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    onClick={() => handleReview(review.taskId)}
                  >
                    Review
                  </button>
                  <button
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    onClick={() => handleComments(review.taskId)}
                  >
                    Comments
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No reviews pending. All tasks have been reviewed.
        </div>
      )}

      {/* Placeholder for comment thread drawer */}
      <div className="mt-8 p-4 border rounded bg-white">
        <p className="font-semibold mb-2">Comments</p>
        <div className="text-gray-400">[Threaded comments UI coming soon]</div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={handleShowAnalytics}
        >
          View Reviewer Analytics
        </button>
      </div>

      {/* Label Studio modal/iframe */}
      {lsModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setLsModalUrl(null)}
              aria-label="Close"
            >
              ×
            </button>
            <iframe
              src={lsModalUrl + '&readOnly=1'}
              title="Label Studio Review"
              className="w-full h-[600px] border rounded"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Analytics Modal/Drawer */}
      {showAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAnalytics(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Reviewer Analytics</h2>
            {analyticsLoading ? (
              <div className="text-center py-8">Loading analytics...</div>
            ) : analyticsError ? (
              <div className="text-red-500">{analyticsError}</div>
            ) : analyticsData ? (
              <pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto">{JSON.stringify(analyticsData, null, 2)}</pre>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
} 