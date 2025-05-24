
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  is_active: boolean;
}

interface AddressSelectionProps {
  userAddress: string;
  onAddressChange: (addressType: 'home' | 'pickup', address: string, pickupPointId?: string) => void;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({ 
  userAddress, 
  onAddressChange 
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'pickup'>('home');
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    fetchPickupPoints();
  }, []);

  useEffect(() => {
    if (deliveryMethod === 'home') {
      onAddressChange('home', userAddress);
    } else if (selectedPickupPoint) {
      const selectedPoint = pickupPoints.find(p => p.id === selectedPickupPoint);
      if (selectedPoint) {
        onAddressChange('pickup', `${selectedPoint.name}\n${selectedPoint.address}\n${selectedPoint.city}`, selectedPickupPoint);
      }
    }
  }, [deliveryMethod, selectedPickupPoint, userAddress, pickupPoints, onAddressChange]);

  const fetchPickupPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('pickup_points')
        .select('*')
        .eq('is_active', true)
        .order('city', { ascending: true });

      if (error) throw error;
      setPickupPoints(data || []);
    } catch (error) {
      console.error('Error fetching pickup points:', error);
    }
  };

  const handleDeliveryMethodChange = (value: string) => {
    setDeliveryMethod(value as 'home' | 'pickup');
    if (value === 'pickup') {
      setSelectedPickupPoint('');
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Delivery Address</Label>
      
      <RadioGroup value={deliveryMethod} onValueChange={handleDeliveryMethodChange}>
        <div className="space-y-4">
          {/* Home Delivery Option */}
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="home" id="home_delivery" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="home_delivery" className="cursor-pointer font-medium">
                Home Delivery
              </Label>
              {userAddress && (
                <div className="mt-2 p-3 bg-darker border border-gold/20 rounded-md">
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {userAddress}
                  </p>
                </div>
              )}
              {!userAddress && (
                <p className="mt-1 text-sm text-red-400">
                  No address saved. Please update your profile with a delivery address.
                </p>
              )}
            </div>
          </div>

          {/* Pickup Point Option */}
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="pickup" id="pickup_delivery" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="pickup_delivery" className="cursor-pointer font-medium">
                Pickup Point
              </Label>
              {deliveryMethod === 'pickup' && (
                <div className="mt-2 space-y-2">
                  <Select value={selectedPickupPoint} onValueChange={setSelectedPickupPoint}>
                    <SelectTrigger className="bg-darker border-gold/30">
                      <SelectValue placeholder="Choose a pickup point" />
                    </SelectTrigger>
                    <SelectContent>
                      {pickupPoints.map((point) => (
                        <SelectItem key={point.id} value={point.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{point.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {point.address} - {point.city}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default AddressSelection;
