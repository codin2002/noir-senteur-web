
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface GuestDetails {
  name: string;
  email: string;
  phoneNumber: string;
  buildingName: string;
  floorNumber: string;
  roomNumber: string;
  area: string;
  landmark: string;
  emirate: string;
}

interface GuestCheckoutFormProps {
  onGuestCheckout: (details: GuestDetails) => void;
  onSwitchToSignIn: () => void;
  isLoading: boolean;
}

const GuestCheckoutForm: React.FC<GuestCheckoutFormProps> = ({
  onGuestCheckout,
  onSwitchToSignIn,
  isLoading
}) => {
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    name: '',
    email: '',
    phoneNumber: '',
    buildingName: '',
    floorNumber: '',
    roomNumber: '',
    area: '',
    landmark: '',
    emirate: ''
  });

  const handleInputChange = (field: keyof GuestDetails) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestDetails(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuestCheckout(guestDetails);
  };

  const isFormValid = () => {
    return guestDetails.name.trim() && 
           guestDetails.email.trim() && 
           guestDetails.phoneNumber.trim() &&
           guestDetails.buildingName.trim() &&
           guestDetails.area.trim() &&
           guestDetails.emirate.trim();
  };

  return (
    <div className="space-y-6">
      <div className="text-center border-b border-gold/20 pb-4">
        <h3 className="text-xl font-serif text-gold mb-2">Checkout as Guest</h3>
        <p className="text-sm text-white/70">Complete your order without creating an account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Details */}
        <div className="space-y-4">
          <h4 className="font-medium text-white">Personal Information</h4>
          
          <div>
            <Label htmlFor="guest_name" className="text-sm">Full Name *</Label>
            <Input
              id="guest_name"
              value={guestDetails.name}
              onChange={handleInputChange('name')}
              className="border-gold/30 focus:border-gold"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="guest_email" className="text-sm">Email Address *</Label>
            <Input
              id="guest_email"
              type="email"
              value={guestDetails.email}
              onChange={handleInputChange('email')}
              className="border-gold/30 focus:border-gold"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="guest_phone" className="text-sm">Phone Number *</Label>
            <Input
              id="guest_phone"
              value={guestDetails.phoneNumber}
              onChange={handleInputChange('phoneNumber')}
              className="border-gold/30 focus:border-gold"
              placeholder="+971 50 XXX XXXX"
              required
            />
          </div>
        </div>

        {/* Address Details */}
        <div className="space-y-4">
          <h4 className="font-medium text-white">Delivery Address</h4>
          
          <div>
            <Label htmlFor="guest_building" className="text-sm">Building Name *</Label>
            <Input
              id="guest_building"
              value={guestDetails.buildingName}
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
              value={guestDetails.floorNumber}
              onChange={handleInputChange('floorNumber')}
              className="border-gold/30 focus:border-gold"
              placeholder="e.g., 6"
            />
          </div>

          <div>
            <Label htmlFor="guest_room" className="text-sm">Room/Office Number</Label>
            <Input
              id="guest_room"
              value={guestDetails.roomNumber}
              onChange={handleInputChange('roomNumber')}
              className="border-gold/30 focus:border-gold"
              placeholder="e.g., 911"
            />
          </div>

          <div>
            <Label htmlFor="guest_area" className="text-sm">Area/Locality *</Label>
            <Input
              id="guest_area"
              value={guestDetails.area}
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
              value={guestDetails.landmark}
              onChange={handleInputChange('landmark')}
              className="border-gold/30 focus:border-gold"
              placeholder="e.g., Near SIT"
            />
          </div>

          <div>
            <Label htmlFor="guest_emirate" className="text-sm">Emirate *</Label>
            <Input
              id="guest_emirate"
              value={guestDetails.emirate}
              onChange={handleInputChange('emirate')}
              className="border-gold/30 focus:border-gold"
              placeholder="e.g., Dubai, Abu Dhabi, Sharjah"
              required
            />
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Button
            type="submit"
            disabled={!isFormValid() || isLoading}
            className="w-full bg-gold text-darker hover:bg-gold/80"
          >
            {isLoading ? 'Processing...' : 'Continue as Guest'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-white/70 mb-2">Already have an account?</p>
            <Button
              type="button"
              variant="outline"
              onClick={onSwitchToSignIn}
              className="w-full border-gold/30 hover:bg-gold/10"
              disabled={isLoading}
            >
              Sign In with Google
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GuestCheckoutForm;
