
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
    emirate: 'Dubai'
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
      <div className="text-center border-b border-gold/20 pb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold/20 to-gold/10 rounded-full mb-4">
          <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-2xl font-serif text-gold mb-2">Guest Checkout</h3>
        <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed">
          Complete your order quickly without creating an account. Your information will be securely processed.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-darker/80 to-darker/60 backdrop-blur-sm border border-gold/20 rounded-xl p-6">
          <PersonalInfoSection
            personalInfo={{
              name: guestDetails.name,
              email: guestDetails.email,
              phoneNumber: guestDetails.phoneNumber
            }}
            onUpdate={handlePersonalInfoUpdate}
          />
        </div>

        <div className="bg-gradient-to-r from-darker/80 to-darker/60 backdrop-blur-sm border border-gold/20 rounded-xl p-6">
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
        </div>

        <GuestCheckoutActions
          onGuestCheckout={handleSubmit}
          onSwitchToSignIn={onSwitchToSignIn}
          isCheckoutDisabled={!isFormValid()}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default GuestCheckoutForm;
