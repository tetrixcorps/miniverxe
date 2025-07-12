import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import NiceModal from '@ebay/nice-modal-react';
import { Alert } from '../../components/ui/alert';
import { Spinner } from '../../components/ui/spinner';
import apiService from '../../lib/api';

const ProjectApproval: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  const { data: projectData, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiService.getProject(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const project = projectData?.data;

  const handleReview = async () => {
    if (!project) return;
    
    try {
      const result = await NiceModal.show<{ status: 'approved' | 'rejected'; feedback?: string }>('review-modal', {
        itemId: project.id,
        context: 'project',
        title: 'Approve Project',
        details: (
          <div className="mb-4 p-3 bg-gray-50 rounded border text-sm">
            <strong>Project Name:</strong> {project.name}<br />
            <strong>Description:</strong> {project.description}<br />
            <strong>Status:</strong> {project.status}<br />
            <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}<br />
            {project.deadline && (
              <>
                <strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}<br />
              </>
            )}
            {project.budget && (
              <>
                <strong>Budget:</strong> ${project.budget.toLocaleString()}<br />
              </>
            )}
          </div>
        ),
      });
      if (result) {
        alert(`Project ${result.status}${result.feedback ? `\nFeedback: ${result.feedback}` : ''}`);
      }
    } catch (e) {
      // Modal was cancelled or closed
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="h-8 w-8" />
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-4 border-l-4 border-red-400 bg-red-50 p-4 text-red-800">
          Error loading project details. Please try again later.
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="mb-4 border-l-4 border-red-400 bg-red-50 p-4 text-red-800">
          Project not found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Project Approval</h2>
      <div className="mb-4">
        <Link to={`/projects/${project.id}/analytics`} className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">View Project Analytics</Link>
      </div>
      <div className="border rounded p-4 bg-gray-50 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
            <p className="text-gray-600 mb-2">{project.description}</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </p>
              <p><strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}</p>
              {project.deadline && (
                <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
              )}
              {project.budget && (
                <p><strong>Budget:</strong> ${project.budget.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
        <button
          className="px-6 py-2 bg-brand-orange text-white rounded font-semibold hover:bg-brand-red focus:outline-none focus:ring-2 focus:ring-brand-orange"
          onClick={handleReview}
        >
          Review/Approve
        </button>
      </div>
    </div>
  );
};

export default ProjectApproval; 