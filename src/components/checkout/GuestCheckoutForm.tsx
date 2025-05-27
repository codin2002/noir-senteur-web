
import React, { useState } from 'react';
import PersonalInfoSection from './PersonalInfoSection';
import AddressInfoSection from './AddressInfoSection';
import GuestCheckoutActions from './GuestCheckoutActions';

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

  const handlePersonalInfoUpdate = (field: keyof Pick<GuestDetails, 'name' | 'email' | 'phoneNumber'>, value: string) => {
    setGuestDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressInfoUpdate = (field: keyof Pick<GuestDetails, 'buildingName' | 'floorNumber' | 'roomNumber' | 'area' | 'landmark' | 'emirate'>, value: string) => {
    setGuestDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    onGuestCheckout(guestDetails);
  };

  const isFormValid = (): boolean => {
    return !!(guestDetails.name.trim() && 
           guestDetails.email.trim() && 
           guestDetails.phoneNumber.trim() &&
           guestDetails.buildingName.trim() &&
           guestDetails.area.trim() &&
           guestDetails.emirate.trim());
  };

  return (
    <div className="space-y-6">
      <div className="text-center border-b border-gold/20 pb-4">
        <h3 className="text-xl font-serif text-gold mb-2">Checkout as Guest</h3>
        <p className="text-sm text-white/70">Complete your order without creating an account</p>
      </div>

      <div className="space-y-4">
        <PersonalInfoSection
          personalInfo={{
            name: guestDetails.name,
            email: guestDetails.email,
            phoneNumber: guestDetails.phoneNumber
          }}
          onUpdate={handlePersonalInfoUpdate}
        />

        <AddressInfoSection
          addressInfo={{
            buildingName: guestDetails.buildingName,
            floorNumber: guestDetails.floorNumber,
            roomNumber: guestDetails.roomNumber,
            area: guestDetails.area,
            landmark: guestDetails.landmark,
            emirate: guestDetails.emirate
          }}
          onUpdate={handleAddressInfoUpdate}
        />

        <GuestCheckoutActions
          onSwitchToSignIn={onSwitchToSignIn}
          onSubmit={handleSubmit}
          isFormValid={isFormValid()}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default GuestCheckoutForm;
