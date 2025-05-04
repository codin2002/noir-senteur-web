
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartEmptyProps {
  isAuthenticated: boolean;
}

const CartEmpty: React.FC<CartEmptyProps> = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl mb-4">Please sign in to view your cart</h2>
        <Button 
          variant="outline"
          className="border-gold text-gold hover:bg-gold hover:text-darker"
          onClick={() => window.location.href = '/auth'}
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <ShoppingCart className="mx-auto h-12 w-12 text-gold mb-4 opacity-50" />
      <h2 className="text-xl mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-6">Add items to your cart to proceed to checkout.</p>
      <Button 
        variant="outline"
        className="border-gold text-gold hover:bg-gold hover:text-darker"
        onClick={() => window.location.href = '/'}
      >
        Browse Collection
      </Button>
    </div>
  );
};

export default CartEmpty;
