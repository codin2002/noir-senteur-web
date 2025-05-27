
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone } from 'lucide-react';

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
    <div className="bg-darker/60 border border-gold/15 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-gold" />
        <h4 className="text-lg font-serif text-gold">Personal Information</h4>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="guest_name" className="text-sm font-medium text-white flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Full Name *
          </Label>
          <Input
            id="guest_name"
            value={personalInfo.name}
            onChange={handleInputChange('name')}
            className="bg-dark/80 border-gold/30 focus:border-gold focus:ring-gold/20 text-white placeholder:text-muted-foreground"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guest_email" className="text-sm font-medium text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email Address *
          </Label>
          <Input
            id="guest_email"
            type="email"
            value={personalInfo.email}
            onChange={handleInputChange('email')}
            className="bg-dark/80 border-gold/30 focus:border-gold focus:ring-gold/20 text-white placeholder:text-muted-foreground"
            placeholder="your.email@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guest_phone" className="text-sm font-medium text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Phone Number *
          </Label>
          <Input
            id="guest_phone"
            value={personalInfo.phoneNumber}
            onChange={handleInputChange('phoneNumber')}
            className="bg-dark/80 border-gold/30 focus:border-gold focus:ring-gold/20 text-white placeholder:text-muted-foreground"
            placeholder="+971 50 XXX XXXX"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
