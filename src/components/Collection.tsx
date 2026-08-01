
import React, { useState, useEffect } from 'react';
import PerfumeCard from './PerfumeCard';
import SignatureDuoCard from './SignatureDuoCard';
import { supabase } from '@/integrations/supabase/client';
import { Perfume } from '@/types/perfume';
import LoadingSpinner from './common/LoadingSpinner';
import { OFFERS } from '@/utils/constants';

const Collection = () => {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('perfumes')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        if (data) {
          const { data: inv } = await supabase.from('inventory').select('perfume_id, stock_quantity');
          const stockMap = new Map((inv || []).map((i: any) => [i.perfume_id, i.stock_quantity]));
          const merged = data.map((p: any) => ({ ...p, stock_quantity: stockMap.get(p.id) ?? 0 }));
          console.log("Fetched perfumes:", merged);
          setPerfumes(merged as any);
        }
      } catch (error) {
        console.error('Error fetching perfumes:', error);
        setError('Failed to load perfumes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerfumes();
  }, []);

  // Display the two individual fragrances plus their bundle offer.
  const featuredPerfumes = perfumes.slice(0, 2);
  const duoProducts = OFFERS.SIGNATURE_DUO.PRODUCT_IDS
    .map((id) => perfumes.find((perfume) => perfume.id === id))
    .filter(Boolean) as Perfume[];

  return (
    <section id="collection" className="section bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">CYPHER COLLECTION</h2>
          <div className="w-24 h-0.5 bg-gold mx-auto"></div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-white/80">{error}</p>
          </div>
        ) : featuredPerfumes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/80">No perfumes found in the collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {featuredPerfumes.map((perfume, index) => (
              <PerfumeCard
                key={perfume.id}
                id={perfume.id}
                name={perfume.name}
                notes={perfume.notes}
                description={perfume.description}
                image={perfume.image}
                price={perfume.price}
                stockQuantity={(perfume as any).stock_quantity}
                productType={(perfume as any).product_type}
                preorderEnabled={(perfume as any).preorder_enabled}
                delay={index * 200}
              />
            ))}
            {duoProducts.length === 2 && <SignatureDuoCard products={duoProducts} />}
          </div>
        )}
      </div>
    </section>
  );
};

export default Collection;
