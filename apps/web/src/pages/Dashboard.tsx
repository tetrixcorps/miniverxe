import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/ui/card';
import { Alert } from '../components/ui/alert';
import { Table } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Spinner } from '../components/ui/spinner';
import NiceModal from '@ebay/nice-modal-react';
import { ExampleModal } from '../modals';
import apiService from '../lib/api';
import { withErrorBoundary } from '../components/ui/withErrorBoundary';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import LoadingState from '../components/ui/LoadingState';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiService.getDashboardData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleOpenModal = async () => {
    const result = await NiceModal.show('ExampleModal', { message: 'This is a NiceModal + shadcn/ui modal!' });
    if (result === 'confirmed') {
      alert('Confirmed!');
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ErrorDisplay
          error={error}
          title="Dashboard Error"
          description="Unable to load dashboard data. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const stats = dashboardData?.data?.stats || {
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    pendingReviews: 0,
    totalEarnings: 0,
    qualityScore: 0,
  };

  const projects = dashboardData?.data?.projects || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Dashboard</h1>
      <div className="mb-4">
        <Link to="/analytics" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">View Platform Analytics</Link>
      </div>
      <div className="border-l-4 border-blue-400 bg-blue-50 p-4 mb-6">
        <div className="font-bold mb-1">Welcome!</div>
        <div className="text-sm text-muted-foreground">Welcome to your dashboard! Here you can manage your projects and team.</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Total Projects</div>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Active Tasks</div>
          <div className="text-2xl font-bold">{stats.activeTasks}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Completed Tasks</div>
          <div className="text-2xl font-bold">{stats.completedTasks}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Pending Reviews</div>
          <div className="text-2xl font-bold">{stats.pendingReviews}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Total Earnings</div>
          <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Quality Score</div>
          <div className="text-2xl font-bold">{stats.qualityScore.toFixed(1)}%</div>
        </Card>
      </div>

      <div className="bg-white rounded shadow p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
        {projects.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Status</th>
                <th className="text-left">Progress</th>
                <th className="text-left">Members</th>
                <th className="text-left">Tasks</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-t">
                  <td className="font-medium">{project.name}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{project.progress}%</span>
                    </div>
                  </td>
                  <td>{project.assignedMembers}</td>
                  <td>{project.completedTasks}/{project.totalTasks}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No projects found. Create your first project to get started.
          </div>
        )}
      </div>
      
      {/* NiceModal Demo */}
      <Button onClick={handleOpenModal}>Open NiceModal Modal</Button>
    </div>
  );
}

export default withErrorBoundary(Dashboard, {
  title: 'Dashboard Error',
  showDetails: false
}); 