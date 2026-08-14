import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, Search, Truck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

type TrackingResult = {
  order_reference: string;
  fulfillment_status: 'new' | 'packed' | 'shipped' | 'delivered';
  placed_at: string;
};

const stages = [
  { id: 'new', label: 'Order confirmed', detail: 'Your order has been received.' },
  { id: 'packed', label: 'Packed', detail: 'Your fragrances are being prepared.' },
  { id: 'shipped', label: 'Shipped', detail: 'Your order is on its way.' },
  { id: 'delivered', label: 'Delivered', detail: 'Your order has been delivered.' },
] as const;

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get('ref')?.toUpperCase() ?? '');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const trackOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('track-order', { body: { reference, phone } });
      if (error) throw error;
      if (!data?.found || !data.tracking) {
        setMessage('We could not find an order with those details. Please check the reference and mobile number.');
        return;
      }
      setResult(data.tracking as TrackingResult);
    } catch {
      setMessage('We could not check this order right now. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentStage = result ? stages.findIndex((stage) => stage.id === result.fulfillment_status) : -1;

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 pb-16 pt-28">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <Package className="mx-auto mb-4 h-10 w-10 text-gold" />
            <h1 className="font-serif text-4xl">Track your order</h1>
            <p className="mt-3 text-muted-foreground">Enter your order reference and the mobile number used at checkout.</p>
          </div>

          <form onSubmit={trackOrder} className="mt-8 space-y-5 rounded-xl border border-gold/25 bg-darker p-6">
            <div>
              <label htmlFor="reference" className="mb-2 block text-sm font-medium">Order reference</label>
              <Input id="reference" value={reference} onChange={(event) => setReference(event.target.value.toUpperCase())} placeholder="SEN-1234ABCD" autoCapitalize="characters" required className="border-gold/30 bg-dark text-white" />
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">Mobile number used at checkout</label>
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="050 123 4567" inputMode="tel" required className="border-gold/30 bg-dark text-white" />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-gold text-darker hover:bg-gold/90">
              <Search className="mr-2 h-4 w-4" />{isLoading ? 'Checking order…' : 'Track order'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">For privacy, both details are required. We never show your address or payment information here.</p>
          </form>

          {message && <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-200">{message}</p>}

          {result && (
            <section className="mt-8 rounded-xl border border-gold/25 bg-darker p-6">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">Order reference</p>
                  <p className="mt-1 font-semibold tracking-wide">{result.order_reference}</p>
                </div>
                <p className="text-right text-sm text-muted-foreground">Placed {new Date(result.placed_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <ol className="mt-6 space-y-5">
                {stages.map((stage, index) => {
                  const complete = index <= currentStage;
                  const current = index === currentStage;
                  return <li key={stage.id} className="flex gap-4">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${complete ? 'bg-gold text-darker' : 'border border-white/25 text-muted-foreground'}`}>
                      {complete ? <CheckCircle2 className="h-4 w-4" /> : index === 2 ? <Truck className="h-4 w-4" /> : <span className="text-xs">{index + 1}</span>}
                    </div>
                    <div>
                      <p className={current ? 'font-semibold text-gold' : complete ? 'font-medium text-white' : 'text-muted-foreground'}>{stage.label}</p>
                      {current && <p className="mt-1 text-sm text-muted-foreground">{stage.detail}</p>}
                    </div>
                  </li>;
                })}
              </ol>
            </section>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">Need help? <Link to="/contact-us" className="text-gold underline underline-offset-4">Contact Senteur</Link></p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;
