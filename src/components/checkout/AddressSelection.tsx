
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import DeliveryHeader from './DeliveryHeader';
import PhoneNumberField from './PhoneNumberField';
import DeliveryAddressForm from './DeliveryAddressForm';
import AddressPreview from './AddressPreview';

interface AddressSelectionProps {
  onAddressChange: (address: string) => void;
  selectedAddress: string;
}

interface AddressComponents {
  buildingName: string;
  floorNumber: string;
  roomNumber: string;
  area: string;
  landmark: string;
  emirate: string;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({ 
  onAddressChange, 
  selectedAddress 
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressComponents, setAddressComponents] = useState<AddressComponents>({
    buildingName: '',
    floorNumber: '',
    roomNumber: '',
    area: '',
    landmark: '',
    emirate: ''
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const { user } = useAuth();

  // Load user's saved address and phone on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      setIsLoadingProfile(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('address, phone')
          .eq('id', user.id)
          .single();

        if (!error && profile) {
          if (profile.phone) {
            setPhoneNumber(profile.phone);
          }
          
          if (profile.address) {
            const lines = profile.address.split('\n');
            const components = {
              buildingName: lines[0] || '',
              floorNumber: lines[1] || '',
              roomNumber: lines[2] || '',
              area: lines[3] || '',
              landmark: lines[4] || '',
              emirate: lines[5] || ''
            };
            setAddressComponents(components);
            updateSelectedAddress(components, profile.phone || phoneNumber);
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const updateSelectedAddress = (components: AddressComponents, phone: string) => {
    const addressParts = [
      components.buildingName,
      components.floorNumber,
      components.roomNumber,
      components.area,
      components.landmark,
      components.emirate
    ].filter(Boolean);
    
    const fullAddress = addressParts.join(', ');
    const addressWithPhone = phone ? `${fullAddress} | Phone: ${phone}` : fullAddress;
    onAddressChange(addressWithPhone);
  };

  // Update selected address when components or phone change
  useEffect(() => {
    updateSelectedAddress(addressComponents, phoneNumber);
  }, [addressComponents, phoneNumber, onAddressChange]);

  const handleAddressComponentChange = (component: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newComponents = { ...addressComponents, [component]: e.target.value };
    setAddressComponents(newComponents);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
      <DeliveryHeader />
      
      <PhoneNumberField 
        phoneNumber={phoneNumber}
        onChange={handlePhoneChange}
        isLoading={isLoadingProfile}
      />

      <DeliveryAddressForm 
        addressComponents={addressComponents}
        onAddressComponentChange={handleAddressComponentChange}
        isLoading={isLoadingProfile}
      />

      <AddressPreview selectedAddress={selectedAddress} />
    </div>
  );
};

export default AddressSelection;
