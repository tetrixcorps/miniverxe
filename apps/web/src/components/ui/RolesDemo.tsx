import React from 'react';
import { Roles } from '@tetrix/rbac';

export function RolesDemo() {
  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-bold mb-2">Roles from @tetrix/rbac</h2>
      <ul className="list-disc pl-5">
        {Object.entries(Roles).map(([key, value]) => (
          <li key={key} className="mb-1">
            <span className="font-mono text-blue-700">{key}</span>: <span className="text-gray-700">{String(value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 