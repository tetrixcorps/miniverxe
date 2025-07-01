import React, { useRef, useEffect, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';

const SubmitAssignmentModal = NiceModal.create(() => {
  const modal = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [touched, setTouched] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = 'submit-assignment-modal-title';
  const descId = 'submit-assignment-modal-desc';

  // Focus trap and initial focus
  useEffect(() => {
    const focusableSelectors = 'input, textarea, button, [tabindex]:not([tabindex="-1"])';
    const node = modalRef.current;
    if (!node) return;
    const focusableEls = node.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableEls.length) {
      (fileInputRef.current || focusableEls[0]).focus();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!file) {
      errorRef.current?.focus();
      return;
    }
    modal.resolve({ file, comment });
    modal.hide();
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
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4" id={titleId}>Submit Assignment</h2>
        <form onSubmit={handleSubmit}>
          <div id={descId} className="mb-2 text-sm text-gray-600">Upload your assignment file and add optional comments for the reviewer.</div>
          <label className="block mb-2 font-semibold" htmlFor="submit-file">Upload File <span className="text-xs text-gray-500">(required)</span></label>
          <input
            ref={fileInputRef}
            id="submit-file"
            type="file"
            className="w-full mb-4"
            onChange={handleFileChange}
            required
            aria-required="true"
          />
          <div
            ref={errorRef}
            tabIndex={-1}
            aria-live="polite"
            className="outline-none"
          >
            {touched && !file && <div className="text-red-500 text-xs mb-2">File is required.</div>}
          </div>
          <label className="block mb-2 font-semibold" htmlFor="submit-comment">Comments <span className="text-xs text-gray-500">(optional)</span></label>
          <textarea
            id="submit-comment"
            className="w-full border rounded px-3 py-2 mb-4"
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder="Add any comments for the reviewer"
          />
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
              disabled={!file}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default SubmitAssignmentModal; 