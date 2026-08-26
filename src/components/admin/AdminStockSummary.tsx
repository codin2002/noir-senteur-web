import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Boxes, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StockRow {
  perfume_id: string;
  stock_quantity: number;
  low_stock_threshold: number;
  updated_at: string;
  perfumes: { name: string } | null;
}

const AdminStockSummary: React.FC = () => {
  const {
    data: stock = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin-stock-summary'],
    queryFn: async (): Promise<StockRow[]> => {
      const { data, error } = await supabase
        .from('inventory')
        .select('perfume_id, stock_quantity, low_stock_threshold, updated_at, perfumes(name)');

      if (error) throw error;

      return ((data || []) as StockRow[]).sort((a, b) =>
        (a.perfumes?.name || '').localeCompare(b.perfumes?.name || '', 'ar'),
      );
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5" aria-labelledby="current-stock-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-amber-700" />
            <h2 id="current-stock-heading" className="font-serif text-xl text-stone-950">Current stock</h2>
          </div>
          <p className="mt-1 text-sm text-stone-500">Live bottle count after confirmed online and manual orders.</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
          aria-label="Refresh current stock"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-stone-200 bg-white px-4 py-6 text-center text-sm text-stone-500">
          Loading stock…
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          Stock could not be loaded. Please refresh and try again.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {stock.map((item) => {
            const isOut = item.stock_quantity <= 0;
            const isLow = !isOut && item.stock_quantity <= item.low_stock_threshold;

            return (
              <article
                key={item.perfume_id}
                className={`flex items-center justify-between rounded-lg border bg-white px-4 py-4 ${
                  isOut ? 'border-red-200' : isLow ? 'border-amber-300' : 'border-stone-200'
                }`}
              >
                <div>
                  <p className="text-2xl font-semibold text-stone-950">{item.perfumes?.name || 'Perfume'}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">100 ml</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-semibold tabular-nums text-stone-950">{item.stock_quantity}</p>
                  <p className="text-sm text-stone-500">bottles in stock</p>
                  {(isOut || isLow) && (
                    <p className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${isOut ? 'text-red-700' : 'text-amber-700'}`}>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {isOut ? 'Out of stock' : 'Low stock'}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default AdminStockSummary;
