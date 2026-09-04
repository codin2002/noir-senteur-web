import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { CheckoutDetails } from '@/utils/checkoutDetails';

type ResumeSource = 'draft' | 'checkout';

const ResumeCheckout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('Preparing your secure checkout…');

  useEffect(() => {
    let active = true;
    const source = searchParams.get('source');
    const token = searchParams.get('token');
    if ((source !== 'draft' && source !== 'checkout') || !token) {
      setMessage('This checkout link is unavailable. Please return to the collection to begin again.');
      return;
    }

    const resume = async () => {
      const { data, error } = await supabase.functions.invoke('resume-checkout', {
        body: { source: source as ResumeSource, token },
      });
      if (!active) return;
      if (error || !data?.success || !Array.isArray(data.cartItems)) {
        setMessage('This checkout link is no longer available. Please return to the collection to begin again.');
        return;
      }

      navigate('/auth', {
        replace: true,
        state: {
          isCheckout: true,
          isResumedCheckout: true,
          cartItems: data.cartItems,
          offerId: data.offerId || undefined,
          resumeDetails: data.details as CheckoutDetails,
          resumeDraftToken: source === 'draft' ? token : null,
          from: location.pathname,
        },
      });
    };

    void resume();
    return () => { active = false; };
  }, [location.pathname, navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dark via-darker to-dark px-6 text-center text-white">
      <div className="max-w-md rounded-2xl border border-gold/20 bg-darker/80 p-8 shadow-2xl">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-gold/25 border-t-gold" />
        <h1 className="font-serif text-3xl text-gold">SENTEUR</h1>
        <p className="mt-4 text-white/70">{message}</p>
      </div>
    </div>
  );
};

export default ResumeCheckout;
