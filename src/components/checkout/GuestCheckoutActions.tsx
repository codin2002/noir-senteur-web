
import React from 'react';
import { Button } from '@/components/ui/button';

interface GuestCheckoutActionsProps {
  onSwitchToSignIn: () => void;
  onSubmit: () => void;
  isFormValid: boolean;
  isLoading: boolean;
}

const GuestCheckoutActions: React.FC<GuestCheckoutActionsProps> = ({
  onSwitchToSignIn,
  onSubmit,
  isFormValid,
  isLoading
}) => {
  return (
    <div className="space-y-3 pt-4 border-t border-gold/20">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSwitchToSignIn}
          className="flex-1 border-gold/30 hover:bg-gold/10 order-2 sm:order-1"
          disabled={isLoading}
        >
          Sign In with Google
        </Button>
        
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!isFormValid || isLoading}
          className="flex-1 bg-gold text-darker hover:bg-gold/80 order-1 sm:order-2"
        >
          {isLoading ? 'Processing...' : 'Continue as Guest'}
        </Button>
      </div>
      
      <p className="text-xs text-center text-white/70">
        Already have an account? Use the Sign In button above
      </p>
    </div>
  );
};

export default GuestCheckoutActions;
