import React, { useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmbeddedCheckoutSession {
  embeddedUrl: string;
  paymentUrl: string;
  paymentIntentId: string;
  checkoutToken: string;
}

const readSession = (): EmbeddedCheckoutSession | null => {
  try {
    const value = JSON.parse(sessionStorage.getItem('ziina_embedded_checkout') || 'null');
    return value?.embeddedUrl && value?.paymentIntentId && value?.checkoutToken ? value : null;
  } catch {
    return null;
  }
};

const SecurePayment: React.FC = () => {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const session = useMemo(readSession, []);

  const iframeUrl = useMemo(() => {
    if (!session) return '';
    const url = new URL(session.embeddedUrl);
    url.searchParams.set('version', 'v1');
    return url.toString();
  }, [session]);

  useEffect(() => {
    document.title = 'Secure Payment | Senteur Fragrances';
    if (!session) return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://pay.ziina.com' || event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type !== 'ZIINA_PAYMENT_STATUS_CHANGE') return;

      if (event.data?.data?.status === 'COMPLETED') {
        sessionStorage.removeItem('ziina_embedded_checkout');
        navigate(`/payment-success?payment_intent_id=${encodeURIComponent(session.paymentIntentId)}&checkout_token=${encodeURIComponent(session.checkoutToken)}`);
      } else if (event.data?.data?.status === 'FAILED') {
        sessionStorage.removeItem('ziina_embedded_checkout');
        navigate('/payment-failed');
      } else if (event.data?.data?.status === 'CANCELED') {
        sessionStorage.removeItem('ziina_embedded_checkout');
        navigate('/cart?payment=cancelled');
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [navigate, session]);

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-dark px-5 text-white">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-3xl">Payment session not found</h1>
          <p className="mt-3 text-white/60">Return to your cart to begin a new secure checkout.</p>
          <Button asChild className="mt-6 bg-gold text-dark hover:bg-gold/90"><Link to="/cart"><ArrowLeft className="mr-2 h-4 w-4" />Return to cart</Link></Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark px-3 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-[520px]">
        <div className="mb-4 text-center">
          <p className="font-serif text-3xl tracking-[0.14em]">SENTEUR</p>
          <p className="mt-2 flex items-center justify-center gap-2 text-sm text-green-200"><ShieldCheck className="h-4 w-4" />Secure payment powered by Ziina</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-gold/20 bg-white shadow-2xl">
          <iframe
            ref={iframeRef}
            title="Secure Ziina payment"
            src={iframeUrl}
            className="h-[820px] w-full"
            frameBorder="0"
            allow="payment"
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-white/50">
          <Link to="/cart?payment=cancelled" className="inline-flex items-center hover:text-gold"><ArrowLeft className="mr-1 h-3.5 w-3.5" />Return to cart</Link>
          {session.paymentUrl && <a href={session.paymentUrl} className="inline-flex items-center hover:text-gold">Open payment page instead<ExternalLink className="ml-1 h-3.5 w-3.5" /></a>}
        </div>
      </div>
    </main>
  );
};

export default SecurePayment;
