
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressInfo {
  buildingName: string;
  floorNumber: string;
  roomNumber: string;
  area: string;
  landmark: string;
  emirate: string;
}

interface AddressInfoSectionProps {
  addressInfo: AddressInfo;
  onUpdate: (field: keyof AddressInfo, value: string) => void;
}

const AddressInfoSection: React.FC<AddressInfoSectionProps> = ({
  addressInfo,
  onUpdate
}) => {
  const handleInputChange = (field: keyof AddressInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(field, e.target.value);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-white">Delivery Address</h4>
      
      <div>
        <Label htmlFor="guest_building" className="text-sm">Building Name *</Label>
        <Input
          id="guest_building"
          value={addressInfo.buildingName}
          onChange={handleInputChange('buildingName')}
          className="border-gold/30 focus:border-gold"
          placeholder="e.g., La vista 1"
          required
        />
      </div>

      <div>
        <Label htmlFor="guest_floor" className="text-sm">Floor Number</Label>
        <Input
          id="guest_floor"
          value={addressInfo.floorNumber}
          onChange={handleInputChange('floorNumber')}
          className="border-gold/30 focus:border-gold"
          placeholder="e.g., 6"
        />
      </div>

      <div>
        <Label htmlFor="guest_room" className="text-sm">Room/Office Number</Label>
        <Input
          id="guest_room"
          value={addressInfo.roomNumber}
          onChange={handleInputChange('roomNumber')}
          className="border-gold/30 focus:border-gold"
          placeholder="e.g., 911"
        />
      </div>

      <div>
        <Label htmlFor="guest_area" className="text-sm">Area/Locality *</Label>
        <Input
          id="guest_area"
          value={addressInfo.area}
          onChange={handleInputChange('area')}
          className="border-gold/30 focus:border-gold"
          placeholder="e.g., Nad Hessa"
          required
        />
      </div>

      <div>
        <Label htmlFor="guest_landmark" className="text-sm">Landmark (Optional)</Label>
        <Input
          id="guest_landmark"
          value={addressInfo.landmark}
          onChange={handleInputChange('landmark')}
          className="border-gold/30 focus:border-gold"
          placeholder="e.g., Near SIT"
        />
      </div>

      <div>
        <Label htmlFor="guest_emirate" className="text-sm">Emirate *</Label>
        <Input
          id="guest_emirate"
          value={addressInfo.emirate}
          onChange={handleInputChange('emirate')}
          className="border-gold/30 focus:border-gold"
          placeholder="e.g., Dubai, Abu Dhabi, Sharjah"
          required
        />
      </div>
    </div>
  );
};

export default AddressInfoSection;
