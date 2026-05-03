
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

interface AdminOrdersHeaderProps {
  onLogout: () => void;
}

const AdminOrdersHeader: React.FC<AdminOrdersHeaderProps> = ({ onLogout }) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-serif mb-8 text-gold">Admin Dashboard</h1>
      <div className="flex items-center gap-4">
        <Link
          to="/admin/analytics"
          className="flex items-center gap-1.5 rounded-md border border-gold/30 px-3 py-1.5 text-sm text-gold transition hover:bg-gold/10"
        >
          <BarChart3 size={14} /> Analytics
        </Link>
        <button
          onClick={onLogout}
          className="text-gold hover:text-gold/70 text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminOrdersHeader;
