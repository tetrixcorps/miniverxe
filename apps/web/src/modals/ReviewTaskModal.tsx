import React, { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import ErrorMessage from '../components/ui/ErrorMessage';

interface ReviewTaskModalProps {
  taskId: string;
  error?: string;
}

const ReviewTaskModal = NiceModal.create(({ taskId, error }: ReviewTaskModalProps) => {
  const modal = useModal();
  const [status, setStatus] = useState<'approved' | 'rejected' | ''>('');
  const [feedback, setFeedback] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!status) return;
    if (status === 'rejected' && !feedback.trim()) return;
    modal.resolve({ status, feedback: feedback.trim() || undefined });
    modal.hide();
  };

  return (
    <ErrorBoundary>
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ${modal.visible ? '' : 'hidden'}`}
        role="dialog" aria-modal="true">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Review Task</h2>
          {/* Placeholder for task summary, replace with real data later */}
          <div className="mb-4 p-3 bg-gray-50 rounded border text-sm">
            <strong>Task ID:</strong> {taskId}<br/>
            <span className="text-gray-600">Task details preview goes here.</span>
          </div>
          <form onSubmit={handleSubmit}>
            {error && <ErrorMessage error={error} fallback="Failed to submit review" className="mb-2 text-xs" />}
            <div className="mb-4">
              <label className="font-semibold block mb-2">Decision</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="status" value="approved" checked={status === 'approved'} onChange={() => setStatus('approved')} />
                  Approve
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="status" value="rejected" checked={status === 'rejected'} onChange={() => setStatus('rejected')} />
                  Reject
                </label>
              </div>
              {touched && !status && <div className="text-red-500 text-xs mt-1">Please select a decision.</div>}
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
                {touched && !feedback.trim() && <div className="text-red-500 text-xs mt-1">Feedback is required when rejecting.</div>}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => modal.hide()} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-red" disabled={!status || (status === 'rejected' && !feedback.trim())}>Submit</button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default ReviewTaskModal; 