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
  onValidationChange?: (isValid: boolean) => void;
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
  selectedAddress,
  onValidationChange
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
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

  // Load user's saved address, phone, and name on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      setIsLoadingProfile(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('address, phone, full_name')
          .eq('id', user.id)
          .single();

        if (!error && profile) {
          // Set customer name
          if (profile.full_name) {
            setCustomerName(profile.full_name);
          } else if (user.user_metadata?.full_name) {
            setCustomerName(user.user_metadata.full_name);
          } else if (user.user_metadata?.name) {
            setCustomerName(user.user_metadata.name);
          }

          // Set phone number
          if (profile.phone) {
            setPhoneNumber(profile.phone);
          }
          
          // Parse address components
          if (profile.address) {
            // Split by comma or newline and clean up the address
            const addressParts = profile.address.split(/[,\n]/).map(part => part.trim()).filter(Boolean);
            
            // Try to parse the address intelligently
            const components: AddressComponents = {
              buildingName: addressParts[0] || '',
              floorNumber: addressParts[1] || '',
              roomNumber: addressParts[2] || '',
              area: addressParts[3] || '',
              landmark: addressParts[4] || '',
              emirate: addressParts[5] || 'Dubai'
            };

            // If the address contains "Phone:" remove it from parsing
            if (profile.address.includes('Phone:')) {
              const addressWithoutPhone = profile.address.split('|')[0].trim();
              const cleanParts = addressWithoutPhone.split(',').map(part => part.trim()).filter(Boolean);
              
              components.buildingName = cleanParts[0] || '';
              components.floorNumber = cleanParts[1] || '';
              components.roomNumber = cleanParts[2] || '';
              components.area = cleanParts[3] || '';
              components.landmark = cleanParts[4] || '';
              components.emirate = cleanParts[5] || 'Dubai';
            }

            setAddressComponents(components);
            updateSelectedAddress(components, profile.phone || phoneNumber, profile.full_name || customerName);
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

  const updateSelectedAddress = (components: AddressComponents, phone: string, name: string) => {
    const addressParts = [
      components.buildingName,
      components.floorNumber,
      components.roomNumber,
      components.area,
      components.landmark,
      components.emirate
    ].filter(Boolean);
    
    const fullAddress = addressParts.join(', ');
    let addressWithDetails = fullAddress;
    
    if (name) {
      addressWithDetails += ` | Contact: ${name}`;
    }
    if (phone) {
      addressWithDetails += ` | Phone: ${phone}`;
    }
    
    onAddressChange(addressWithDetails);
    
    // Validate that phone number is provided
    const isValid = phone.trim().length > 0;
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  };

  // Update selected address when components, phone, or name change
  useEffect(() => {
    updateSelectedAddress(addressComponents, phoneNumber, customerName);
  }, [addressComponents, phoneNumber, customerName, onAddressChange, onValidationChange]);

  const handleAddressComponentChange = (component: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newComponents = { ...addressComponents, [component]: e.target.value };
    setAddressComponents(newComponents);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerName(e.target.value);
  };

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
      <DeliveryHeader />
      
      {/* Customer Name Field */}
      <div className="space-y-2">
        <label htmlFor="customerName" className="block text-sm font-medium text-gold">
          Customer Name
        </label>
        <input
          id="customerName"
          type="text"
          value={customerName}
          onChange={handleNameChange}
          disabled={isLoadingProfile}
          className="w-full px-4 py-3 bg-darker/50 border border-gold/30 rounded-lg text-white placeholder-white/50 focus:border-gold focus:ring-1 focus:ring-gold transition-colors disabled:opacity-50"
          placeholder="Enter your full name"
        />
      </div>
      
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
