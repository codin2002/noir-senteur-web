
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { MapPin, User, Phone, Mail } from 'lucide-react';

interface AddressSelectionProps {
  onAddressChange: (address: string) => void;
  selectedAddress: string;
  onValidationChange: (isValid: boolean) => void;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({
  onAddressChange,
  selectedAddress,
  onValidationChange
}) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (user && profile) {
      setContactName(profile.full_name || '');
      setPhoneNumber(profile.phone || '');
      setEmail(user.email || '');
    }
  }, [user, profile]);

  useEffect(() => {
    const isValid = contactName.trim() !== '' && 
                   phoneNumber.trim() !== '' && 
                   email.trim() !== '' && 
                   address.trim() !== '';
    
    onValidationChange(isValid);
    
    if (isValid) {
      const fullDeliveryInfo = `Contact: ${contactName} | Phone: ${phoneNumber} | Email: ${email} | Address: ${address}`;
      onAddressChange(fullDeliveryInfo);
    }
  }, [contactName, phoneNumber, email, address, onAddressChange, onValidationChange]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gold">Delivery Information</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="contact-name" className="flex items-center text-sm font-medium mb-2">
            <User className="w-4 h-4 mr-2" />
            Contact Name *
          </Label>
          <Input
            id="contact-name"
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Full name of person receiving the order"
            className="bg-dark border-gold/30 focus:border-gold"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone" className="flex items-center text-sm font-medium mb-2">
            <Phone className="w-4 h-4 mr-2" />
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+971 50 123 4567"
            className="bg-dark border-gold/30 focus:border-gold"
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center text-sm font-medium mb-2">
            <Mail className="w-4 h-4 mr-2" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="bg-dark border-gold/30 focus:border-gold"
            required
          />
        </div>

        <div>
          <Label htmlFor="address" className="flex items-center text-sm font-medium mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            Delivery Address *
          </Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Building number, street name, area, landmark, city, emirate"
            className="bg-dark border-gold/30 focus:border-gold min-h-[100px]"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Please provide complete address including building number, street, area, and any landmarks
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressSelection;
