import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Perfume } from '@/types/perfume';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const PerfumeTable = () => {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchPerfumes();
  }, []);

  const fetchPerfumes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('perfumes')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      if (data) {
        setPerfumes(data);
      }
    } catch (error) {
      console.error('Error fetching perfumes:', error);
      toast.error('Failed to load perfumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this perfume?')) {
      try {
        setIsDeleting(id);
        
        // Get the perfume to get the image URL
        const { data: perfume } = await supabase
          .from('perfumes')
          .select('image')
          .eq('id', id)
          .single();
        
        if (perfume?.image) {
          // Extract file path from URL
          const imageUrl = perfume.image;
          const urlParts = imageUrl.split('/');
          const filePath = urlParts.slice(urlParts.indexOf('perfumes')).join('/');
          
          // Delete the image from storage
          await supabase.storage
            .from('perfumes')
            .remove([filePath]);
        }
        
        // Delete the perfume from the database
        const { error } = await supabase
          .from('perfumes')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        toast.success('Perfume deleted successfully');
        fetchPerfumes();
      } catch (error) {
        console.error('Error deleting perfume:', error);
        toast.error('Error deleting perfume');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (perfumes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">No perfumes found in the collection.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gold/20">
            <th className="py-4 px-2 text-left font-normal text-sm uppercase tracking-wider">Image</th>
            <th className="py-4 px-4 text-left font-normal text-sm uppercase tracking-wider">Name</th>
            <th className="py-4 px-4 text-left font-normal text-sm uppercase tracking-wider hidden md:table-cell">Notes</th>
            <th className="py-4 px-4 text-left font-normal text-sm uppercase tracking-wider">Price</th>
            <th className="py-4 px-4 text-right font-normal text-sm uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gold/10">
          {perfumes.map((perfume) => (
            <tr key={perfume.id} className="hover:bg-darker/30">
              <td className="py-3 px-2">
                <img 
                  src={perfume.image} 
                  alt={perfume.name} 
                  className="w-14 h-14 object-cover rounded"
                />
              </td>
              <td className="py-3 px-4 font-medium">{perfume.name}</td>
              <td className="py-3 px-4 hidden md:table-cell text-white/70">{perfume.notes}</td>
              <td className="py-3 px-4">{perfume.price}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-gold/30 hover:bg-gold/10"
                    onClick={() => toast.info("Edit functionality coming soon")}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-red-300/30 hover:bg-red-900/20 hover:border-red-300/50"
                    onClick={() => handleDelete(perfume.id)}
                    disabled={isDeleting === perfume.id}
                  >
                    {isDeleting === perfume.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PerfumeTable;
