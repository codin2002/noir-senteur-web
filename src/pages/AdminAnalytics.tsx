import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminAuth from '@/components/admin/AdminAuth';
import AdminLoadingState from '@/components/admin/AdminLoadingState';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import MetricCard from '@/components/admin/analytics/MetricCard';
import RevenueChart from '@/components/admin/analytics/RevenueChart';
import InventoryMovementChart from '@/components/admin/analytics/InventoryMovementChart';
import ProductPerformanceChart from '@/components/admin/analytics/ProductPerformanceChart';
import ActivityHeatmap from '@/components/admin/analytics/ActivityHeatmap';
import AIInsights from '@/components/admin/analytics/AIInsights';

const formatAed = (n: number) =>
  n >= 1000 ? `AED ${(n / 1000).toFixed(1)}k` : `AED ${n.toFixed(0)}`;

const AdminAnalytics: React.FC = () => {
  const { isAuthenticated, isCheckingAuth, handleAuthenticated, handleLogout } = useAdminAuth();
  const { data, isLoading } = useAnalyticsData();

  if (isCheckingAuth) return <AdminLoadingState />;
  if (!isAuthenticated) return <AdminAuth onAuthenticated={handleAuthenticated} />;

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-900"
            >
              <ArrowLeft size={16} /> Back to Orders
            </Link>
            <h1 className="font-serif text-3xl text-gold">Analytics Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="text-sm text-gold hover:text-gray-500">
            Logout
          </button>
        </div>

        {isLoading || !data ? (
          <div className="py-20 text-center text-gold">Loading analytics...</div>
        ) : (
          <>
            {/* Row 1 — KPIs */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Revenue"
                value={formatAed(data.totals.totalRevenue)}
                delta={data.totals.revenueGrowthPct}
                prevValue={formatAed(data.totals.prevRevenue)}
                spark={data.totals.revenueSpark}
              />
              <MetricCard
                label="Orders"
                value={String(data.totals.totalOrders)}
                delta={data.totals.ordersGrowthPct}
                prevValue={String(data.totals.prevOrders)}
                spark={data.totals.ordersSpark}
              />
              <MetricCard
                label="Units Sold"
                value={String(data.totals.totalUnitsSold)}
                delta={data.totals.unitsGrowthPct}
                prevValue={String(data.totals.prevUnits)}
                spark={data.totals.unitsSpark}
              />
              <MetricCard
                label="Avg Order Value"
                value={data.totals.aov > 0 ? `AED ${data.totals.aov.toFixed(2)}` : '—'}
                delta={data.totals.aovGrowthPct}
                prevValue={data.totals.prevAov > 0 ? `AED ${data.totals.prevAov.toFixed(2)}` : undefined}
                hint="Revenue ÷ orders"
              />
            </div>

            {/* Row 2 — Revenue (2/3) + Insights (1/3) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RevenueChart data={data.monthlyRevenue} />
              </div>
              <div className="lg:col-span-1">
                <AIInsights data={data} />
              </div>
            </div>

            {/* Row 3 — Inventory + Heatmap */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <InventoryMovementChart data={data.inventoryMovement} />
              <ActivityHeatmap data={data.heatmap} peak={data.peak} />
            </div>

            {/* Row 4 — Top products full width */}
            <ProductPerformanceChart data={data.productPerformance} />

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-muted-foreground">
              Note: Engagement tracking (opens, clicks, conversion) is not displayed because no
              tracking pixels or event-logging backend is wired up. To enable it, route outbound
              links through unique tracking IDs and log events to a new <code>engagement_events</code> table.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
