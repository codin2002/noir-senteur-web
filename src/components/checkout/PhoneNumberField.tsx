
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneNumberFieldProps {
  phoneNumber: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({
  phoneNumber,
  onChange,
  isLoading
}) => {
  return (
    <div>
      <Label htmlFor="phone_number" className="text-base mb-3 block">
        Phone Number *
      </Label>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading phone number...</div>
      ) : (
        <Input
          id="phone_number"
          placeholder="+971 50 XXX XXXX"
          value={phoneNumber}
          onChange={onChange}
          className="border-gold/30 focus:border-gold"
          required
        />
      )}
    </div>
  );
};

export default PhoneNumberField;
