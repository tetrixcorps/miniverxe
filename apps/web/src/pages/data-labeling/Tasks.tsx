import React from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../lib/api';
import { Spinner } from '../../components/ui/spinner';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { withErrorBoundary } from '../../components/ui/withErrorBoundary';
import LoadingState from '../../components/ui/LoadingState';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import { auth } from '../../lib/firebase';

interface Task {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description: string;
  assignedTo?: string;
  dueDate?: string;
  status: string;
}

function Tasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [optimisticTasks, setOptimisticTasks] = React.useState<Task[] | null>(null);

  const { data: tasksData, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const result = await apiService.getTasks();
      if (result.error) {
        throw new Error(result.error);
      }
      return (result.data?.tasks || []).map((task: any) => ({
        ...task,
        projectId: task.projectId || '',
        projectName: task.projectName || '',
      }));
    },
  });

  const tasks = tasksData || [];
  const displayedTasks = optimisticTasks ?? tasks;

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => {
      return apiService.deleteTask(taskId);
    },
    onMutate: async (taskId: string) => {
      setOptimisticTasks((prev) => (prev ?? tasks).filter((t) => t.id !== taskId));
      toast.loading('Deleting task...');
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success('Task deleted!');
      setOptimisticTasks(null);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err, taskId, context) => {
      toast.dismiss();
      toast.error(err.message || 'Failed to delete task');
      setOptimisticTasks(null);
    },
  });

  const handleDelete = async (task: Task) => {
    const confirmed = await NiceModal.show('confirm-modal', {
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
    });
    if (confirmed) {
      deleteMutation.mutate(task.id);
    }
  };

  const handleViewDetails = (task: Task) => {
    NiceModal.show('task-details-modal', task); // Optionally fetch details inside modal
  };

  if (isLoading) {
    return <LoadingState message="Loading tasks..." />;
  }
  
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        title="Failed to load tasks"
        description="Unable to load your tasks. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
      <ul className="space-y-4">
        {Array.isArray(displayedTasks) && displayedTasks.length > 0 ? displayedTasks.map((task: Task) => (
          <li key={task.id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold text-lg">{task.title}</div>
              <div className="text-gray-600 text-sm mb-2">Due: {task.dueDate}</div>
              <div className="text-gray-700 text-sm">{task.description}</div>
            </div>
            <div className="flex flex-col gap-2 mt-4 md:mt-0 md:flex-row md:items-center">
              <button
                className="px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-red focus:outline-none focus:ring-2 focus:ring-brand-orange"
                onClick={() => handleViewDetails(task)}
              >
                View Details
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                disabled={!task.projectId}
                title={task.projectId ? 'Open this task in Label Studio' : 'No projectId available for this task'}
                onClick={async () => {
                  if (!task.projectId) return;
                  // Retrieve the current Firebase ID token for secure Label Studio access
                  const firebaseUser = auth.currentUser;
                  let token = undefined;
                  if (firebaseUser) {
                    token = await firebaseUser.getIdToken();
                  }
                  // Open Label Studio modal for this task, passing the user's token for secure access
                  NiceModal.show('label-studio-embed-modal', {
                    iframeUrl: `https://label.yourdomain.com/projects/${task.projectId}/tasks/${task.id}/`,
                    height: 700,
                    width: '100%',
                    token,
                    taskTitle: task.title,
                    projectName: task.projectName,
                    dueDate: task.dueDate,
                    readOnly: task.status !== 'active',
                    // When annotation is complete, refetch tasks and show a toast
                    onComplete: () => {
                      refetch();
                      toast.success('Annotation completed!');
                    },
                  });
                }}
              >
                Annotate
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
                onClick={() => handleDelete(task)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Spinner className="inline-block w-4 h-4 mr-2" /> : null}
                Delete
              </button>
            </div>
          </li>
        )) : <li className="text-gray-500">No tasks found.</li>}
      </ul>
    </div>
  );
}

export default withErrorBoundary(Tasks, {
  title: 'Tasks Error',
  showDetails: false
}); 