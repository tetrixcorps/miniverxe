import React from 'react';

export const AssignTaskButton = ({ onClick }: { onClick?: () => void }) => (
  <button
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    onClick={onClick}
  >
    Assign Task
  </button>
); 