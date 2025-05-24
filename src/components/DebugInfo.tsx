
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DebugInfo = () => {
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [classifications, setClassifications] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);

  useEffect(() => {
    const fetchDebugData = async () => {
      // Fetch all perfumes
      const { data: perfumesData } = await supabase
        .from('perfumes')
        .select('*');
      
      // Fetch all classifications
      const { data: classificationsData } = await supabase
        .from('perfume_classifications')
        .select('*');
        
      // Fetch all ratings
      const { data: ratingsData } = await supabase
        .from('perfume_ratings')
        .select('*');
      
      console.log('All perfumes:', perfumesData);
      console.log('All classifications:', classificationsData);
      console.log('All ratings:', ratingsData);
      
      setPerfumes(perfumesData || []);
      setClassifications(classificationsData || []);
      setRatings(ratingsData || []);
    };

    fetchDebugData();
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-dark border border-gold p-4 text-xs max-w-md z-50">
      <h3 className="text-gold font-bold mb-2">Debug Info</h3>
      <div className="space-y-2">
        <div>
          <strong>Perfumes ({perfumes.length}):</strong>
          {perfumes.map(p => (
            <div key={p.id} className="ml-2">
              {p.id}: {p.name} - {p.notes}
            </div>
          ))}
        </div>
        <div>
          <strong>Classifications ({classifications.length}):</strong>
          {classifications.map(c => (
            <div key={c.id} className="ml-2">
              {c.perfume_id}: Oriental: {c.type_oriental}
            </div>
          ))}
        </div>
        <div>
          <strong>Ratings ({ratings.length}):</strong>
          {ratings.map(r => (
            <div key={r.id} className="ml-2">
              {r.perfume_id}: Scent: {r.scent_rating}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;
