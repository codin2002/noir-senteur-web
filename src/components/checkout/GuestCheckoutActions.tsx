
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, UserPlus, ShoppingBag } from 'lucide-react';

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
            Complete Order
          </div>
        )}
      </Button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gold/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-darker px-3 text-muted-foreground font-medium">or</span>
        </div>
      </div>
      
      <Button
        onClick={handleSignInClick}
        variant="outline"
        className="w-full border-gold/40 text-gold hover:bg-gold/10 hover:border-gold transition-all duration-200"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Sign In with Google
      </Button>
      
      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        By completing your order, you agree to our terms and conditions. 
        <br />
        Your information will be securely processed.
      </p>
    </div>
  );
};

export default GuestCheckoutActions;
