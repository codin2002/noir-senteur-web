import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Clock3, MessageCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { OFFERS } from '@/utils/constants';

interface RecoveryCheckout {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  checkout_status: 'pending' | 'failed';
  provider_status: string | null;
  recovery_status: 'new' | 'contacted' | 'dismissed';
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  delivery_address: string | null;
  offer_name: string | null;
  reminder_consent: boolean;
  cart_items: Array<{ perfume_id: string; quantity: number; price: number }>;
}

const perfumeNames: Record<string, string> = {
  [OFFERS.SIGNATURE_DUO.PRODUCT_IDS[0]]: '٣١٣',
  [OFFERS.SIGNATURE_DUO.PRODUCT_IDS[1]]: '٤٢٤',
};

const whatsappNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `971${digits.slice(1)}`;
  return digits;
};

const CheckoutRecoveryPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: checkouts = [], isLoading, isError } = useQuery({
    queryKey: ['admin-checkout-recovery'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_checkout_recovery' as never);
      if (error) throw error;
      return (data || []) as unknown as RecoveryCheckout[];
    },
    refetchInterval: 60_000,
  });

  const activeCheckouts = checkouts.filter((checkout) => checkout.recovery_status !== 'dismissed');
  const eligible = activeCheckouts.filter((checkout) => checkout.reminder_consent && checkout.customer_phone && checkout.recovery_status === 'new');

  const setRecoveryStatus = async (id: string, status: RecoveryCheckout['recovery_status']) => {
    const { error } = await supabase.rpc('update_checkout_recovery_status' as never, {
      p_checkout_id: id,
      p_status: status,
    } as never);
    if (error) {
      toast.error('Could not update the checkout follow-up');
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ['admin-checkout-recovery'] });
  };

  const reminderHref = (checkout: RecoveryCheckout) => {
    const name = checkout.customer_name || 'there';
    const message = `Hi ${name}, you started an order with Senteur but payment was not completed. If you would still like it, reply here and we will help you finish.`;
    return `https://wa.me/${whatsappNumber(checkout.customer_phone || '')}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5" aria-labelledby="checkout-recovery-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-amber-700" />
            <h2 id="checkout-recovery-heading" className="font-serif text-xl text-stone-950">Incomplete checkouts</h2>
          </div>
          <p className="mt-1 text-sm text-stone-600">Live payment attempts older than 15 minutes. No reminder is sent automatically.</p>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700 shadow-sm">
          {eligible.length} allowed WhatsApp follow-up{eligible.length === 1 ? '' : 's'}
        </div>
      </div>

      {isLoading ? (
        <p className="py-6 text-sm text-stone-500">Checking recent payment attempts…</p>
      ) : isError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Recovery data is unavailable until the secure database update is installed.</p>
      ) : activeCheckouts.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"><CheckCircle2 className="h-4 w-4" />No incomplete live checkouts need review.</div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {activeCheckouts.slice(0, 12).map((checkout) => {
            const technicalFailure = checkout.checkout_status === 'failed';
            return (
              <article key={checkout.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-950">{checkout.customer_name || 'Name not provided'}</p>
                    <p className="text-sm text-stone-600">{checkout.customer_phone || 'No phone'}{checkout.customer_email ? ` · ${checkout.customer_email}` : ''}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${technicalFailure ? 'bg-red-50 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                    {technicalFailure ? 'Payment setup failed' : 'Payment not completed'}
                  </span>
                </div>
                <div className="mt-3 border-y border-stone-100 py-3 text-sm text-stone-700">
                  <p className="font-medium">{checkout.offer_name || 'Website checkout'} · AED {Number(checkout.amount).toFixed(2)}</p>
                  <p className="mt-1">{(checkout.cart_items || []).map((item) => `${perfumeNames[item.perfume_id] || 'Perfume'} × ${item.quantity}`).join(' · ')}</p>
                  <p className="mt-1 text-xs text-stone-500">{new Date(checkout.created_at).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                {!checkout.reminder_consent && (
                  <p className="mt-3 flex items-start gap-2 text-xs text-stone-500"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />Customer did not opt in to a WhatsApp payment reminder.</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {checkout.reminder_consent && checkout.customer_phone && checkout.recovery_status === 'new' && (
                    <Button asChild size="sm" className="bg-green-700 text-white hover:bg-green-800">
                      <a href={reminderHref(checkout)} target="_blank" rel="noreferrer" onClick={() => void setRecoveryStatus(checkout.id, 'contacted')}>
                        <MessageCircle className="mr-1.5 h-4 w-4" />Open WhatsApp draft
                      </a>
                    </Button>
                  )}
                  {checkout.recovery_status === 'contacted' && <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700"><CheckCircle2 className="h-4 w-4" />Follow-up opened</span>}
                  <Button type="button" size="sm" variant="outline" className="border-stone-200 bg-white text-stone-700 hover:bg-stone-100" onClick={() => void setRecoveryStatus(checkout.id, 'dismissed')}>
                    <X className="mr-1 h-4 w-4" />Dismiss
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CheckoutRecoveryPanel;
