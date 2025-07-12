import React from 'react';
import { useMutation } from '@tanstack/react-query';
import apiService from '../../lib/api';
import { Spinner } from '../../components/ui/spinner';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { withErrorBoundary } from '../../components/ui/withErrorBoundary';

function Assign() {
  const { user } = useAuth();

  const assignMutation = useMutation({
    mutationFn: (data: { user: string; dueDate: string }) => {
      return apiService.assignTask(data);
    },
    onSuccess: () => {
      toast.success('Task assigned successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to assign task');
    },
  });

  const handleAssign = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = {
      user: formData.get('user') as string,
      dueDate: formData.get('dueDate') as string,
    };
    assignMutation.mutate(data);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Assign Task</h2>
      <form onSubmit={handleAssign} className="max-w-md space-y-4">
        <div>
          <label htmlFor="user" className="block text-sm font-medium text-gray-700">
            Assign to User
          </label>
          <input
            type="text"
            id="user"
            name="user"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange"
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange"
          />
        </div>
        <button
          type="submit"
          disabled={assignMutation.isPending}
          className="w-full px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-red focus:outline-none focus:ring-2 focus:ring-brand-orange disabled:opacity-50"
        >
          {assignMutation.isPending ? <Spinner className="inline-block w-4 h-4 mr-2" /> : null}
          Assign Task
        </button>
      </form>
    </div>
  );
}

export default withErrorBoundary(Assign, {
  title: 'Assign Error',
  showDetails: false
}); 