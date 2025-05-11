
import React from 'react';
import { cn } from '@/lib/utils';

interface CartBadgeProps {
  count: number;
  className?: string;
}

const CartBadge: React.FC<CartBadgeProps> = ({ count, className }) => {
  if (count === 0) return null;
  
  return (
    <div className={cn(
      "absolute -top-2 -right-2 h-5 w-5 bg-gold text-darker text-xs rounded-full flex items-center justify-center font-medium",
      className
    )}>
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default CartBadge;
