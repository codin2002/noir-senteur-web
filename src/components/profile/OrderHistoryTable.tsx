
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Order } from '@/types/profile';
import OrderDetailsModal from '@/components/OrderDetailsModal';

interface OrderHistoryTableProps {
  orders: Order[];
  formatDate: (dateString: string) => string;
}

const OrderHistoryTable: React.FC<OrderHistoryTableProps> = ({
  orders,
  formatDate
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gold/20">
              <th className="text-left py-3 px-4">Order ID</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Total</th>
              <th className="text-left py-3 px-4">Items</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gold/10">
                <td className="py-3 px-4 font-mono text-sm">
                  #{order.id.substring(0, 8)}
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {formatDate(order.created_at)}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="secondary">{order.status}</Badge>
                </td>
                <td className="py-3 px-4 font-semibold">
                  AED {order.total.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {order.items.length} item(s)
                </td>
                <td className="py-3 px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewOrder(order.id)}
                    className="border-gold text-gold hover:bg-gold hover:text-darker"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        orderId={selectedOrderId}
      />
    </>
  );
};

export default OrderHistoryTable;
