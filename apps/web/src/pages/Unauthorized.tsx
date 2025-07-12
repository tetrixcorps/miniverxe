import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-red via-brand-orange to-brand-yellow">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-brand-red">Unauthorized</h1>
      <p className="mb-6 text-gray-700 text-center">You do not have permission to access this page.</p>
      <Link
        to="/login"
        className="px-6 py-3 rounded bg-brand-orange text-white font-semibold text-lg hover:bg-brand-red focus:outline-none focus:ring-2 focus:ring-brand-orange w-full text-center"
      >
        Back to Login
      </Link>
    </div>
  </div>
);

export default Unauthorized; 