
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EmptyWishlist: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <Heart className="mx-auto h-12 w-12 text-gold mb-4 opacity-50" />
      <h2 className="text-xl mb-2">Your wishlist is empty</h2>
      <p className="text-muted-foreground mb-6">Add items to your wishlist to keep track of fragrances you love.</p>
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

export default EmptyWishlist;
