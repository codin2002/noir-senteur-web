import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, PackageCheck, Search, Truck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { AdminOrder } from '@/types/adminOrder';
import { getCustomerInfo, getDeliveryAddress } from '@/utils/orderUtils';
import { toast } from 'sonner';

type FulfillmentStatus = AdminOrder['fulfillment_status'];

const stages: Record<FulfillmentStatus, { label: string; next?: FulfillmentStatus; action?: string }> = {
  new: { label: 'New order', next: 'packed', action: 'Mark packed' },
  packed: { label: 'Packed', next: 'shipped', action: 'Mark shipped' },
  shipped: { label: 'Shipped', next: 'delivered', action: 'Mark delivered' },
  delivered: { label: 'Delivered' },
};

const FulfillmentQueue: React.FC<{ orders: AdminOrder[]; onRefresh: () => void }> = ({ orders, onRefresh }) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const activeOrders = orders.filter(
    (order) =>
      order.fulfillment_status !== 'delivered' &&
      !['refunded', 'refund', 'returned', 'cancelled'].includes(order.status)
  );
  const normalizedSearch = search.trim().toLowerCase().replace(/^sen-/, '');
  const visibleOrders = normalizedSearch
    ? activeOrders.filter((order) => {
        const customer = getCustomerInfo(order);
        const searchableText = [
          order.id.slice(0, 8),
          customer.name,
          customer.phone,
          customer.email,
          getDeliveryAddress(order),
        ].join(' ').toLowerCase();
        return searchableText.includes(normalizedSearch);
      })
    : activeOrders.slice(0, 8);

  const updateFulfillment = async (order: AdminOrder) => {
    const nextStatus = stages[order.fulfillment_status].next;
    if (!nextStatus) return;
    setUpdatingId(order.id);
    try {
      const update = {
        fulfillment_status: nextStatus,
        ...(nextStatus === 'shipped' ? { status: 'dispatched' } : {}),
        ...(nextStatus === 'delivered' ? { status: 'delivered' } : {}),
      };
      const { error } = await supabase.from('orders').update(update).eq('id', order.id);
      if (error) throw error;
      if (nextStatus === 'delivered') {
        const { error: notificationError } = await supabase.functions.invoke('send-delivery-notification', { body: { orderId: order.id } });
        if (notificationError) console.warn('Delivery notification could not be sent', notificationError);
      }
      toast.success(`Order marked ${stages[nextStatus].label.toLowerCase()}`);
      onRefresh();
    } catch (error: any) {
      toast.error('Could not update fulfilment', { description: error.message });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50/40 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-stone-950"><PackageCheck className="h-5 w-5 text-amber-700" />Fulfilment queue</CardTitle>
            <p className="mt-1 text-sm text-stone-600">Work through new orders in order: pack, ship, then deliver.</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">{activeOrders.length} active</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reference, customer name, phone, email, or address"
            className="border-stone-300 bg-white pl-9 pr-10 text-stone-950 placeholder:text-stone-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {activeOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-emerald-300 bg-emerald-50 p-6 text-center text-sm text-emerald-800">All orders are delivered.</div>
        ) : visibleOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-600">No active order matches that search.</div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {visibleOrders.map((order) => {
              const customer = getCustomerInfo(order);
              const stage = stages[order.fulfillment_status];
              return (
                <div key={order.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-stone-500">SEN-{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="mt-1 font-semibold text-stone-950">{customer.name}</p>
                      <p className="text-sm text-stone-600">{customer.phone}</p>
                    </div>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">{stage.label}</span>
                  </div>
                  <p className="mt-3 text-sm text-stone-600">{getDeliveryAddress(order)}</p>
                  <div className="mt-3 border-t border-stone-100 pt-3 text-sm text-stone-800">
                    {order.items.map((item) => <p key={item.id}><span className="font-semibold">{item.perfume.name}</span> × {item.quantity}</p>)}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="font-semibold text-stone-950">AED {Number(order.total).toFixed(2)}</span>
                    <Button size="sm" onClick={() => void updateFulfillment(order)} disabled={updatingId === order.id} className="bg-stone-900 text-white hover:bg-stone-700">
                      {order.fulfillment_status === 'packed' ? <Truck /> : order.fulfillment_status === 'shipped' ? <CheckCircle2 /> : <ChevronRight />}
                      {updatingId === order.id ? 'Updating…' : stage.action}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FulfillmentQueue;
