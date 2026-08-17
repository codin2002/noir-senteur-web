import React from 'react';
import { Banknote, Clock3, PackageCheck, ShoppingBag, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AdminOrder } from '@/types/adminOrder';
import { getOrderEmirate } from '@/utils/orderUtils';

const AdminOrderAnalytics: React.FC<{ orders: AdminOrder[] }> = ({ orders }) => {
  const delivered = orders.filter((order) => order.status === 'delivered');
  const dispatched = orders.filter((order) => order.status === 'dispatched');
  // Only paid orders that are still in the pre-dispatch fulfilment stage need action.
  // Refunded, cancelled, returned and dispatched orders must not inflate this count.
  const pending = orders.filter(
    (order) => order.status === 'processing' && order.fulfillment_status !== 'delivered'
  );
  const revenue = delivered.reduce((sum, order) => sum + Number(order.total), 0);
  const units = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  const emirates = orders.reduce<Record<string, number>>((totals, order) => {
    const emirate = getOrderEmirate(order);
    totals[emirate] = (totals[emirate] || 0) + 1;
    return totals;
  }, {});
  const audiences = orders.reduce<Record<string, number>>((totals, order) => {
    order.items.forEach((item) => {
      const audience = item.audience || 'Unisex';
      totals[audience] = (totals[audience] || 0) + item.quantity;
    });
    return totals;
  }, { Men: 0, Women: 0, Unisex: 0 });
  const statuses = orders.reduce<Record<string, number>>((totals, order) => {
    totals[order.status] = (totals[order.status] || 0) + 1;
    return totals;
  }, {});
  const maxEmirate = Math.max(1, ...Object.values(emirates));
  const maxAudience = Math.max(1, ...Object.values(audiences));
  const kpis = [
    { label: 'Total orders', value: orders.length, note: `${units} products ordered`, icon: ShoppingBag, tone: 'bg-stone-900' },
    { label: 'Pending delivery', value: pending.length, note: 'Needs fulfilment', icon: Clock3, tone: 'bg-amber-600' },
    { label: 'Out for delivery', value: dispatched.length, note: 'Currently dispatched', icon: Truck, tone: 'bg-blue-600' },
    { label: 'Delivered', value: delivered.length, note: 'Completed orders', icon: PackageCheck, tone: 'bg-emerald-600' },
    { label: 'Delivered revenue', value: `AED ${revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, note: 'From completed orders', icon: Banknote, tone: 'bg-violet-600' }
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map(({ label, value, note, icon: Icon, tone }) => (
          <Card key={label} className="border-stone-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between">
                <span className="text-sm font-medium text-stone-500">{label}</span>
                <span className={`${tone} rounded-lg p-2 text-white`}><Icon size={16} /></span>
              </div>
              <div className="text-2xl font-semibold tracking-tight text-stone-950">{value}</div>
              <div className="mt-1 text-xs text-stone-500">{note}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="border-stone-200 bg-white shadow-sm lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-stone-950">Orders by Emirate</h2>
            <p className="mb-6 text-sm text-stone-500">Where your customers are ordering from</p>
            <div className="space-y-4">
              {Object.entries(emirates).sort((a, b) => b[1] - a[1]).map(([emirate, count]) => (
                <div key={emirate}>
                  <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-stone-700">{emirate}</span><span className="text-stone-500">{count} {count === 1 ? 'order' : 'orders'}</span></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400" style={{ width: `${(count / maxEmirate) * 100}%` }} /></div>
                </div>
              ))}
              {orders.length === 0 && <p className="py-8 text-center text-sm text-stone-400">Order locations will appear here.</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-stone-950">Product audience</h2>
            <p className="mb-6 text-sm text-stone-500">Units ordered by fragrance profile</p>
            <div className="space-y-5">
              {Object.entries(audiences).map(([audience, count]) => (
                <div key={audience}>
                  <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-stone-700">{audience}</span><span className="text-stone-500">{count} units</span></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-stone-100"><div className={`h-full rounded-full ${audience === 'Men' ? 'bg-sky-500' : audience === 'Women' ? 'bg-fuchsia-500' : 'bg-violet-500'}`} style={{ width: `${(count / maxAudience) * 100}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-stone-100 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">Order status</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statuses).map(([status, count]) => <span key={status} className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium capitalize text-stone-700">{status} · {count}</span>)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOrderAnalytics;
