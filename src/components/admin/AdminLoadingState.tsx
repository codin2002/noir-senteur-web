
import React from 'react';

const AdminLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-serif mb-4 text-gold">Loading...</h2>
        <div className="w-16 h-16 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default AdminLoadingState;
