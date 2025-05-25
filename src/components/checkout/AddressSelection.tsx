
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AddressSelectionProps {
  userAddress: string;
  onAddressChange: (addressType: 'home', address: string) => void;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({ 
  userAddress, 
  onAddressChange 
}) => {
  const [deliveryAddress, setDeliveryAddress] = useState(userAddress);

  useEffect(() => {
    setDeliveryAddress(userAddress);
  }, [userAddress]);

  useEffect(() => {
    onAddressChange('home', deliveryAddress);
  }, [deliveryAddress, onAddressChange]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryAddress(e.target.value);
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Delivery Address</Label>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label className="font-medium">
            Home Delivery
          </Label>
          <span className="text-sm text-orange-400 font-medium">
            (+AED 4.99)
          </span>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="delivery_address" className="text-sm">Delivery Address</Label>
          <Input 
            id="delivery_address"
            value={deliveryAddress}
            onChange={handleAddressChange}
            className="bg-darker border-gold/30"
            placeholder="Enter your delivery address"
          />
        </div>
        
        {!deliveryAddress && (
          <p className="text-sm text-red-400">
            Please enter a delivery address to continue.
          </p>
        )}
      </div>
    </div>
  );
};

export default AddressSelection;
