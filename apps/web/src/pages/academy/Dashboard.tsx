import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Roles } from '@tetrix/rbac';
import { useNavigate } from 'react-router-dom';
import { DraggableWindow } from '../../components/ui/DraggableWindow';
import { LLMChatWindow } from '../../components/ui/LLMChatWindow';

export const AcademyDashboard: React.FC = () => {
  const { roles, user } = useAuth();
  const isStudent = roles.includes(Roles.CodingStudent);
  const isReviewer = roles.includes(Roles.AcademyReviewer);
  const isSuperAdmin = roles.includes(Roles.SuperAdmin);
  const navigate = useNavigate();
  const [llmOpen, setLlmOpen] = React.useState(false);

  const sidebarItems = [
    { label: 'My Assignments', href: '/academy/assignments', show: isStudent },
    { label: 'Submit Task', href: '/academy/submit', show: isStudent },
    { label: 'Review Queue', href: '/academy/review-academy', show: isReviewer },
    { label: 'CI Results', href: '/academy/ci', show: isStudent || isReviewer || isSuperAdmin },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="flex justify-end mb-2">
        {user && (
          <button
            className="px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-red focus:outline-none focus:ring-2 focus:ring-brand-orange"
            onClick={() => setLlmOpen(true)}
          >
            Chat with LLM
          </button>
        )}
      </div>
      {llmOpen && (
        <DraggableWindow title="LLM Chat" onClose={() => setLlmOpen(false)}>
          <LLMChatWindow />
        </DraggableWindow>
      )}
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.email}</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start" title={isStudent ? '' : 'Only students can view assignments.'}>
          <h2 className="font-semibold text-lg mb-2">My Assignments</h2>
          <p className="mb-4 text-gray-600">View your coding assignments.</p>
          <button
            className={`px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange ${isStudent ? 'bg-brand-orange text-white hover:bg-brand-red' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={!isStudent}
            onClick={() => isStudent && navigate('/academy/assignments')}
          >
            View Assignments
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start" title={isStudent ? '' : 'Only students can submit tasks.'}>
          <h2 className="font-semibold text-lg mb-2">Submit Task</h2>
          <p className="mb-4 text-gray-600">Submit your completed coding tasks.</p>
          <button
            className={`px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange ${isStudent ? 'bg-brand-orange text-white hover:bg-brand-red' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={!isStudent}
            onClick={() => isStudent && navigate('/academy/submit')}
          >
            Submit Task
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start" title={isReviewer ? '' : 'Only reviewers can access the review queue.'}>
          <h2 className="font-semibold text-lg mb-2">Review Queue</h2>
          <p className="mb-4 text-gray-600">Review student submissions.</p>
          <button
            className={`px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange ${isReviewer ? 'bg-brand-orange text-white hover:bg-brand-red' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={!isReviewer}
            onClick={() => isReviewer && navigate('/academy/review-academy')}
          >
            Review Submissions
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start" title={isStudent || isReviewer || isSuperAdmin ? '' : 'You do not have permission to view CI results.'}>
          <h2 className="font-semibold text-lg mb-2">CI Results</h2>
          <p className="mb-4 text-gray-600">View continuous integration results for your code.</p>
          <button
            className={`px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange ${(isStudent || isReviewer || isSuperAdmin) ? 'bg-brand-orange text-white hover:bg-brand-red' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={!(isStudent || isReviewer || isSuperAdmin)}
            onClick={() => (isStudent || isReviewer || isSuperAdmin) && navigate('/academy/ci')}
          >
            View CI Results
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AcademyDashboard; 