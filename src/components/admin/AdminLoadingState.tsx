
import React from 'react';

const AdminLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-serif mb-4 text-gray-900">Loading...</h2>
        <div className="w-16 h-16 border-4 border-t-gray-900 border-b-gray-900 border-r-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default AdminLoadingState;
