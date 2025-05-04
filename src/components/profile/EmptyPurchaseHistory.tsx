
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyPurchaseHistory: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12 bg-darker border border-gold/20 rounded-lg">
      <ShoppingBag className="mx-auto h-12 w-12 text-gold mb-4 opacity-50" />
      <h2 className="text-xl mb-2">No purchase history</h2>
      <p className="text-muted-foreground mb-6">You haven't made any purchases yet.</p>
      <Button 
        variant="outline"
        className="border-gold text-gold hover:bg-gold hover:text-darker"
        onClick={() => navigate('/')}
      >
        Browse Collection
      </Button>
    </div>
  );
};

export default EmptyPurchaseHistory;
