
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  is_active: boolean;
}

interface AccountFormProps {
  formData: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
  };
  handleChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSignOut: () => Promise<void>;
  updateProfile: () => Promise<void>;
}

const AccountForm: React.FC<AccountFormProps> = ({ 
  formData, 
  handleChange, 
  handleSignOut, 
  updateProfile 
}) => {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'pickup'>('home');

  useEffect(() => {
    fetchPickupPoints();
  }, []);

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

  // Parse existing address into components
  const parseAddress = (address: string) => {
    const lines = address.split('\n');
    return {
      buildingName: lines[0] || '',
      floorNumber: lines[1] || '',
      roomNumber: lines[2] || '',
      area: lines[3] || '',
      landmark: lines[4] || '',
      emirate: lines[5] || ''
    };
  };

  const addressComponents = parseAddress(formData.address);

  const handleAddressChange = (component: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newComponents = { ...addressComponents, [component]: e.target.value };
    const formattedAddress = [
      newComponents.buildingName,
      newComponents.floorNumber,
      newComponents.roomNumber,
      newComponents.area,
      newComponents.landmark,
      newComponents.emirate
    ].filter(Boolean).join('\n');
    
    handleChange('address')({ target: { value: formattedAddress } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="bg-darker border border-gold/20 rounded-lg p-6">
      <div className="max-w-xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input 
              id="full_name"
              value={formData.full_name}
              onChange={handleChange('full_name')}
              className="bg-darker border-gold/30"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              value={formData.email}
              disabled
              className="bg-darker border-gold/30 text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone"
              value={formData.phone}
              onChange={handleChange('phone')}
              className="bg-darker border-gold/30"
              placeholder="+971 50 XXX XXXX"
            />
          </div>

          {/* Delivery Method Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Delivery Method</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="home_delivery"
                  name="delivery_method"
                  value="home"
                  checked={deliveryMethod === 'home'}
                  onChange={(e) => setDeliveryMethod(e.target.value as 'home' | 'pickup')}
                  className="text-gold focus:ring-gold"
                />
                <Label htmlFor="home_delivery" className="cursor-pointer">Home Delivery</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="pickup_delivery"
                  name="delivery_method"
                  value="pickup"
                  checked={deliveryMethod === 'pickup'}
                  onChange={(e) => setDeliveryMethod(e.target.value as 'home' | 'pickup')}
                  className="text-gold focus:ring-gold"
                />
                <Label htmlFor="pickup_delivery" className="cursor-pointer">Pickup Point</Label>
              </div>
            </div>
          </div>

          {/* Pickup Point Selection */}
          {deliveryMethod === 'pickup' && (
            <div className="space-y-2">
              <Label htmlFor="pickup_point">Select Pickup Point</Label>
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

          {/* Home Delivery Address */}
          {deliveryMethod === 'home' && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Delivery Address</Label>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="building_name" className="text-sm">Building Name</Label>
                  <Input 
                    id="building_name"
                    value={addressComponents.buildingName}
                    onChange={handleAddressChange('buildingName')}
                    className="bg-darker border-gold/30"
                    placeholder="Enter building name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="floor_number" className="text-sm">Floor Number</Label>
                  <Input 
                    id="floor_number"
                    value={addressComponents.floorNumber}
                    onChange={handleAddressChange('floorNumber')}
                    className="bg-darker border-gold/30"
                    placeholder="e.g., Ground Floor, 1st Floor"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="room_number" className="text-sm">Room/Office Number</Label>
                  <Input 
                    id="room_number"
                    value={addressComponents.roomNumber}
                    onChange={handleAddressChange('roomNumber')}
                    className="bg-darker border-gold/30"
                    placeholder="e.g., Apt 101, Office 205"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="area" className="text-sm">Area/Locality</Label>
                  <Input 
                    id="area"
                    value={addressComponents.area}
                    onChange={handleAddressChange('area')}
                    className="bg-darker border-gold/30"
                    placeholder="e.g., Downtown, Marina, Jumeirah"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="landmark" className="text-sm">Landmark (Optional)</Label>
                  <Input 
                    id="landmark"
                    value={addressComponents.landmark}
                    onChange={handleAddressChange('landmark')}
                    className="bg-darker border-gold/30"
                    placeholder="e.g., Near Mall, Behind Metro Station"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emirate" className="text-sm">Emirate</Label>
                  <Input 
                    id="emirate"
                    value={addressComponents.emirate}
                    onChange={handleAddressChange('emirate')}
                    className="bg-darker border-gold/30"
                    placeholder="e.g., Dubai, Abu Dhabi, Sharjah"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-between">
            <Button 
              variant="outline" 
              className="border-red-500/50 hover:bg-red-500/10 text-red-400"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
            
            <Button 
              className="bg-gold text-darker hover:bg-gold/80"
              onClick={updateProfile}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountForm;
