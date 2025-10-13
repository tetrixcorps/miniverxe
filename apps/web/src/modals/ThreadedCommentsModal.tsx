import React, { useRef, useEffect, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';

interface ThreadedCommentsModalProps {
  threadId: string;
  context: string;
}

const mockComments = [
  { id: '1', author: 'sarah.johnson@tetrixcorp.com', content: 'Excellent progress on the data annotation task. The quality metrics are looking great!', createdAt: '2024-07-15' },
  { id: '2', author: 'mike.chen@tetrixcorp.com', content: 'Please ensure consistency in the labeling criteria. I noticed some variations in the edge cases.', createdAt: '2024-07-16' },
  { id: '3', author: 'anna.williams@tetrixcorp.com', content: 'The automated quality checks are flagging some potential issues. Let me review and provide feedback.', createdAt: '2024-07-17' },
];

const ThreadedCommentsModal = NiceModal.create(({ threadId, context }: ThreadedCommentsModalProps) => {
  const modal = useModal();
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState('');
  const [touched, setTouched] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = 'threaded-comments-modal-title';
  const descId = 'threaded-comments-modal-desc';

  // Focus trap and initial focus
  useEffect(() => {
    const focusableSelectors = 'textarea, button, [tabindex]:not([tabindex="-1"])';
    const node = modalRef.current;
    if (!node) return;
    const focusableEls = node.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableEls.length) {
      (textareaRef.current || focusableEls[0]).focus();
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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!newComment.trim()) {
      errorRef.current?.focus();
      return;
    }
    setComments([
      ...comments,
      { id: String(comments.length + 1), author: 'current.user@tetrixcorp.com', content: newComment, createdAt: new Date().toISOString().slice(0, 10) },
    ]);
    setNewComment('');
    setTouched(false);
  };

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
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4" id={titleId}>Comments ({context})</h2>
        <div id={descId} className="mb-4 max-h-60 overflow-y-auto text-sm text-gray-600">View and add comments for this {context}.</div>
        <div className="mb-4 max-h-60 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-gray-500">No comments yet.</div>
          ) : (
            <ul className="space-y-3">
              {comments.map(c => (
                <li key={c.id} className="border-b pb-2">
                  <div className="text-sm text-gray-700">{c.content}</div>
                  <div className="text-xs text-gray-500">By {c.author} on {c.createdAt}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form onSubmit={handleAddComment} className="mt-4">
          <textarea
            ref={textareaRef}
            className="w-full border rounded px-3 py-2 mb-2"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            rows={2}
            placeholder="Add a comment..."
            required
            aria-required="true"
          />
          <div
            ref={errorRef}
            tabIndex={-1}
            aria-live="polite"
            className="outline-none"
          >
            {touched && !newComment.trim() && <div className="text-red-500 text-xs mb-2">Comment cannot be empty.</div>}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              ref={closeBtnRef}
              onClick={() => modal.hide()}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-red"
              disabled={!newComment.trim()}
            >
              Add Comment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default ThreadedCommentsModal; 