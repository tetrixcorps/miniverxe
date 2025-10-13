import React, { useRef, useEffect } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';

const ConfirmModal = NiceModal.create(({ title = 'Confirm', message = 'Are you sure?' }: { title?: string; message?: string }) => {
  const modal = useModal();
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const okBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = 'confirm-modal-title';
  const descId = 'confirm-modal-desc';

  // Focus trap and initial focus
  useEffect(() => {
    const focusableSelectors = 'button, [tabindex]:not([tabindex="-1"])';
    const node = modalRef.current;
    if (!node) return;
    const focusableEls = node.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableEls.length) {
      (cancelBtnRef.current || focusableEls[0]).focus();
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

  const handleOk = () => {
    modal.resolve(true);
    modal.hide();
  };
  const handleCancel = () => {
    modal.resolve(false);
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
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4" id={titleId}>{title}</h2>
        <p className="mb-6 text-gray-700" id={descId} aria-live="polite">{message}</p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            ref={cancelBtnRef}
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold"
          >
            Cancel
          </button>
          <button
            ref={okBtnRef}
            onClick={handleOk}
            className="px-4 py-2 rounded bg-brand-orange text-white font-semibold hover:bg-brand-red"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
});

export default ConfirmModal; 