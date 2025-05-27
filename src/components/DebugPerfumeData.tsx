
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

const DebugPerfumeData = () => {
  const { id } = useParams<{ id: string }>();
  const [debugData, setDebugData] = useState<any>(null);

  useEffect(() => {
    const fetchDebugData = async () => {
      console.log('Debug: Fetching data for ID:', id);
      
      // Check if the perfume exists
      const { data: perfumeData, error: perfumeError } = await supabase
        .from('perfumes')
        .select('*')
        .eq('id', id);
      
      // Get all perfumes to see what's available
      const { data: allPerfumes, error: allError } = await supabase
        .from('perfumes')
        .select('id, name')
        .limit(10);
      
      console.log('Debug results:', {
        requestedId: id,
        perfumeData,
        perfumeError,
        allPerfumes,
        allError
      });
      
      setDebugData({
        requestedId: id,
        perfumeData,
        perfumeError,
        allPerfumes,
        allError
      });
    };

    if (id) {
      fetchDebugData();
    }
  }, [id]);

  if (!debugData) return null;

  return (
    <div className="fixed top-0 right-0 bg-black text-white p-4 text-xs max-w-md z-50 overflow-auto max-h-screen">
      <h3 className="text-gold font-bold mb-2">Debug Info</h3>
      <div className="space-y-2">
        <div>
          <strong>Requested ID:</strong> {debugData.requestedId}
        </div>
        <div>
          <strong>Perfume Found:</strong> {debugData.perfumeData?.length > 0 ? 'Yes' : 'No'}
        </div>
        {debugData.perfumeError && (
          <div>
            <strong>Perfume Error:</strong> {debugData.perfumeError.message}
          </div>
        )}
        <div>
          <strong>Available Perfumes:</strong>
          {debugData.allPerfumes?.map((p: any) => (
            <div key={p.id} className="ml-2">
              {p.id}: {p.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugPerfumeData;
