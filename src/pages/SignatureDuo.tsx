import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import PerfumeClassification from '@/components/perfume/PerfumeClassification';
import { supabase } from '@/integrations/supabase/client';
import { OFFERS, getPerfumeDisplayName } from '@/utils/constants';
import { fbqViewBundle } from '@/utils/metaPixel';
import { PerfumeClassificationData } from '@/types/perfumeDetail';
import { useAuth } from '@/context/AuthContext';
import { useCartCount } from '@/hooks/useCartCount';
import { toast } from 'sonner';

interface BundleProduct {
  id: string;
  name: string;
  notes: string;
  description: string;
  image: string;
  price: string;
  price_value: number;
}

const DUO_SCENT_DESCRIPTIONS: Record<string, string> = {
  '890882bb-0dba-4712-a5a9-380cf9e7ff58': 'starts off with a gently warm, spicy nutmeg opening. A fresh violet heart carries the scent into a rich base of amber, oud, and cashmere.',
  '37b4d1ef-6589-4852-a74d-c4a10bc04302': 'opens with a sweet blend of cotton candy and raspberry, creating an irresistible first impression. As it settles, a soft floral heart adds elegance, before revealing its signature base of musk, leather, and patchouli, leaving behind a warm & sensual trail.',
};

const SignatureDuo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh: refreshCartCount } = useCartCount(user?.id);
  const [products, setProducts] = useState<BundleProduct[]>([]);
  const [classificationById, setClassificationById] = useState<Record<string, PerfumeClassificationData | null>>({});
  const [loading, setLoading] = useState(true);
  const [isLoadingClassification, setIsLoadingClassification] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = '313 + 424 Signature Duo | Senteur Fragrances';
    const description = 'Senteur 313 and 424 together for AED 220. Two full-size 100 ml fragrances with free UAE delivery.';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, []);

  useEffect(() => {
    const loadDuo = async () => {
      setLoading(true);
      setIsLoadingClassification(true);
      setError(false);

      const productResult = await supabase
        .from('perfumes')
        .select('id,name,notes,description,image,price,price_value')
        .in('id', [...OFFERS.SIGNATURE_DUO.PRODUCT_IDS]);

      if (productResult.error || !productResult.data || productResult.data.length !== OFFERS.SIGNATURE_DUO.PRODUCT_IDS.length) {
        setError(true);
        setLoading(false);
        setIsLoadingClassification(false);
        return;
      }

      const orderedProducts = OFFERS.SIGNATURE_DUO.PRODUCT_IDS
        .map((id) => productResult.data.find((product) => product.id === id))
        .filter(Boolean) as BundleProduct[];

      setProducts(orderedProducts);
      setLoading(false);
      fbqViewBundle({
        id: OFFERS.SIGNATURE_DUO.ID,
        name: OFFERS.SIGNATURE_DUO.NAME,
        price: OFFERS.SIGNATURE_DUO.PRICE,
        productIds: OFFERS.SIGNATURE_DUO.PRODUCT_IDS,
      });

      const classificationResult = await supabase
        .from('perfume_classifications')
        .select('*')
        .in('perfume_id', [...OFFERS.SIGNATURE_DUO.PRODUCT_IDS]);

      setClassificationById((classificationResult.data || []).reduce<Record<string, PerfumeClassificationData | null>>(
        (profiles, profile) => ({ ...profiles, [profile.perfume_id]: profile as PerfumeClassificationData }),
        {},
      ));
      setIsLoadingClassification(false);
    };

    loadDuo();
  }, []);

  const checkoutItems = useMemo(() => products.map((perfume) => ({
    id: `offer-${OFFERS.SIGNATURE_DUO.ID}-${perfume.id}`,
    quantity: 1,
    perfume,
  })), [products]);

  const buyNow = () => {
    if (checkoutItems.length !== 2) return;
    navigate('/auth', {
      state: {
        isCheckout: true,
        cartItems: checkoutItems,
        offerId: OFFERS.SIGNATURE_DUO.ID,
        preserveCart: true,
        from: '/offers/signature-duo',
      },
    });
  };

  const addToCart = async () => {
    if (checkoutItems.length !== 2) return;

    try {
      if (user) {
        for (const item of checkoutItems) {
          const { data: existing, error: lookupError } = await supabase
            .from('cart')
            .select('id, quantity')
            .eq('user_id', user.id)
            .eq('perfume_id', item.perfume.id)
            .maybeSingle();
          if (lookupError) throw lookupError;

          const { error } = existing
            ? await supabase.from('cart').update({ quantity: existing.quantity + 1 }).eq('id', existing.id)
            : await supabase.from('cart').insert({ user_id: user.id, perfume_id: item.perfume.id, quantity: 1 });
          if (error) throw error;
        }
      } else {
        const storedItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        for (const item of checkoutItems) {
          const existing = storedItems.find((stored: any) => stored.perfume?.id === item.perfume.id);
          if (existing) existing.quantity += 1;
          else storedItems.push({ id: `duo-${Date.now()}-${item.perfume.id}`, quantity: 1, perfume: item.perfume });
        }
        localStorage.setItem('cartItems', JSON.stringify(storedItems));
      }
      window.dispatchEvent(new Event('cartUpdated'));
      refreshCartCount();
      toast.success('313 + 424 added to your cart', { description: 'The Signature Duo price is AED 220.' });
    } catch (error: any) {
      toast.error('Could not add the Signature Duo to your cart', { description: error.message });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-2 border-gold/20 border-t-gold" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />
        <div className="flex-1 px-6 pt-24 flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-serif mb-4">Signature Duo Not Found</h1>
          <p className="text-gray-400 mb-4">This offer is temporarily unavailable. Please try again shortly.</p>
          <Button onClick={() => navigate('/')} className="bg-gold text-darker hover:bg-gold/80"><ArrowLeft className="mr-2 h-4 w-4" />Go Back</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 text-gold hover:text-gold/80 hover:bg-gold/10">
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Collection
        </Button>

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="flex items-center justify-center h-[500px] lg:h-[700px] p-4">
              <img
                src="/images/signature-duo-together.png"
                alt="Senteur 313 and 424 Signature Duo"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif mb-4 flex items-center gap-3" dir="ltr" aria-label="313 plus 424">
                  <span>٣١٣</span><span className="text-gold">+</span><span>٤٢٤</span>
                </h1>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-400">Signature Duo · 2 × 100 ml</p>
                <div className="flex items-baseline gap-3 text-2xl font-bold text-gold mb-6">
                  <span>AED {OFFERS.SIGNATURE_DUO.PRICE}</span>
                  <span className="text-sm font-normal text-white/40 line-through">AED {OFFERS.SIGNATURE_DUO.REGULAR_PRICE}</span>
                </div>
                <p className="hidden">
                  A complete Senteur pairing: one bottle of ٣١٣ and one bottle of ٤٢٤, each full-size and ready to wear separately.
                </p>

                <div className="border-t border-gold/30 pt-6 space-y-5">
                  <h2 className="font-semibold text-gold">Notes</h2>
                  {products.map((product) => (
                    <div key={product.id} className="grid grid-cols-[4.5rem_1fr] gap-3">
                      <span className="font-serif text-xl text-white">{getPerfumeDisplayName(product)}</span>
                      <div>
                        <p className="text-gray-300">{product.notes}</p>
                        {DUO_SCENT_DESCRIPTIONS[product.id] && (
                          <p className="mt-2 text-sm leading-relaxed text-white/60">
                            {DUO_SCENT_DESCRIPTIONS[product.id]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Button onClick={addToCart} className="w-full bg-gold text-darker hover:bg-gold/80 text-lg py-6">
                  <ShoppingCart className="h-5 w-5 mr-2" />Add the Signature Duo to Cart
                </Button>
                <Button onClick={buyNow} variant="outline" className="w-full border-gold/50 text-gold hover:bg-gold/10">
                  Buy now AED {OFFERS.SIGNATURE_DUO.PRICE.toFixed(2)}
                </Button>
                <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-gold" />Free UAE delivery and secure payment</p>
              </div>
            </div>
          </div>

          <div className="mt-16 border-t border-gold/30 pt-12">
            <div className="mb-8">
              <h2 className="text-2xl font-serif">Fragrance Profile</h2>
              <p className="mt-2 text-sm text-white/60">See how each fragrance in the duo wears.</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              {products.map((product) => (
                <div key={product.id}>
                  <h3 className="mb-4 font-serif text-2xl">{getPerfumeDisplayName(product)}</h3>
                  <PerfumeClassification
                    classificationData={classificationById[product.id] || null}
                    isLoading={isLoadingClassification}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignatureDuo;
