
import React from 'react';
import { Home } from 'lucide-react';

const DeliveryHeader: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-serif mb-4">Delivery Information</h3>
      <div className="flex items-center justify-center p-4 border border-gold/30 rounded-lg bg-gold/10">
        <Home className="h-6 w-6 text-gold mr-3" />
        <div className="text-center">
          <div className="font-medium text-gold">Home Delivery</div>
          <div className="text-sm opacity-80">AED 1 delivery fee</div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryHeader;
