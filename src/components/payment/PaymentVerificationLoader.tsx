
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentVerificationLoader = () => {
  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center min-h-[60vh] px-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-serif mb-2">Verifying your payment...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your order.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentVerificationLoader;
