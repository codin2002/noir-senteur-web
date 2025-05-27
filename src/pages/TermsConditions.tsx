
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsConditions = () => {
  useEffect(() => {
    document.title = "Terms & Conditions | Senteur Fragrances";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif text-gold mb-8">Terms and Conditions</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-lg text-white/80">
              At Senteur Fragrances, your satisfaction is our priority. We take pride in delivering 
              exceptional products and have outlined the following policies to ensure a transparent and 
              seamless shopping experience.
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Order Cancellation</h2>
              <p>
                Orders can be canceled within 12 hours of placement. After this period, orders are 
                processed and cannot be canceled.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Returns, Refunds & Exchanges</h2>
              <p>
                We accept returns or exchanges only in the case of a product fault or damage. To be eligible:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>The issue must be reported within 7 working days of receiving your order</li>
                <li>Products must be returned in unused and original condition, with all packaging intact</li>
                <li>Photo or video proof of the fault may be required for validation</li>
              </ul>
              
              <p>If a return is approved due to a fault or error on our part:</p>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Refunds will be processed within 7–14 working days via the original payment method</li>
                <li>Exchanges will be arranged at no additional cost</li>
              </ul>
              
              <p className="text-white/80">
                <strong>Please note:</strong> We do not accept returns or exchanges for reasons related to change of mind, 
                scent preference, or opened/used items.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Website Use</h2>
              <p>
                By using our website, you agree to our terms. If you do not agree, please refrain from using 
                our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Orders & Payments</h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>All orders are subject to stock availability and confirmation</li>
                <li>Prices may change without prior notice</li>
                <li>Installment payment options may be offered via approved providers</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Order Confirmation</h2>
              <p>
                You will receive a confirmation email upon order placement and a follow-up once your order 
                ships. If any issue arises, we'll contact you before processing further.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Contact Us</h2>
              <p>
                For product issues or support, please reach out to us through:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Email: <a href="mailto:senteur.ae@gmail.com" className="text-gold hover:underline">senteur.ae@gmail.com</a></li>
                <li>WhatsApp: <a href="http://wa.me/971509635636" className="text-gold hover:underline">+971 50 963 5636</a></li>
                <li>Instagram: <a href="https://www.instagram.com/senteur.fragrances" className="text-gold hover:underline">@senteur.fragrances</a></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsConditions;
