
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PersonalInfo {
  name: string;
  email: string;
  phoneNumber: string;
}

interface PersonalInfoSectionProps {
  personalInfo: PersonalInfo;
  onUpdate: (field: keyof PersonalInfo, value: string) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  personalInfo,
  onUpdate
}) => {
  const handleInputChange = (field: keyof PersonalInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(field, e.target.value);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-white">Personal Information</h4>
      
      <div>
        <Label htmlFor="guest_name" className="text-sm">Full Name *</Label>
        <Input
          id="guest_name"
          value={personalInfo.name}
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
          value={personalInfo.email}
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
          value={personalInfo.phoneNumber}
          onChange={handleInputChange('phoneNumber')}
          className="border-gold/30 focus:border-gold"
          placeholder="+971 50 XXX XXXX"
          required
        />
      </div>
    </div>
  );
};

export default PersonalInfoSection;
