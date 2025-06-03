
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
    contactName: '',
    phoneNumber: '',
    buildingName: '',
    floorNumber: '',
    roomNumber: '',
    area: '',
    landmark: '',
    emirate: ''
  });

  // Parse existing address into components when selectedAddress changes
  useEffect(() => {
    if (selectedAddress && !selectedAddress.includes('|')) {
      // Simple address - just set as building name
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

    // Create a clean, structured address format
    const addressParts = [
      newComponents.buildingName,
      newComponents.floorNumber,
      newComponents.roomNumber,
      newComponents.area,
      newComponents.landmark,
      newComponents.emirate
    ].filter(part => part && part.trim() !== '');

    const formattedAddress = `Contact: ${newComponents.contactName} | Phone: ${newComponents.phoneNumber} | Address: ${addressParts.join(', ')}`;
    
    onAddressChange(formattedAddress);

    // Check if address is valid (contact name, phone, building name and area are required)
    const isValid = newComponents.contactName.trim() !== '' && 
                   newComponents.phoneNumber.trim() !== '' &&
                   newComponents.buildingName.trim() !== '' && 
                   newComponents.area.trim() !== '';
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
