
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeliveryAddressFormProps {
  addressComponents: {
    contactName: string;
    phoneNumber: string;
    buildingName: string;
    floorNumber: string;
    roomNumber: string;
    area: string;
    landmark: string;
    emirate: string;
  };
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
      <h4 className="text-lg font-medium text-white mb-4">Delivery Address</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactName" className="text-white">Contact Name *</Label>
          <Input
            id="contactName"
            type="text"
            placeholder="Enter contact name"
            value={addressComponents.contactName}
            onChange={onAddressComponentChange('contactName')}
            disabled={isLoading}
            className="bg-darker border-gold/30 text-white placeholder:text-gray-400"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="phoneNumber" className="text-white">Phone Number *</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Enter phone number"
            value={addressComponents.phoneNumber}
            onChange={onAddressComponentChange('phoneNumber')}
            disabled={isLoading}
            className="bg-darker border-gold/30 text-white placeholder:text-gray-400"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="buildingName" className="text-white">Building Name *</Label>
        <Input
          id="buildingName"
          type="text"
          placeholder="Enter building name"
          value={addressComponents.buildingName}
          onChange={onAddressComponentChange('buildingName')}
          disabled={isLoading}
          className="bg-darker border-gold/30 text-white placeholder:text-gray-400"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="floorNumber" className="text-white">Floor Number</Label>
          <Input
            id="floorNumber"
            type="text"
            placeholder="e.g., Ground Floor, 1st Floor"
            value={addressComponents.floorNumber}
            onChange={onAddressComponentChange('floorNumber')}
            disabled={isLoading}
            className="bg-darker border-gold/30 text-white placeholder:text-gray-400"
          />
        </div>

        <div>
          <Label htmlFor="roomNumber" className="text-white">Room/Office Number</Label>
          <Input
            id="roomNumber"
            type="text"
            placeholder="e.g., Apt 101, Office 205"
            value={addressComponents.roomNumber}
            onChange={onAddressComponentChange('roomNumber')}
            disabled={isLoading}
            className="bg-darker border-gold/30 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="area" className="text-white">Area/Locality *</Label>
        <Input
          id="area"
          type="text"
          placeholder="e.g., Downtown, Marina, Jumeirah"
          value={addressComponents.area}
          onChange={onAddressComponentChange('area')}
          disabled={isLoading}
          className="bg-darker border-gold/30 text-white placeholder:text-gray-400"
          required
        />
      </div>

      <div>
        <Label htmlFor="landmark" className="text-white">Landmark (Optional)</Label>
        <Input
          id="landmark"
          type="text"
          placeholder="e.g., Near Mall, Behind Metro Station"
          value={addressComponents.landmark}
          onChange={onAddressComponentChange('landmark')}
          disabled={isLoading}
          className="bg-darker border-gold/30 text-white placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label htmlFor="emirate" className="text-white">Emirate</Label>
        <Input
          id="emirate"
          type="text"
          placeholder="e.g., Dubai, Abu Dhabi, Sharjah"
          value={addressComponents.emirate}
          onChange={onAddressComponentChange('emirate')}
          disabled={isLoading}
          className="bg-darker border-gold/30 text-white placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};

export default DeliveryAddressForm;
