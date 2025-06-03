
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle, Clock, Edit, Truck, RotateCcw, DollarSign } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total: number;
}

interface AdminDashboardSummaryProps {
  orders: Order[];
  onInventoryTest: () => void;
}

const AdminDashboardSummary: React.FC<AdminDashboardSummaryProps> = ({ orders, onInventoryTest }) => {
  // Force re-render by using the orders array length as a key dependency
  const deliveredOrders = React.useMemo(() => 
    orders?.filter(order => order.status === 'delivered') || [], [orders]);
  
  const processingOrders = React.useMemo(() => 
    orders?.filter(order => order.status === 'processing') || [], [orders]);
  
  const dispatchedOrders = React.useMemo(() => 
    orders?.filter(order => order.status === 'dispatched') || [], [orders]);
  
  const returnedOrders = React.useMemo(() => 
    orders?.filter(order => order.status === 'returned') || [], [orders]);
  
  const deliveredCount = deliveredOrders.length;
  const processingCount = processingOrders.length;
  const dispatchedCount = dispatchedOrders.length;
  const returnedCount = returnedOrders.length;
  
  const totalDeliveredValue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalDispatchedValue = dispatchedOrders.reduce((sum, order) => sum + order.total, 0);
  
  // Calculate total value of all orders
  const totalOrdersValue = React.useMemo(() => {
    return orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  }, [orders]);

  // Debug logging
  React.useEffect(() => {
    console.log('📊 Dashboard Summary Updated:', {
      totalOrders: orders?.length || 0,
      delivered: deliveredCount,
      processing: processingCount,
      dispatched: dispatchedCount,
      returned: returnedCount,
      deliveredValue: totalDeliveredValue,
      dispatchedValue: totalDispatchedValue,
      totalOrdersValue: totalOrdersValue
    });
  }, [orders, deliveredCount, processingCount, dispatchedCount, returnedCount, totalDeliveredValue, totalDispatchedValue, totalOrdersValue]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <Card className="bg-darker border-gold/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gold">Delivered Orders</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">{deliveredCount}</div>
          <p className="text-xs text-gray-400 mt-1">
            Total Value: AED {totalDeliveredValue.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-darker border-gold/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gold">Processing Orders</CardTitle>
          <Clock className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-400">{processingCount}</div>
          <p className="text-xs text-gray-400 mt-1">
            Awaiting fulfillment
          </p>
        </CardContent>
      </Card>

      <Card className="bg-darker border-gold/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gold">Dispatched Orders</CardTitle>
          <Truck className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-400">{dispatchedCount}</div>
          <p className="text-xs text-gray-400 mt-1">
            Value: AED {totalDispatchedValue.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-darker border-gold/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gold">Returned Orders</CardTitle>
          <RotateCcw className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400">{returnedCount}</div>
          <p className="text-xs text-gray-400 mt-1">
            Requires attention
          </p>
        </CardContent>
      </Card>

      <Card className="bg-darker border-gold/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gold">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-400">{orders?.length || 0}</div>
          <p className="text-xs text-gray-400 mt-1">
            Total Value: AED {totalOrdersValue.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-darker border-gold/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gold">Quick Actions</CardTitle>
          <Edit className="h-4 w-4 text-gold" />
        </CardHeader>
        <CardContent>
          <Button
            onClick={onInventoryTest}
            size="sm"
            className="w-full bg-gold text-darker hover:bg-gold/90"
          >
            Test Inventory
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardSummary;
