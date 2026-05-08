
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

interface AdminOrdersHeaderProps {
  onLogout: () => void;
}

const AdminOrdersHeader: React.FC<AdminOrdersHeaderProps> = ({ onLogout }) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-serif mb-8 text-gray-900">Admin Dashboard</h1>
      <div className="flex items-center gap-4">
        <Link
          to="/admin/analytics"
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 transition hover:bg-gray-100"
        >
          <BarChart3 size={14} /> Analytics
        </Link>
        <button
          onClick={onLogout}
          className="text-gray-900 hover:text-gray-500 text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminOrdersHeader;
