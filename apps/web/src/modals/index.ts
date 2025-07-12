import NiceModal from '@ebay/nice-modal-react';
import AssignTaskModal from './AssignTaskModal';
import ConfirmModal from './ConfirmModal';
import TaskDetailsModal from './TaskDetailsModal';
import ReviewModal from './ReviewModal';
import AnalyticsFilterModal from './AnalyticsFilterModal';
import SubmitAssignmentModal from './SubmitAssignmentModal';
import ThreadedCommentsModal from './ThreadedCommentsModal';
import LabelStudioEmbedModal from '../components/data-labeling/LabelStudioEmbedModal';

NiceModal.register('assign-task-modal', AssignTaskModal);
NiceModal.register('confirm-modal', ConfirmModal);
NiceModal.register('task-details-modal', TaskDetailsModal);
NiceModal.register('review-modal', ReviewModal);
NiceModal.register('analytics-filter-modal', AnalyticsFilterModal);
NiceModal.register('submit-assignment-modal', SubmitAssignmentModal);
NiceModal.register('threaded-comments-modal', ThreadedCommentsModal);
NiceModal.register('label-studio-embed-modal', LabelStudioEmbedModal);

// Add more modal registrations here as you create them

export { default as ExampleModal } from './ExampleModal';
// export other modals here 