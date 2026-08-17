import React from 'react';
import { Banknote, Clock3, PackageCheck, ShoppingBag, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AdminOrder } from '@/types/adminOrder';
import { getOrderEmirate } from '@/utils/orderUtils';

const AdminOrderAnalytics: React.FC<{ orders: AdminOrder[] }> = ({ orders }) => {
  const delivered = orders.filter((order) => order.status === 'delivered');
  const dispatched = orders.filter((order) => order.status === 'dispatched');
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
  const statuses = orders.reduce<Record<string, number>>((totals, order) => {
    totals[order.status] = (totals[order.status] || 0) + 1;
    return totals;
  }, {});
  const maxEmirate = Math.max(1, ...Object.values(emirates));
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
            <h2 className="text-xl font-semibold text-stone-950">Order status</h2>
            <p className="mb-6 text-sm text-stone-500">Current order totals by status</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statuses).map(([status, count]) => <span key={status} className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium capitalize text-stone-700">{status} · {count}</span>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOrderAnalytics;
