import React, { useRef, useEffect, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

const AssignTaskModal = NiceModal.create(({ taskId, error }: { taskId?: string; error?: string }) => {
  const modal = useModal();
  const [user, setUser] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [touched, setTouched] = useState(false);
  const userInputRef = useRef<HTMLInputElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = 'assign-task-modal-title';
  const descId = 'assign-task-modal-desc';

  // Focus trap and initial focus
  useEffect(() => {
    const focusableSelectors = 'input, button, [tabindex]:not([tabindex="-1"])';
    const node = modalRef.current;
    if (!node) return;
    const focusableEls = node.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableEls.length) {
      (userInputRef.current || focusableEls[0]).focus();
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

  const handleOk = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTouched(true);
    if (!user.trim() || !dueDate) {
      errorRef.current?.focus();
      return;
    }
    modal.resolve({ user, dueDate });
    modal.hide();
  };

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
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4" id={titleId}>Assign Task</h2>
          <form onSubmit={handleOk}>
            <div id={descId} className="mb-2 text-sm text-gray-600">Assign a task to a user and set a due date.</div>
            <label className="block mb-2 font-semibold" htmlFor="assign-user">Assign to User</label>
            <input
              ref={userInputRef}
              id="assign-user"
              className="w-full border rounded px-3 py-2 mb-4"
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="User email or name"
              required
              aria-required="true"
            />
            <label className="block mb-2 font-semibold" htmlFor="assign-due-date">Due Date</label>
            <input
              id="assign-due-date"
              className="w-full border rounded px-3 py-2 mb-4"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
              aria-required="true"
            />
            <div
              ref={errorRef}
              tabIndex={-1}
              aria-live="assertive"
              className="outline-none"
            >
              {error && <div className="text-red-500 text-xs mb-2" role="alert">{error}</div>}
              {touched && (!user.trim() || !dueDate) && (
                <div className="text-red-500 text-xs mb-2">User and due date are required.</div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                ref={cancelBtnRef}
                onClick={() => modal.hide()}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-red"
                disabled={!user.trim() || !dueDate}
              >
                Assign
              </button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default AssignTaskModal; 