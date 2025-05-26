import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Perfume } from '@/types/perfume';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './common/LoadingSpinner';
import ProductImage from './common/ProductImage';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { getPerfumeDisplayName } from '@/utils/constants';
import { usePerfumeImages } from '@/hooks/usePerfumeImages';

interface PerfumeSliderItemProps {
  perfume: Perfume;
  onExplore: (id: string) => void;
}

const PerfumeSliderItem: React.FC<PerfumeSliderItemProps> = ({ perfume, onExplore }) => {
  const { primaryImage } = usePerfumeImages(perfume.id);

  return (
    <div className="bg-black/20 p-4 rounded-lg h-full flex flex-col">
      <div className="h-64 w-full flex items-center justify-center p-2"> 
        <ProductImage 
          src={primaryImage || perfume.image}
          alt={perfume.name}
          fullWidth={true}
          aspectRatio="auto"
          objectFit="contain"
          className="max-h-full"
        />
      </div>
      <div className="flex-1 flex flex-col p-2">
        <h4 className="text-sm uppercase tracking-widest text-gold">{perfume.notes}</h4>
        <h3 className="text-xl font-serif mb-2">{getPerfumeDisplayName(perfume)}</h3>
        <p className="text-white/70 text-sm mb-4 line-clamp-3">{perfume.description}</p>
        <p className="text-gold font-light mb-4 mt-auto">{perfume.price}</p>
        <button 
          onClick={() => onExplore(perfume.id)} 
          className="btn-outline text-center text-xs py-2"
        >
          EXPLORE
        </button>
      </div>
    </div>
  );
};

const PerfumeSlider = () => {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllPerfumes = async () => {
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
          setPerfumes(data);
        }
      } catch (error) {
        console.error('Error fetching perfumes:', error);
        setError('Failed to load perfumes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPerfumes();
  }, []);

  const handleExplore = (id: string) => {
    navigate(`/perfume/${id}`);
  };

  return (
    <section className="section bg-cartier-red py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm uppercase tracking-widest text-gold mb-3">Explore More</h2>
          <h3 className="text-4xl md:text-5xl font-serif mb-4">Our Collection</h3>
          <div className="w-24 h-0.5 bg-gold mx-auto"></div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-white/80">{error}</p>
          </div>
        ) : perfumes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/80">No perfumes found in the collection.</p>
          </div>
        ) : (
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {perfumes.map((perfume) => (
                <CarouselItem key={perfume.id} className="md:basis-1/2 lg:basis-1/3">
                  <PerfumeSliderItem perfume={perfume} onExplore={handleExplore} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default PerfumeSlider;
