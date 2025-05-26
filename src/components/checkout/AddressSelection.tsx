
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressComponents, setAddressComponents] = useState({
    buildingName: '',
    floorNumber: '',
    roomNumber: '',
    area: '',
    landmark: '',
    emirate: ''
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const { user } = useAuth();

  // Load user's saved address and phone on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      setIsLoadingProfile(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('address, phone')
          .eq('id', user.id)
          .single();

        if (!error && profile) {
          if (profile.phone) {
            setPhoneNumber(profile.phone);
          }
          
          if (profile.address) {
            const lines = profile.address.split('\n');
            const components = {
              buildingName: lines[0] || '',
              floorNumber: lines[1] || '',
              roomNumber: lines[2] || '',
              area: lines[3] || '',
              landmark: lines[4] || '',
              emirate: lines[5] || ''
            };
            setAddressComponents(components);
            
            if (deliveryMethod === 'home') {
              updateSelectedAddress(components, profile.phone || phoneNumber);
            }
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

  const updateSelectedAddress = (components: typeof addressComponents, phone: string) => {
    const addressParts = [
      components.buildingName,
      components.floorNumber,
      components.roomNumber,
      components.area,
      components.landmark,
      components.emirate
    ].filter(Boolean);
    
    const fullAddress = addressParts.join(', ');
    const addressWithPhone = phone ? `${fullAddress} | Phone: ${phone}` : fullAddress;
    onAddressChange(addressWithPhone);
  };

  // Update selected address when delivery method or selections change
  useEffect(() => {
    if (deliveryMethod === 'pickup' && selectedPickup) {
      const pickup = pickupPoints.find(p => p.id === selectedPickup);
      if (pickup) {
        const addressWithPhone = phoneNumber ? 
          `Pickup: ${pickup.name} - ${pickup.address} | Phone: ${phoneNumber}` :
          `Pickup: ${pickup.name} - ${pickup.address}`;
        onAddressChange(addressWithPhone);
      }
    } else if (deliveryMethod === 'home') {
      updateSelectedAddress(addressComponents, phoneNumber);
    }
  }, [deliveryMethod, selectedPickup, addressComponents, phoneNumber, onAddressChange, pickupPoints]);

  const handleDeliveryMethodChange = (method: 'pickup' | 'home') => {
    setDeliveryMethod(method);
  };

  const handlePickupChange = (pickupId: string) => {
    setSelectedPickup(pickupId);
  };

  const handleAddressComponentChange = (component: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newComponents = { ...addressComponents, [component]: e.target.value };
    setAddressComponents(newComponents);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
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

      {/* Phone Number - Always visible */}
      <div>
        <Label htmlFor="phone_number" className="text-base mb-3 block">
          Phone Number
        </Label>
        {isLoadingProfile ? (
          <div className="text-sm text-muted-foreground">Loading phone number...</div>
        ) : (
          <Input
            id="phone_number"
            placeholder="+971 50 XXX XXXX"
            value={phoneNumber}
            onChange={handlePhoneChange}
            className="border-gold/30 focus:border-gold"
            required
          />
        )}
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
        <div className="space-y-4">
          <Label className="text-base font-semibold">Delivery Address</Label>
          
          {isLoadingProfile ? (
            <div className="text-sm text-muted-foreground">Loading saved address...</div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="building_name" className="text-sm">Building Name</Label>
                <Input 
                  id="building_name"
                  value={addressComponents.buildingName}
                  onChange={handleAddressComponentChange('buildingName')}
                  className="border-gold/30 focus:border-gold"
                  placeholder="Enter building name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="floor_number" className="text-sm">Floor Number</Label>
                <Input 
                  id="floor_number"
                  value={addressComponents.floorNumber}
                  onChange={handleAddressComponentChange('floorNumber')}
                  className="border-gold/30 focus:border-gold"
                  placeholder="e.g., Ground Floor, 1st Floor"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="room_number" className="text-sm">Room/Office Number</Label>
                <Input 
                  id="room_number"
                  value={addressComponents.roomNumber}
                  onChange={handleAddressComponentChange('roomNumber')}
                  className="border-gold/30 focus:border-gold"
                  placeholder="e.g., Apt 101, Office 205"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="area" className="text-sm">Area/Locality</Label>
                <Input 
                  id="area"
                  value={addressComponents.area}
                  onChange={handleAddressComponentChange('area')}
                  className="border-gold/30 focus:border-gold"
                  placeholder="e.g., Downtown, Marina, Jumeirah"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="landmark" className="text-sm">Landmark (Optional)</Label>
                <Input 
                  id="landmark"
                  value={addressComponents.landmark}
                  onChange={handleAddressComponentChange('landmark')}
                  className="border-gold/30 focus:border-gold"
                  placeholder="e.g., Near Mall, Behind Metro Station"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emirate" className="text-sm">Emirate</Label>
                <Input 
                  id="emirate"
                  value={addressComponents.emirate}
                  onChange={handleAddressComponentChange('emirate')}
                  className="border-gold/30 focus:border-gold"
                  placeholder="e.g., Dubai, Abu Dhabi, Sharjah"
                />
              </div>
            </div>
          )}
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
