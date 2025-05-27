
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ShippingPolicy = () => {
  useEffect(() => {
    document.title = "Shipping & Delivery Policy | Senteur Fragrances";
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif text-gold mb-8">Shipping & Delivery Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Processing & Delivery Times</h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Orders are processed within 24 hours</li>
                <li>Delivery takes approximately 2–4 working days, depending on location</li>
                <li>We are not liable for delays caused by third-party logistics or unforeseen circumstances</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Order Tracking</h2>
              <p>
                Once your order is shipped, you will receive tracking information to monitor your delivery status.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Delivery Areas</h2>
              <p>
                We currently deliver across the UAE. Delivery times may vary based on your location within the Emirates.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Contact for Delivery Issues</h2>
              <p>
                If you experience any issues with your delivery, please contact us immediately:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Email: <a href="mailto:senteur.ae@gmail.com" className="text-gold hover:underline">senteur.ae@gmail.com</a></li>
                <li>WhatsApp: <a href="http://wa.me/971509635636" className="text-gold hover:underline">+971 50 963 5636</a></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
