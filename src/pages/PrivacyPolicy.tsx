
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Privacy Policy | Senteur Fragrances";
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif text-gold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-lg text-white/80">
              Senteur Fragrances is committed to safeguarding your privacy. We collect only essential 
              data to fulfill your orders and enhance your experience.
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li><strong>Personal Data:</strong> Name, contact details, shipping address, and payment information</li>
                <li><strong>Technical Data:</strong> Browser, device, and IP address (for analytics and security)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">How We Use It</h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Order Processing and Fulfillment</li>
                <li>Marketing Communications, only with your consent</li>
                <li>Site Optimization and Analytics</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Cookies</h2>
              <p>
                We use cookies to personalize content and improve site performance. You can manage 
                cookie preferences through your browser.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Security</h2>
              <p>
                We maintain strong security practices to protect your data.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Your Rights</h2>
              <p>
                You may request access to, correction of, or deletion of your data by contacting us at{' '}
                <a href="mailto:senteur.ae@gmail.com" className="text-gold hover:underline">
                  senteur.ae@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
