
import React from 'react';
import AdminAuth from '@/components/admin/AdminAuth';
import AdminOrdersHeader from '@/components/admin/AdminOrdersHeader';
import AdminOrderAnalytics from '@/components/admin/AdminOrderAnalytics';
import AdminOrdersTable from '@/components/admin/AdminOrdersTable';
import AdminLoadingState from '@/components/admin/AdminLoadingState';
import FulfillmentQueue from '@/components/admin/FulfillmentQueue';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminOrders } from '@/hooks/useAdminOrders';

const AdminOrders = () => {
  const { isAuthenticated, isCheckingAuth, handleLogout } = useAdminAuth();
  const { orders, isLoading, forceRefresh } = useAdminOrders(isAuthenticated);
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
    return <AdminAuth />;
  }

  if (isLoading) {
    return (
      <div className="admin-light min-h-screen bg-white p-6 text-gray-900">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif mb-8 text-gray-900">Admin Dashboard</h1>
          <div className="text-center text-gray-600">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-light min-h-screen bg-stone-50 px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <AdminOrdersHeader onLogout={handleLogout} />
        <FulfillmentQueue orders={orders || []} onRefresh={handleOrderUpdate} />
        <AdminOrderAnalytics orders={orders || []} />
        <AdminOrdersTable 
          orders={orders || []} 
          onRefresh={handleOrderUpdate} 
        />
      </div>
    </div>
  );
};

export default AdminOrders;
