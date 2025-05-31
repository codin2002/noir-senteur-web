
import React from 'react';

interface AdminOrdersHeaderProps {
  onLogout: () => void;
}

const AdminOrdersHeader: React.FC<AdminOrdersHeaderProps> = ({ onLogout }) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-serif mb-8 text-gold">Admin Dashboard</h1>
      <button
        onClick={onLogout}
        className="text-gold hover:text-gold/70 text-sm"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminOrdersHeader;
