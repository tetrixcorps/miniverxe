import React from 'react';
import { useQuery } from '@tanstack/react-query';
import NiceModal from '@ebay/nice-modal-react';
import { fetchAssignments } from '../../lib/utils';
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
  dueDate?: string;
  status?: string;
}

const Assignments: React.FC = () => {
  const { user } = useAuth();
  const token = user?.accessToken || user?.stsTokenManager?.accessToken;

  // Fetch assignments with React Query
  const { data, isLoading, error } = useQuery<Assignment[] | null>({
    queryKey: ['assignments'],
    queryFn: async () => {
      const result = await fetchAssignments(token);
      // Zod validation for runtime safety
      const parsed = AcademyAssignmentListSchema.safeParse(result?.data);
      if (!parsed.success) {
        toast.error('Invalid assignment data received.');
        return null;
      }
      return parsed.data;
    },
    enabled: !!token,
  });

  const handleViewDetails = (assignment: Assignment) => {
    NiceModal.show('task-details-modal', assignment);
  };

  const handleSubmit = async (assignment: Assignment) => {
    try {
      const result = await NiceModal.show<{ file: File; comment: string }>('submit-assignment-modal', { assignmentId: assignment.id });
      if (result) {
        toast.success('Assignment submitted!'); // Real submission logic should go here
      }
    } catch (e) {
      // Modal was cancelled or closed
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">My Assignments</h2>
        {isLoading ? (
          <LoadingState message="Loading assignments..." />
        ) : error ? (
          <ErrorMessage error={error} fallback="Error loading assignments." />
        ) : !data ? (
          <ErrorMessage error="Invalid assignment data." fallback="No assignments found." />
        ) : data.length > 0 ? (
          <ul className="space-y-4">
            {data.map((assignment) => (
              <li key={assignment.id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-lg">{assignment.title}</div>
                  <div className="text-gray-600 text-sm mb-2">Due: {assignment.dueDate || 'N/A'}</div>
                  <div className="text-gray-700 text-sm">{assignment.description}</div>
                  <div className="text-xs text-gray-500 mt-1">Status: {assignment.status || 'N/A'}</div>
                </div>
                <div className="flex flex-col gap-2 mt-4 md:mt-0 md:flex-row md:items-center">
                  <button
                    className="px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-red focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    onClick={() => handleViewDetails(assignment)}
                  >
                    View Details
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-red focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    onClick={() => handleSubmit(assignment)}
                  >
                    Submit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">No assignments found.</div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Assignments; 