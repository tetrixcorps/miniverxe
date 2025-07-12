import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCan } from '../../hooks/useCan';
import { Permissions, Roles } from '@tetrix/rbac';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { DraggableWindow } from '../../components/ui/DraggableWindow';
import { LLMChatWindow } from '../../components/ui/LLMChatWindow';
import DataLabelingDashboard from '../../components/data-labeling/Dashboard';

export const DataLabelingDashboardPage: React.FC = () => {
  const { roles, user } = useAuth();
  const canAssign = useCan(Permissions.AssignTask);
  const canReview = useCan(Permissions.ReviewTask);
  const isAdmin = roles.includes(Roles.TaskAdmin) || roles.includes(Roles.Owner);
  const isBilling = roles.includes(Roles.BillingAdmin);
  const navigate = useNavigate();
  const [llmOpen, setLlmOpen] = React.useState(false);

  const sidebarItems = [
    { label: 'Dashboard', href: '/data-labeling', show: true },
    { label: 'My Tasks', href: '/data-labeling/tasks', show: true },
    { label: 'Assign Tasks', href: '/data-labeling/assign', show: canAssign },
    { label: 'Review Queue', href: '/data-labeling/review', show: canReview },
    { label: 'Analytics', href: '/data-labeling/analytics', show: isAdmin || isBilling },
    { label: 'Billing', href: '/data-labeling/billing', show: isBilling },
  ];

  // For testing purposes, let's render the dashboard directly without layout
  return (
    <ErrorBoundary>
      <DataLabelingDashboard />
    </ErrorBoundary>
  );
};

export default DataLabelingDashboardPage; 