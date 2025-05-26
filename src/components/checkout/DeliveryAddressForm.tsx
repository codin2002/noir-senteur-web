
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressComponents {
  buildingName: string;
  floorNumber: string;
  roomNumber: string;
  area: string;
  landmark: string;
  emirate: string;
}

interface DeliveryAddressFormProps {
  addressComponents: AddressComponents;
  onAddressComponentChange: (component: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

const DeliveryAddressForm: React.FC<DeliveryAddressFormProps> = ({
  addressComponents,
  onAddressComponentChange,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Delivery Address</Label>
      
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading saved address...</div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="building_name" className="text-sm">Building Name</Label>
            <Input 
              id="building_name"
              value={addressComponents.buildingName}
              onChange={onAddressComponentChange('buildingName')}
              className="border-gold/30 focus:border-gold"
              placeholder="Enter building name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="floor_number" className="text-sm">Floor Number</Label>
            <Input 
              id="floor_number"
              value={addressComponents.floorNumber}
              onChange={onAddressComponentChange('floorNumber')}
              className="border-gold/30 focus:border-gold"
              placeholder="e.g., Ground Floor, 1st Floor"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="room_number" className="text-sm">Room/Office Number</Label>
            <Input 
              id="room_number"
              value={addressComponents.roomNumber}
              onChange={onAddressComponentChange('roomNumber')}
              className="border-gold/30 focus:border-gold"
              placeholder="e.g., Apt 101, Office 205"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm">Area/Locality</Label>
            <Input 
              id="area"
              value={addressComponents.area}
              onChange={onAddressComponentChange('area')}
              className="border-gold/30 focus:border-gold"
              placeholder="e.g., Downtown, Marina, Jumeirah"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="landmark" className="text-sm">Landmark (Optional)</Label>
            <Input 
              id="landmark"
              value={addressComponents.landmark}
              onChange={onAddressComponentChange('landmark')}
              className="border-gold/30 focus:border-gold"
              placeholder="e.g., Near Mall, Behind Metro Station"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emirate" className="text-sm">Emirate</Label>
            <Input 
              id="emirate"
              value={addressComponents.emirate}
              onChange={onAddressComponentChange('emirate')}
              className="border-gold/30 focus:border-gold"
              placeholder="e.g., Dubai, Abu Dhabi, Sharjah"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAddressForm;
