import React, { useRef, useEffect, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';

const AnalyticsFilterModal = NiceModal.create(() => {
  const modal = useModal();
  const [project, setProject] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const projectInputRef = useRef<HTMLInputElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = 'analytics-filter-modal-title';
  const descId = 'analytics-filter-modal-desc';

  // Focus trap and initial focus
  useEffect(() => {
    const focusableSelectors = 'input, select, button, [tabindex]:not([tabindex="-1"])';
    const node = modalRef.current;
    if (!node) return;
    const focusableEls = node.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableEls.length) {
      (projectInputRef.current || focusableEls[0]).focus();
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

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    modal.resolve({ project, status, dateFrom, dateTo });
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
        <h2 className="text-xl font-bold mb-4" id={titleId}>Filter Analytics</h2>
        <form onSubmit={handleApply}>
          <div id={descId} className="mb-2 text-sm text-gray-600">Set filters to refine analytics results.</div>
          <label className="block mb-2 font-semibold" htmlFor="analytics-project">Project</label>
          <input
            ref={projectInputRef}
            id="analytics-project"
            className="w-full border rounded px-3 py-2 mb-4"
            value={project}
            onChange={e => setProject(e.target.value)}
            placeholder="Project name or ID"
          />
          <label className="block mb-2 font-semibold" htmlFor="analytics-status">Status</label>
          <select
            id="analytics-status"
            className="w-full border rounded px-3 py-2 mb-4"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">Any</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <label className="block mb-2 font-semibold">Date Range</label>
          <div className="flex gap-2 mb-4">
            <input
              type="date"
              className="w-1/2 border rounded px-3 py-2"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              placeholder="From"
            />
            <input
              type="date"
              className="w-1/2 border rounded px-3 py-2"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              placeholder="To"
            />
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
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default AnalyticsFilterModal; 