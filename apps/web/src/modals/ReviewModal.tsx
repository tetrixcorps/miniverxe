import React, { useState, useRef, useEffect } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';

export interface ReviewModalProps {
  itemId: string;
  context: 'task' | 'assignment' | 'project' | string;
  details?: React.ReactNode;
  title?: string;
}

const ReviewModal = NiceModal.create(({ itemId, context, details, title }: ReviewModalProps) => {
  const modal = useModal();
  const [status, setStatus] = useState<'approved' | 'rejected' | ''>('');
  const [feedback, setFeedback] = useState('');
  const [touched, setTouched] = useState(false);
  const firstRadioRef = useRef<HTMLInputElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = 'review-modal-title';
  const descId = 'review-modal-desc';

  // Focus trap and initial focus
  useEffect(() => {
    const focusableSelectors = 'input, textarea, button, [tabindex]:not([tabindex="-1"])';
    const node = modalRef.current;
    if (!node) return;
    const focusableEls = node.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableEls.length) {
      (firstRadioRef.current || focusableEls[0]).focus();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!status) {
      errorRef.current?.focus();
      return;
    }
    if (status === 'rejected' && !feedback.trim()) {
      errorRef.current?.focus();
      return;
    }
    modal.resolve({ status, feedback: feedback.trim() || undefined });
    modal.hide();
  };

  // Default summary if no custom details provided
  const renderDefaultDetails = () => (
    <div className="mb-4 p-3 bg-gray-50 rounded border text-sm" id={descId}>
      <strong>{context.charAt(0).toUpperCase() + context.slice(1)} ID:</strong> {itemId}<br/>
      <span className="text-gray-600">No additional details provided.</span>
    </div>
  );

  return (
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
        <h2 className="text-xl font-bold mb-4" id={titleId}>{title || `Review ${context.charAt(0).toUpperCase() + context.slice(1)}`}</h2>
        {details ? details : renderDefaultDetails()}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="font-semibold block mb-2">Decision</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  ref={firstRadioRef}
                  type="radio"
                  name="status"
                  value="approved"
                  checked={status === 'approved'}
                  onChange={() => setStatus('approved')}
                />
                Approve
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="rejected"
                  checked={status === 'rejected'}
                  onChange={() => setStatus('rejected')}
                />
                Reject
              </label>
            </div>
            <div
              ref={errorRef}
              tabIndex={-1}
              aria-live="polite"
              className="outline-none"
            >
              {touched && !status && <div className="text-red-500 text-xs mt-1">Please select a decision.</div>}
            </div>
          </div>
          {status === 'rejected' && (
            <div className="mb-4">
              <label className="font-semibold block mb-2">Feedback <span className="text-xs text-gray-500">(required)</span></label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                rows={3}
                required
                aria-required="true"
              />
              <div aria-live="polite">
                {touched && !feedback.trim() && <div className="text-red-500 text-xs mt-1">Feedback is required when rejecting.</div>}
              </div>
            </div>
          )}
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
              disabled={!status || (status === 'rejected' && !feedback.trim())}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default ReviewModal; 