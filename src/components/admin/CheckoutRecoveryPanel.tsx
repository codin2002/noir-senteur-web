import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock3, Copy, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AdminOrder } from '@/types/adminOrder';
import { OFFERS } from '@/utils/constants';

interface RecoveryCheckout {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  checkout_status: 'pending' | 'failed';
  recovery_status: 'new' | 'contacted' | 'dismissed';
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  offer_name: string | null;
  cart_items: Array<{ perfume_id: string; quantity: number; price?: number }>;
  resume_token: string;
  recovery_email_status: 'sending' | 'sent' | 'failed' | 'skipped' | null;
  recovery_email_sent_at: string | null;
}

interface CheckoutDraft {
  id: string;
  updated_at: string;
  amount: number;
  currency: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  offer_name: string | null;
  cart_items: Array<{ perfume_id: string; quantity: number; price?: number }>;
  resume_token: string;
  recovery_email_status: 'sending' | 'sent' | 'failed' | 'skipped' | null;
  recovery_email_sent_at: string | null;
}

interface LiveCheckoutRow {
  id: string;
  source: 'draft' | 'checkout';
  lastActivity: string;
  amount: number;
  currency: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  offerName: string | null;
  cartItems: Array<{ perfume_id: string; quantity: number; price?: number }>;
  resumeToken: string;
  stage: 'Details entered' | 'Payment not completed' | 'Payment setup failed';
  recoveryStatus: 'new' | 'contacted' | 'dismissed';
  recoveryEmailStatus: 'sending' | 'sent' | 'failed' | 'skipped' | null;
  recoveryEmailSentAt: string | null;
  attempts: number;
}

interface CheckoutRecoveryPanelProps {
  orders: AdminOrder[];
}

const perfumeNames: Record<string, string> = {
  [OFFERS.SIGNATURE_DUO.PRODUCT_IDS[0]]: '٣١٣',
  [OFFERS.SIGNATURE_DUO.PRODUCT_IDS[1]]: '٤٢٤',
};

const normalizePhone = (phone: string | null | undefined) => {
  const digits = (phone || '').replace(/\D/g, '');
  return digits.length >= 7 ? digits.slice(-9) : '';
};

const normalizeEmail = (email: string | null | undefined) => (email || '').trim().toLowerCase();

const addressValue = (address: string | null | undefined, label: 'Phone' | 'Email') => {
  if (!address) return '';
  const match = address.match(new RegExp(`(?:^|\\|\\s*)${label}:\\s*([^|]+)`, 'i'));
  return match?.[1]?.trim() || '';
};

const identityKey = (row: Pick<LiveCheckoutRow, 'customerPhone' | 'customerEmail' | 'source' | 'id'>) => {
  const phone = normalizePhone(row.customerPhone);
  const email = normalizeEmail(row.customerEmail);
  return phone ? `phone:${phone}` : email ? `email:${email}` : `${row.source}:${row.id}`;
};

const CheckoutRecoveryPanel: React.FC<CheckoutRecoveryPanelProps> = ({ orders }) => {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['admin-live-checkout-sheet'],
    queryFn: async () => {
      const [draftsResult, checkoutsResult] = await Promise.all([
        supabase.rpc('get_admin_checkout_drafts' as never),
        supabase.rpc('get_admin_checkout_recovery' as never),
      ]);
      if (draftsResult.error) throw draftsResult.error;
      if (checkoutsResult.error) throw checkoutsResult.error;
      return {
        drafts: (draftsResult.data || []) as unknown as CheckoutDraft[],
        checkouts: (checkoutsResult.data || []) as unknown as RecoveryCheckout[],
      };
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const rows = useMemo(() => {
    if (!data) return [];
    const abandonCutoff = Date.now() - 15 * 60 * 1000;
    const completedContacts = orders.map((order) => ({
      createdAt: new Date(order.created_at).getTime(),
      phone: normalizePhone(order.guest_phone || addressValue(order.delivery_address, 'Phone')),
      email: normalizeEmail(order.guest_email || addressValue(order.delivery_address, 'Email')),
    }));

    const candidates: LiveCheckoutRow[] = [
      ...data.drafts
        .filter((draft) => new Date(draft.updated_at).getTime() <= abandonCutoff)
        .map((draft) => ({
          id: draft.id,
          source: 'draft' as const,
          lastActivity: draft.updated_at,
          amount: draft.amount,
          currency: draft.currency,
          customerName: draft.customer_name,
          customerPhone: draft.customer_phone,
          customerEmail: draft.customer_email,
          offerName: draft.offer_name,
          cartItems: draft.cart_items || [],
          resumeToken: draft.resume_token,
          stage: 'Details entered' as const,
          recoveryStatus: 'new' as const,
          recoveryEmailStatus: draft.recovery_email_status,
          recoveryEmailSentAt: draft.recovery_email_sent_at,
          attempts: 1,
        })),
      ...data.checkouts
        .filter((checkout) => checkout.recovery_status !== 'dismissed')
        .map((checkout) => ({
          id: checkout.id,
          source: 'checkout' as const,
          lastActivity: checkout.created_at,
          amount: checkout.amount,
          currency: checkout.currency,
          customerName: checkout.customer_name,
          customerPhone: checkout.customer_phone,
          customerEmail: checkout.customer_email,
          offerName: checkout.offer_name,
          cartItems: checkout.cart_items || [],
          resumeToken: checkout.resume_token,
          stage: checkout.checkout_status === 'failed' ? 'Payment setup failed' as const : 'Payment not completed' as const,
          recoveryStatus: checkout.recovery_status,
          recoveryEmailStatus: checkout.recovery_email_status,
          recoveryEmailSentAt: checkout.recovery_email_sent_at,
          attempts: 1,
        })),
    ].filter((row) => {
      const phone = normalizePhone(row.customerPhone);
      const email = normalizeEmail(row.customerEmail);
      const activity = new Date(row.lastActivity).getTime();
      return !completedContacts.some((order) => order.createdAt >= activity && (
        (phone && order.phone === phone) || (email && order.email === email)
      ));
    }).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

    const uniqueRows = new Map<string, LiveCheckoutRow>();
    for (const row of candidates) {
      const key = identityKey(row);
      const existing = uniqueRows.get(key);
      if (existing) existing.attempts += 1;
      else uniqueRows.set(key, { ...row });
    }
    return Array.from(uniqueRows.values());
  }, [data, orders]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => [
      row.customerName,
      row.customerPhone,
      row.customerEmail,
      row.offerName,
      row.stage,
      ...row.cartItems.map((item) => perfumeNames[item.perfume_id] || 'Perfume'),
    ].some((value) => (value || '').toLowerCase().includes(query)));
  }, [rows, search]);

  const copyResumeLink = async (row: LiveCheckoutRow) => {
    const link = `${window.location.origin}/resume-checkout?source=${row.source}&token=${row.resumeToken}`;
    await navigator.clipboard.writeText(link);
    toast.success('Secure checkout link copied');
  };

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="checkout-recovery-heading">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-amber-700" />
            <h2 id="checkout-recovery-heading" className="font-serif text-xl text-stone-950">Live incomplete-checkout sheet</h2>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-stone-600">
            Refreshes every 30 seconds. It combines saved forms and incomplete payments, groups repeat attempts, and removes customers who later completed an order.
          </p>
          <p className="mt-1 text-xs text-stone-500">For helping with the current checkout only—not a future marketing list.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900">{rows.length} people</span>
          <Button type="button" size="sm" variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />Refresh
          </Button>
        </div>
      </div>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, phone, email, product or stage"
          className="h-11 w-full rounded-lg border border-stone-200 bg-white pl-10 pr-4 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
        />
      </div>

      {isLoading ? (
        <p className="py-8 text-sm text-stone-500">Loading live checkout data…</p>
      ) : isError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">The live checkout sheet could not be loaded.</p>
      ) : filteredRows.length === 0 ? (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">No incomplete checkouts match this view.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-stone-200">
          <table className="min-w-[1120px] w-full border-collapse text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Last activity</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Products</th>
                <th className="px-4 py-3 font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold">Stage</th>
                <th className="px-4 py-3 font-semibold">Recovery</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {filteredRows.map((row) => (
                <tr key={`${row.source}:${row.id}`} className="align-top hover:bg-stone-50/70">
                  <td className="whitespace-nowrap px-4 py-4 text-stone-700">
                    {new Date(row.lastActivity).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })}
                    {row.attempts > 1 && <span className="mt-1 block text-xs font-medium text-amber-700">{row.attempts} attempts</span>}
                  </td>
                  <td className="px-4 py-4 font-medium text-stone-950">{row.customerName || 'Name not provided'}</td>
                  <td className="px-4 py-4 text-stone-700">
                    <span className="block">{row.customerPhone || 'No phone'}</span>
                    {row.customerEmail && <span className="mt-1 block text-xs text-stone-500">{row.customerEmail}</span>}
                  </td>
                  <td className="px-4 py-4 text-stone-700">
                    <span className="font-medium">{row.offerName || 'Website checkout'}</span>
                    <span className="mt-1 block text-xs text-stone-500">{row.cartItems.map((item) => `${perfumeNames[item.perfume_id] || 'Perfume'} × ${item.quantity}`).join(' · ') || 'Items unavailable'}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-stone-950">{row.currency} {Number(row.amount).toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.stage === 'Payment setup failed' ? 'bg-red-50 text-red-700' : row.stage === 'Payment not completed' ? 'bg-amber-100 text-amber-800' : 'bg-sky-50 text-sky-800'}`}>{row.stage}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-stone-600">
                    {row.recoveryEmailStatus === 'sent' ? (
                      <span className="font-medium text-green-700">Email sent{row.recoveryEmailSentAt ? ` ${new Date(row.recoveryEmailSentAt).toLocaleDateString('en-AE')}` : ''}</span>
                    ) : row.recoveryStatus === 'contacted' ? (
                      <span className="font-medium text-green-700">Follow-up recorded</span>
                    ) : (
                      <span>Not contacted</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Button type="button" size="sm" variant="outline" className="whitespace-nowrap" onClick={() => void copyResumeLink(row)}>
                      <Copy className="mr-1.5 h-4 w-4" />Copy checkout link
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-right text-xs text-stone-400">
        {dataUpdatedAt ? `Last updated ${new Date(dataUpdatedAt).toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
      </p>
    </section>
  );
};

export default CheckoutRecoveryPanel;
