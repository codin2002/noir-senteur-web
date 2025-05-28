
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface PaymentVerificationErrorProps {
  error: string;
}

const PaymentVerificationError: React.FC<PaymentVerificationErrorProps> = ({ error }) => {
  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center min-h-[60vh] px-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-serif mb-4">Payment Verification Issue</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          
          <div className="bg-darker/50 border border-red-500/20 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-lg font-semibold mb-2 text-red-400">What to do:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check your email for a payment confirmation</li>
              <li>• Contact our support team if you were charged</li>
              <li>• Try placing your order again if needed</li>
              <li>• Screenshot this page for reference</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/cart" className="flex-1">
              <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-darker">
                Return to Cart
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button className="w-full bg-gold text-darker hover:bg-gold/90">
                Go to Home
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            You'll be automatically redirected to your cart in a few seconds.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentVerificationError;
