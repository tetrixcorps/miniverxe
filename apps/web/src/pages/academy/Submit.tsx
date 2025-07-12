import React, { useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { useMutation } from '@tanstack/react-query';
import { submitAssignment } from '../../lib/utils';
import { Spinner } from '../../components/ui/spinner';
import { useAuth } from '../../hooks/useAuth';
import { AcademyAssignmentSchema } from '../../lib/schemas';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import ErrorMessage from '../../components/ui/ErrorMessage';

const Submit: React.FC = () => {
  const { user } = useAuth();
  const token = user?.accessToken || user?.stsTokenManager?.accessToken;
  const [error, setError] = useState('');

  // Mutation for submitting assignment with Zod validation and toast feedback
  const submitMutation = useMutation({
    mutationFn: (data: { file: File; comment: string; assignmentId?: string }) => submitAssignment(data, token),
    onSuccess: (response) => {
      // Zod validation for runtime safety
      const parsed = AcademyAssignmentSchema.safeParse(response?.data);
      if (!parsed.success) {
        toast.error('Invalid response from server.');
        setError('Invalid response from server.');
        return;
      }
      toast.success('Assignment submitted successfully!');
      setError('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit assignment');
      setError(err.message || 'Failed to submit assignment');
    },
  });

  const handleSubmit = async () => {
    try {
      const result = await NiceModal.show<{ file: File; comment: string }>('submit-assignment-modal');
      if (result) {
        submitMutation.mutate(result);
      }
    } catch (e) {
      // Modal was cancelled or closed
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Submit Task</h2>
        <p className="mb-4">Submit your completed coding tasks here.</p>
        <button
          className="px-6 py-2 bg-brand-orange text-white rounded font-semibold hover:bg-brand-red focus:outline-none focus:ring-2 focus:ring-brand-orange"
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? <Spinner className="inline-block w-5 h-5 mr-2" /> : null}
          Submit Assignment
        </button>
        {error && <ErrorMessage error={error} fallback="Failed to submit assignment." className="mt-4" />}
      </div>
    </ErrorBoundary>
  );
};

export default Submit; 