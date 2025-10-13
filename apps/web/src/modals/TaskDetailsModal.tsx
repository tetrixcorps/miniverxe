import React, { useRef, useEffect } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

interface TaskDetailsModalProps {
  title: string;
  description: string;
  assignedTo?: string;
  dueDate?: string;
}

const TaskDetailsModal = NiceModal.create(({ title, description, assignedTo, dueDate }: TaskDetailsModalProps) => {
  const modal = useModal();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = 'task-details-modal-title';
  const descId = 'task-details-modal-desc';

  // Focus trap and initial focus
  useEffect(() => {
    const focusableSelectors = 'button, [tabindex]:not([tabindex="-1"])';
    const node = modalRef.current;
    if (!node) return;
    const focusableEls = node.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableEls.length) {
      (closeBtnRef.current || focusableEls[0]).focus();
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        modal.hide();
      }
      if (e.key === 'Tab') {
        // Focus trap
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    node.addEventListener('keydown', handleKeyDown);
    return () => node.removeEventListener('keydown', handleKeyDown);
  }, [modal.visible]);

  return (
    <ErrorBoundary>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ${modal.visible ? '' : 'hidden'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        ref={modalRef}
        tabIndex={-1}
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
          <h2 className="text-xl font-bold mb-2" id={titleId}>{title}</h2>
          <p className="mb-4 text-gray-700" id={descId}>{description}</p>
          {assignedTo && <div className="mb-2 text-sm text-gray-600">Assigned to: {assignedTo}</div>}
          {dueDate && <div className="mb-4 text-sm text-gray-600">Due: {dueDate}</div>}
          <div className="flex justify-end">
            <button
              ref={closeBtnRef}
              onClick={() => modal.hide()}
              className="px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-red"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default TaskDetailsModal; 