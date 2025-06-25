import React from 'react';
import { useCan } from '@/hooks/useCan';

export default function ReviewPage() {
  const canReview = useCan('label.review');

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Review Labeled Data</h1>
      {/* Mock labeled data display (could be replaced with Label Studio iframe) */}
      <div className="border rounded p-4 bg-gray-50">
        <p className="mb-2 font-semibold">Labeled Data Example</p>
        <div className="h-32 flex items-center justify-center text-gray-400">
          [Label Studio iframe or data preview here]
        </div>
      </div>
      {/* Approve/Reject buttons, only for reviewers */}
      {canReview && (
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
        </div>
      )}
      {/* Placeholder for comment thread drawer */}
      <div className="mt-8 p-4 border rounded bg-white">
        <p className="font-semibold mb-2">Comments</p>
        <div className="text-gray-400">[Threaded comments UI coming soon]</div>
      </div>
    </div>
  );
} 