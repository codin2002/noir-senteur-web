
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
          
          <div className="space-y-4">
            <Label className="text-base font-semibold">Address (UAE Format)</Label>
            
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
