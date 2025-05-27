
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ShippingPolicy = () => {
  useEffect(() => {
    document.title = "Shipping & Delivery Policy | Senteur Fragrances";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif text-gold mb-8">Shipping & Delivery Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <ul className="list-disc list-inside space-y-2 text-white/80">
              <li>Orders are processed within 24 hours</li>
              <li>Delivery takes approximately 2–4 working days, depending on location</li>
              <li>We are not liable for delays caused by third-party logistics or unforeseen circumstances</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
