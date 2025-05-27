
import React from 'react';

interface Perfume {
  id: string;
  name: string;
  description: string;
  price: string;
  price_value: number;
  image: string;
  notes: string;
}

interface PerfumeInfoProps {
  perfume: Perfume;
}

const PerfumeInfo: React.FC<PerfumeInfoProps> = ({ perfume }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif mb-4">{perfume.name}</h1>
        <div className="text-2xl font-bold text-gold mb-6">{perfume.price}</div>
        <p className="text-gray-300 leading-relaxed mb-6">{perfume.description}</p>
        
        {perfume.notes && (
          <div className="border-t border-gold/30 pt-6">
            <h3 className="font-semibold mb-3 text-gold">Notes</h3>
            <p className="text-gray-300">{perfume.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfumeInfo;
