
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface AddressSelectionProps {
  onAddressChange: (address: string) => void;
  selectedAddress: string;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({ 
  onAddressChange, 
  selectedAddress 
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'home'>('home');
  const [pickupPoints] = useState([
    { id: '1', name: 'Dubai Mall', address: 'Ground Floor, Dubai Mall, Downtown Dubai' },
    { id: '2', name: 'Mall of the Emirates', address: 'Level 1, Mall of the Emirates, Al Barsha' },
    { id: '3', name: 'City Centre Deira', address: 'Ground Floor, City Centre Deira, Port Saeed' }
  ]);
  const [selectedPickup, setSelectedPickup] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const { user } = useAuth();

  // Load user's saved address on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      setIsLoadingProfile(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('address')
          .eq('id', user.id)
          .single();

        if (!error && profile?.address) {
          setHomeAddress(profile.address);
          if (deliveryMethod === 'home') {
            onAddressChange(profile.address);
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Update selected address when delivery method or selections change
  useEffect(() => {
    if (deliveryMethod === 'pickup' && selectedPickup) {
      const pickup = pickupPoints.find(p => p.id === selectedPickup);
      if (pickup) {
        onAddressChange(`Pickup: ${pickup.name} - ${pickup.address}`);
      }
    } else if (deliveryMethod === 'home' && homeAddress.trim()) {
      onAddressChange(homeAddress.trim());
    }
  }, [deliveryMethod, selectedPickup, homeAddress, onAddressChange, pickupPoints]);

  const handleDeliveryMethodChange = (method: 'pickup' | 'home') => {
    setDeliveryMethod(method);
    
    if (method === 'pickup') {
      if (selectedPickup) {
        const pickup = pickupPoints.find(p => p.id === selectedPickup);
        if (pickup) {
          onAddressChange(`Pickup: ${pickup.name} - ${pickup.address}`);
        }
      } else {
        onAddressChange('');
      }
    } else {
      onAddressChange(homeAddress.trim());
    }
  };

  const handlePickupChange = (pickupId: string) => {
    setSelectedPickup(pickupId);
    const pickup = pickupPoints.find(p => p.id === pickupId);
    if (pickup) {
      onAddressChange(`Pickup: ${pickup.name} - ${pickup.address}`);
    }
  };

  const handleHomeAddressChange = (address: string) => {
    setHomeAddress(address);
    if (deliveryMethod === 'home') {
      onAddressChange(address.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-serif mb-4">Delivery Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant={deliveryMethod === 'pickup' ? 'default' : 'outline'}
            className={`h-auto p-4 flex flex-col items-center space-y-2 ${
              deliveryMethod === 'pickup' 
                ? 'bg-gold text-darker hover:bg-gold/80' 
                : 'border-gold/30 hover:bg-gold/10'
            }`}
            onClick={() => handleDeliveryMethodChange('pickup')}
          >
            <MapPin className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Pickup Point</div>
              <div className="text-sm opacity-80">Free pickup from selected locations</div>
            </div>
          </Button>

          <Button
            variant={deliveryMethod === 'home' ? 'default' : 'outline'}
            className={`h-auto p-4 flex flex-col items-center space-y-2 ${
              deliveryMethod === 'home' 
                ? 'bg-gold text-darker hover:bg-gold/80' 
                : 'border-gold/30 hover:bg-gold/10'
            }`}
            onClick={() => handleDeliveryMethodChange('home')}
          >
            <Home className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Home Delivery</div>
              <div className="text-sm opacity-80">AED 1 delivery fee</div>
            </div>
          </Button>
        </div>
      </div>

      {deliveryMethod === 'pickup' && (
        <div>
          <Label className="text-base mb-3 block">Select Pickup Point</Label>
          <div className="space-y-3">
            {pickupPoints.map((point) => (
              <div
                key={point.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPickup === point.id
                    ? 'border-gold bg-gold/10'
                    : 'border-gold/20 hover:border-gold/40'
                }`}
                onClick={() => handlePickupChange(point.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                    selectedPickup === point.id 
                      ? 'bg-gold border-gold' 
                      : 'border-gold/40'
                  }`} />
                  <div>
                    <h4 className="font-medium">{point.name}</h4>
                    <p className="text-sm text-muted-foreground">{point.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deliveryMethod === 'home' && (
        <div>
          <Label htmlFor="address" className="text-base mb-3 block">
            Delivery Address
          </Label>
          {isLoadingProfile ? (
            <div className="text-sm text-muted-foreground">Loading saved address...</div>
          ) : (
            <Textarea
              id="address"
              placeholder="Enter your complete delivery address including building, street, area, and emirate"
              value={homeAddress}
              onChange={(e) => handleHomeAddressChange(e.target.value)}
              className="min-h-[100px] border-gold/30 focus:border-gold"
              required
            />
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Please provide a complete address including building number, street name, area, and emirate for accurate delivery.
          </p>
        </div>
      )}

      {selectedAddress && (
        <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
          <h4 className="font-medium mb-2">Selected Address:</h4>
          <p className="text-sm">{selectedAddress}</p>
        </div>
      )}
    </div>
  );
};

export default AddressSelection;
