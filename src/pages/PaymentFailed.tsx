
import React from 'react';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const reason = searchParams.get('reason');

  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-12 h-12 text-white" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-serif">Payment Failed</h1>
          <p className="text-muted-foreground">
            We couldn't process your payment. Please try again or contact support if the issue persists.
          </p>
        </div>

        {(error || reason) && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-left">
            <p className="font-medium text-red-400 mb-2">Error Details:</p>
            {error && <p className="text-sm text-red-300">Error: {error}</p>}
            {reason && <p className="text-sm text-red-300">Reason: {reason}</p>}
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Your cart items have been preserved. You can return to complete your purchase.
          </p>
          
          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1 border-gold/30 hover:bg-gold/10">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild className="flex-1 bg-gold text-darker hover:bg-gold/80">
              <Link to="/cart">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
