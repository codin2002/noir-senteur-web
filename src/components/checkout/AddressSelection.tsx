
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Home } from 'lucide-react';
import CheckoutDetailsForm from './CheckoutDetailsForm';
import { useAuth } from '@/context/AuthContext';
import {
  CheckoutDetails,
  emptyCheckoutDetails,
  formatCheckoutDeliveryAddress,
  isCheckoutDetailsValid,
} from '@/utils/checkoutDetails';

interface AddressSelectionProps {
  onAddressChange: (address: string) => void;
  selectedAddress: string;
  onValidationChange: (isValid: boolean) => void;
  onReminderConsentChange?: (consented: boolean) => void;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({
  onAddressChange,
  onValidationChange,
  onReminderConsentChange,
}) => {
  const { user } = useAuth();
  const [details, setDetails] = useState<CheckoutDetails>(() => ({
    ...emptyCheckoutDetails(),
    email: user?.email || '',
  }));

  useEffect(() => {
    if (user?.email && !details.email) {
      setDetails((current) => ({ ...current, email: user.email || '' }));
    }
  }, [user?.email, details.email]);

  const handleDetailsChange = (nextDetails: CheckoutDetails) => {
    setDetails(nextDetails);
    onAddressChange(formatCheckoutDeliveryAddress(nextDetails));
    onValidationChange(isCheckoutDetailsValid(nextDetails));
    onReminderConsentChange?.(nextDetails.reminderConsent);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-serif text-gold mb-4">Delivery Information</h3>
        
        <Card className="bg-darker/50 border-gold/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
                <Home className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h4 className="font-medium text-white">Home Delivery</h4>
                <p className="text-sm text-green-300">Free delivery across the UAE</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CheckoutDetailsForm
        details={details}
        onChange={handleDetailsChange}
        idPrefix="account-checkout"
      />
    </div>
  );
};

export default AddressSelection;
