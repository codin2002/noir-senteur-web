
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

interface AdminOrdersHeaderProps {
  onLogout: () => void;
}

const AdminOrdersHeader: React.FC<AdminOrdersHeaderProps> = ({ onLogout }) => {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Senteur operations</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Orders dashboard</h1>
        <p className="mt-1 text-sm text-stone-500">Live overview of sales, customers and deliveries across the UAE.</p>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/admin/analytics"
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 transition hover:bg-gray-100"
        >
          <BarChart3 size={14} /> Deep analytics
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
