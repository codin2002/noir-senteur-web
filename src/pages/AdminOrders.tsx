
import React, { useState } from 'react';
import AdminAuth from '@/components/admin/AdminAuth';
import AdminOrdersHeader from '@/components/admin/AdminOrdersHeader';
import AdminDashboardSummary from '@/components/admin/AdminDashboardSummary';
import InventoryManager from '@/components/admin/InventoryManager';
import AdminOrdersTable from '@/components/admin/AdminOrdersTable';
import InventoryTestModal from '@/components/admin/InventoryTestModal';
import AdminLoadingState from '@/components/admin/AdminLoadingState';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminOrders } from '@/hooks/useAdminOrders';

const AdminOrders = () => {
  const { isAuthenticated, isCheckingAuth, handleAuthenticated, handleLogout } = useAdminAuth();
  const { orders, isLoading, forceRefresh } = useAdminOrders(isAuthenticated);
  const [isInventoryTestOpen, setIsInventoryTestOpen] = useState(false);

  const handleInventoryTest = () => {
    setIsInventoryTestOpen(true);
  };

  const handleOrderUpdate = () => {
    console.log('🔄 Order updated - forcing refresh of all data...');
    forceRefresh();
  };

  if (isCheckingAuth) {
    return <AdminLoadingState />;
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif mb-8 text-gold">Admin Dashboard</h1>
          <div className="text-center text-gold">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <AdminOrdersHeader onLogout={handleLogout} />
        
        <AdminDashboardSummary 
          orders={orders || []} 
          onInventoryTest={handleInventoryTest}
        />
        
        <InventoryManager />
        
        <AdminOrdersTable 
          orders={orders || []} 
          onRefresh={handleOrderUpdate} 
        />

        <InventoryTestModal 
          isOpen={isInventoryTestOpen} 
          onClose={() => setIsInventoryTestOpen(false)} 
        />
      </div>
    </div>
  );
};

export default AdminOrders;
