
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Hash, DoorOpen, MapPin, Landmark, Globe } from 'lucide-react';

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
    <div className="bg-darker/60 border border-gold/15 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-gold" />
        <h4 className="text-lg font-serif text-gold">Delivery Address</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="building_name" className="text-sm font-medium text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-muted-foreground" />
            Building Name *
          </Label>
          <Input
            id="building_name"
            value={addressInfo.buildingName}
            onChange={handleInputChange('buildingName')}
            className="bg-dark/80 border-gold/30 focus:border-gold focus:ring-gold/20 text-white placeholder:text-muted-foreground"
            placeholder="Building or Villa name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="floor_number" className="text-sm font-medium text-white flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground" />
            Floor Number
          </Label>
          <Input
            id="floor_number"
            value={addressInfo.floorNumber}
            onChange={handleInputChange('floorNumber')}
            className="bg-dark/80 border-gold/30 focus:border-gold focus:ring-gold/20 text-white placeholder:text-muted-foreground"
            placeholder="Floor number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="room_number" className="text-sm font-medium text-white flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-muted-foreground" />
            Room/Apt Number
          </Label>
          <Input
            id="room_number"
            value={addressInfo.roomNumber}
            onChange={handleInputChange('roomNumber')}
            className="bg-dark/80 border-gold/30 focus:border-gold focus:ring-gold/20 text-white placeholder:text-muted-foreground"
            placeholder="Room or apartment number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="area" className="text-sm font-medium text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            Area *
          </Label>
          <Input
            id="area"
            value={addressInfo.area}
            onChange={handleInputChange('area')}
            className="bg-dark/80 border-gold/30 focus:border-gold focus:ring-gold/20 text-white placeholder:text-muted-foreground"
            placeholder="Area or district"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="landmark" className="text-sm font-medium text-white flex items-center gap-2">
            <Landmark className="w-4 h-4 text-muted-foreground" />
            Landmark
          </Label>
          <Input
            id="landmark"
            value={addressInfo.landmark}
            onChange={handleInputChange('landmark')}
            className="bg-dark/80 border-gold/30 focus:border-gold focus:ring-gold/20 text-white placeholder:text-muted-foreground"
            placeholder="Near landmark"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emirate" className="text-sm font-medium text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Emirate *
          </Label>
          <Input
            id="emirate"
            value={addressInfo.emirate}
            onChange={handleInputChange('emirate')}
            className="bg-dark/80 border-gold/30 focus:border-gold focus:ring-gold/20 text-white placeholder:text-muted-foreground"
            placeholder="Select emirate"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default AddressInfoSection;
