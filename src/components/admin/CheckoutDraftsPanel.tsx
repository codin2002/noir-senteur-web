import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileClock, LockKeyhole } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { OFFERS } from '@/utils/constants';

interface CheckoutDraft {
  id: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  amount: number;
  currency: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  delivery_address: string | null;
  offer_name: string | null;
  cart_items: Array<{ perfume_id: string; quantity: number }>;
}

const perfumeNames: Record<string, string> = {
  [OFFERS.SIGNATURE_DUO.PRODUCT_IDS[0]]: '٣١٣',
  [OFFERS.SIGNATURE_DUO.PRODUCT_IDS[1]]: '٤٢٤',
};

const CheckoutDraftsPanel: React.FC = () => {
  const { data: drafts = [], isLoading, isError } = useQuery({
    queryKey: ['admin-checkout-drafts'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_checkout_drafts' as never);
      if (error) throw error;
      return (data || []) as unknown as CheckoutDraft[];
    },
    refetchInterval: 60_000,
  });

  return (
    <section className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 sm:p-5" aria-labelledby="saved-checkouts-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileClock className="h-5 w-5 text-sky-700" />
            <h2 id="saved-checkouts-heading" className="font-serif text-xl text-stone-950">Saved checkouts</h2>
          </div>
          <p className="mt-1 text-sm text-stone-600">Delivery details saved before payment. These are not orders and do not affect stock.</p>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700 shadow-sm">{drafts.length} active</div>
      </div>

      {isLoading ? (
        <p className="py-5 text-sm text-stone-500">Loading saved checkouts…</p>
      ) : isError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Saved checkout data is unavailable until the secure database update is installed.</p>
      ) : drafts.length === 0 ? (
        <p className="mt-4 rounded-lg border border-sky-100 bg-white/80 p-3 text-sm text-stone-600">No saved checkout forms right now.</p>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {drafts.map((draft) => (
            <article key={draft.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-950">{draft.customer_name || 'Name not provided'}</p>
                  <p className="text-sm text-stone-600">{draft.customer_phone || 'No phone'}{draft.customer_email ? ` · ${draft.customer_email}` : ''}</p>
                </div>
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800">Saved form</span>
              </div>
              <div className="mt-3 border-y border-stone-100 py-3 text-sm text-stone-700">
                <p className="font-medium">{draft.offer_name || 'Website checkout'} · AED {Number(draft.amount).toFixed(2)}</p>
                <p className="mt-1">{(draft.cart_items || []).map((item) => `${perfumeNames[item.perfume_id] || 'Perfume'} × ${item.quantity}`).join(' · ')}</p>
                {draft.delivery_address && <p className="mt-1 text-xs text-stone-500">{draft.delivery_address}</p>}
                <p className="mt-2 text-xs text-stone-500">Last saved {new Date(draft.updated_at).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs text-stone-500"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />Private operational data. It expires from this list after 72 hours and no reminder is sent automatically.</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default CheckoutDraftsPanel;
