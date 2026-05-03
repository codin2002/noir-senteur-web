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

const AdminAnalytics: React.FC = () => {
  const { isAuthenticated, isCheckingAuth, handleAuthenticated, handleLogout } = useAdminAuth();
  const { data, isLoading } = useAnalyticsData();

  if (isCheckingAuth) return <AdminLoadingState />;
  if (!isAuthenticated) return <AdminAuth onAuthenticated={handleAuthenticated} />;

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 text-sm text-gold/70 transition hover:text-gold"
            >
              <ArrowLeft size={16} /> Back to Orders
            </Link>
            <h1 className="font-serif text-3xl text-gold">Analytics Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="text-sm text-gold hover:text-gold/70">
            Logout
          </button>
        </div>

        {isLoading || !data ? (
          <div className="py-20 text-center text-gold">Loading analytics...</div>
        ) : (
          <>
            {/* KPI cards (real data only) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Total Revenue"
                value={`AED ${data.totals.totalRevenue.toFixed(2)}`}
                delta={data.totals.revenueGrowthPct}
              />
              <MetricCard
                label="Total Orders"
                value={String(data.totals.totalOrders)}
                hint="Completed payments"
              />
              <MetricCard
                label="Units Sold"
                value={String(data.totals.totalUnitsSold)}
                hint="Across all paid orders"
              />
              <MetricCard
                label="Avg Order Value"
                value={
                  data.totals.totalOrders > 0
                    ? `AED ${(data.totals.totalRevenue / data.totals.totalOrders).toFixed(2)}`
                    : '—'
                }
                hint="Revenue ÷ orders"
              />
            </div>

            <AIInsights data={data} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <RevenueChart data={data.monthlyRevenue} />
              <InventoryMovementChart data={data.inventoryMovement} />
              <ProductPerformanceChart data={data.productPerformance} />
              <ActivityHeatmap data={data.heatmap} />
            </div>

            <div className="rounded-lg border border-gold/10 bg-dark/30 p-4 text-xs text-muted-foreground">
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
