
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
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address"
              value={formData.address}
              onChange={handleChange('address')}
              className="bg-darker border-gold/30"
              placeholder="Your delivery address"
            />
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
