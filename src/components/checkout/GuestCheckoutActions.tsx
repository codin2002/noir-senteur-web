
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, UserPlus } from 'lucide-react';

interface GuestCheckoutActionsProps {
  onGuestCheckout: () => void;
  onSwitchToSignIn: () => void;
  isLoading: boolean;
  isCheckoutDisabled: boolean;
}

const GuestCheckoutActions: React.FC<GuestCheckoutActionsProps> = ({
  onGuestCheckout,
  onSwitchToSignIn,
  isLoading,
  isCheckoutDisabled
}) => {
  const handleSignInClick = () => {
    // Store that user is in checkout flow before redirecting to sign in
    localStorage.setItem('user_in_checkout_flow', 'true');
    onSwitchToSignIn();
  };

  return (
    <div className="space-y-4 pt-6 border-t border-gold/20">
      <Button
        onClick={onGuestCheckout}
        disabled={isCheckoutDisabled || isLoading}
        className="w-full bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-dark font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>
            Processing Payment...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pay securely
          </div>
        )}
      </Button>
      
      <button onClick={handleSignInClick} type="button" className="mx-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-gold">
        <UserPlus className="h-4 w-4" /> Already have an account? Sign in
      </button>
      
      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        By completing your order, you agree to our terms and conditions. 
        <br />
        Your information will be securely processed.
      </p>
    </div>
  );
};

export default GuestCheckoutActions;
