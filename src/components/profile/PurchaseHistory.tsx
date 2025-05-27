
import React, { useEffect } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyPurchaseHistory from './EmptyPurchaseHistory';
import OrderHistoryTable from './OrderHistoryTable';

const PurchaseHistory = () => {
  const { user } = useAuth();
  const { orders, isLoading, fetchOrders, formatDate } = useOrders();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return <EmptyPurchaseHistory />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-gold mb-2">Purchase History</h2>
        <p className="text-muted-foreground">
          View and track all your previous orders
        </p>
      </div>

      <div className="bg-darker border border-gold/20 rounded-lg overflow-hidden">
        <OrderHistoryTable orders={orders} formatDate={formatDate} />
      </div>
    </div>
  );
};

export default PurchaseHistory;
