
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, MapPin } from 'lucide-react';
import DeliveryAddressForm from './DeliveryAddressForm';
import { PRICING } from '@/utils/constants';

interface AddressSelectionProps {
  onAddressChange: (address: string) => void;
  selectedAddress: string;
  onValidationChange: (isValid: boolean) => void;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({
  onAddressChange,
  selectedAddress,
  onValidationChange
}) => {
  const [deliveryMethod] = useState('home');
  const [addressComponents, setAddressComponents] = useState({
    buildingName: '',
    floorNumber: '',
    roomNumber: '',
    area: '',
    landmark: '',
    emirate: ''
  });

  // Parse existing address into components when selectedAddress changes
  useEffect(() => {
    if (selectedAddress) {
      // Try to parse the address if it's a formatted string
      // For now, just set it as the building name if it's a simple string
      setAddressComponents(prev => ({
        ...prev,
        buildingName: selectedAddress
      }));
    }
  }, [selectedAddress]);

  // Handle address component changes
  const handleAddressComponentChange = (component: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newComponents = {
      ...addressComponents,
      [component]: e.target.value
    };
    setAddressComponents(newComponents);

    // Combine all components into a single address string
    const fullAddress = [
      newComponents.buildingName,
      newComponents.floorNumber,
      newComponents.roomNumber,
      newComponents.area,
      newComponents.landmark,
      newComponents.emirate
    ].filter(Boolean).join(', ');

    onAddressChange(fullAddress);

    // Check if address is valid (at least building name and area)
    const isValid = newComponents.buildingName.trim() !== '' && newComponents.area.trim() !== '';
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-serif text-gold mb-4">Delivery Information</h3>
        
        <Card className="bg-darker/50 border-gold/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                <Home className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h4 className="font-medium text-white">Home Delivery</h4>
                <p className="text-sm text-muted-foreground">AED {PRICING.SHIPPING_COST} delivery fee</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeliveryAddressForm 
        addressComponents={addressComponents}
        onAddressComponentChange={handleAddressComponentChange}
        isLoading={false}
      />
    </div>
  );
};

export default AddressSelection;
