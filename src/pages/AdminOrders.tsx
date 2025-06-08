
import React, { useState } from 'react';
import AdminAuth from '@/components/admin/AdminAuth';
import AdminOrdersHeader from '@/components/admin/AdminOrdersHeader';
import AdminDashboardSummary from '@/components/admin/AdminDashboardSummary';
import InventoryManager from '@/components/admin/InventoryManager';
import InventoryLogs from '@/components/admin/InventoryLogs';
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

  const handleOrderUpdate = async () => {
    console.log('🔄 Order updated - forcing immediate refresh with extended delays...');
    
    // Immediate refresh
    forceRefresh();
    
    // Extended delay for database consistency
    setTimeout(() => {
      console.log('🔄 Secondary refresh after extended database sync delay...');
      forceRefresh();
    }, 3000);
    
    // Final refresh with longer delay
    setTimeout(() => {
      console.log('🔄 Final refresh to ensure complete database propagation...');
      forceRefresh();
    }, 7000);
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
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <InventoryManager />
          <InventoryLogs />
        </div>
        
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
