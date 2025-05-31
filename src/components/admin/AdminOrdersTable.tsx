
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrderStatusManager from '@/components/admin/OrderStatusManager';
import OrderReturnManager from '@/components/admin/OrderReturnManager';
import InvoiceGenerator from '@/components/admin/InvoiceGenerator';
import { formatDistanceToNow } from 'date-fns';

interface OrderItem {
  id: string;
  perfume_id: string;
  quantity: number;
  price: number;
  perfume: {
    name: string;
    price: string;
  };
}

interface Order {
  id: string;
  user_id: string | null;
  total: number;
  status: string;
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  delivery_address: string | null;
  notes: string | null;
  items: OrderItem[];
}

interface AdminOrdersTableProps {
  orders: Order[];
  onRefresh: () => void;
}

const AdminOrdersTable: React.FC<AdminOrdersTableProps> = ({ orders, onRefresh }) => {
  const parseDeliveryInfo = (deliveryAddress: string) => {
    if (!deliveryAddress) return null;
    
    if (deliveryAddress.includes('|')) {
      const parts = deliveryAddress.split('|');
      const info = {
        contactName: '',
        phone: '',
        email: '',
        address: ''
      };
      
      parts.forEach(part => {
        const trimmed = part.trim();
        if (trimmed.startsWith('Contact:')) {
          info.contactName = trimmed.replace('Contact:', '').trim();
        } else if (trimmed.startsWith('Phone:')) {
          info.phone = trimmed.replace('Phone:', '').trim();
        } else if (trimmed.startsWith('Email:')) {
          info.email = trimmed.replace('Email:', '').trim();
        } else if (trimmed.startsWith('Address:')) {
          info.address = trimmed.replace('Address:', '').trim();
        }
      });
      
      return info;
    }
    
    return null;
  };

  const getCustomerInfo = (order: Order) => {
    const deliveryInfo = parseDeliveryInfo(order.delivery_address || '');
    
    if (deliveryInfo && deliveryInfo.contactName) {
      return {
        name: deliveryInfo.contactName,
        email: deliveryInfo.email || 'No email',
        phone: deliveryInfo.phone || 'No phone'
      };
    }
    
    if (order.guest_name) {
      return {
        name: order.guest_name,
        email: order.guest_email || 'No email',
        phone: order.guest_phone || 'No phone'
      };
    }
    
    return {
      name: 'Registered User',
      email: 'Via user account',
      phone: 'Via user account'
    };
  };

  const getDeliveryAddress = (order: Order) => {
    const deliveryInfo = parseDeliveryInfo(order.delivery_address || '');
    
    if (deliveryInfo && deliveryInfo.address) {
      return deliveryInfo.address;
    }
    
    return order.delivery_address || 'Address on file';
  };

  return (
    <Card className="bg-darker border-gold/20">
      <CardHeader>
        <CardTitle className="text-gold">Order Management</CardTitle>
      </CardHeader>
      <CardContent>
        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gold/20">
                  <TableHead className="text-gold">Order ID</TableHead>
                  <TableHead className="text-gold">Customer</TableHead>
                  <TableHead className="text-gold">Contact</TableHead>
                  <TableHead className="text-gold">Delivery Address</TableHead>
                  <TableHead className="text-gold">Items</TableHead>
                  <TableHead className="text-gold">Total</TableHead>
                  <TableHead className="text-gold">Status</TableHead>
                  <TableHead className="text-gold">Date</TableHead>
                  <TableHead className="text-gold">Actions</TableHead>
                  <TableHead className="text-gold">Return Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const customer = getCustomerInfo(order);
                  const deliveryAddress = getDeliveryAddress(order);
                  return (
                    <TableRow key={order.id} className="border-gold/10">
                      <TableCell className="font-mono text-sm">
                        {order.id.split('-')[0]}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-400">{customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {customer.phone !== 'Via user account' && customer.phone !== 'No phone' && (
                            <div className="text-gray-300">{customer.phone}</div>
                          )}
                          {(customer.phone === 'Via user account' || customer.phone === 'No phone') && (
                            <div className="text-gray-500">No phone</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs truncate" title={deliveryAddress}>
                          {deliveryAddress}
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.items.map((item, index) => (
                          <div key={item.id} className="text-sm">
                            {item.perfume.name} (×{item.quantity})
                            {index < order.items.length - 1 && <br />}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="font-semibold">
                        AED {order.total}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'delivered' 
                            ? 'bg-green-500/20 text-green-400'
                            : order.status === 'dispatched'
                            ? 'bg-blue-500/20 text-blue-400'
                            : order.status === 'returned'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <OrderStatusManager
                            orderId={order.id}
                            currentStatus={order.status}
                            onStatusUpdated={onRefresh}
                          />
                          <div className="flex gap-2">
                            <OrderReturnManager
                              orderId={order.id}
                              currentStatus={order.status}
                              onStatusUpdated={onRefresh}
                            />
                            <InvoiceGenerator orderId={order.id} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.status === 'returned' ? (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 max-w-xs">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">
                                RETURNED
                              </span>
                            </div>
                            {order.notes && order.notes.includes('Return Reason:') && (
                              <div className="text-xs text-red-300">
                                <div className="font-medium mb-1">Reason:</div>
                                <div className="text-gray-300">
                                  {order.notes.replace('Return Reason: ', '')}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No orders found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminOrdersTable;
