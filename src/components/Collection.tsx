import React, { useState, useEffect } from 'react';
import PerfumeCard from './PerfumeCard';
import { supabase } from '@/integrations/supabase/client';
import { Perfume } from '@/types/perfume';
import { Loader } from 'lucide-react';
import LoadingSpinner from './common/LoadingSpinner';

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
          console.log("Fetched perfumes:", data);
          setPerfumes(data);
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

  // Display only the first 3 perfumes in the main section
  const featuredPerfumes = perfumes.slice(0, 3);

  return (
    <section id="collection" className="section bg-cartier-red">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">Our Collection</h2>
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
          <div className="space-y-24">
            {featuredPerfumes.map((perfume, index) => (
              <PerfumeCard
                key={perfume.id}
                id={perfume.id}
                name={perfume.name}
                notes={perfume.notes}
                description={perfume.description}
                image={perfume.image}
                price={perfume.price}
                invert={index % 2 !== 0}
                delay={index * 200}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Collection;
