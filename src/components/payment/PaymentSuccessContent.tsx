
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderDetailsCard from './OrderDetailsCard';

interface PaymentSuccessContentProps {
  orderDetails: any;
}

const PaymentSuccessContent: React.FC<PaymentSuccessContentProps> = ({ orderDetails }) => {
  const { user } = useAuth();
  const isTestPayment = orderDetails?.test === true;
  const orderReference = orderDetails?.orderId
    ? `SEN-${String(orderDetails.orderId).slice(0, 8).toUpperCase()}`
    : null;

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-4xl font-serif mb-4">{isTestPayment ? 'Test Payment Confirmed' : 'Payment Successful!'}</h1>
          <p className="text-xl text-muted-foreground mb-8">
            {isTestPayment
              ? 'Ziina and the secure webhook both confirmed this test payment. No order, stock, email, or live purchase record was created.'
              : 'Thank you for your purchase. Your order has been confirmed.'}
          </p>

          {!isTestPayment && orderReference && (
            <div className="mx-auto mb-8 max-w-md rounded-lg border border-gold/40 bg-darker px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Your order reference</p>
              <p className="mt-2 text-2xl font-semibold tracking-wide text-white">{orderReference}</p>
              <p className="mt-2 text-sm text-muted-foreground">Please save this reference. We will use it for any order support.</p>
            </div>
          )}

          {!isTestPayment && <OrderDetailsCard orderDetails={orderDetails} />}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-darker">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            
            {user && (
              <Link to="/profile?tab=history">
                <Button className="bg-gold text-darker hover:bg-gold/90">
                  <Package className="w-4 h-4 mr-2" />
                  View Purchase History
                </Button>
              </Link>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccessContent;
