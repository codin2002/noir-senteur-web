
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MessageCircle, Mail, Instagram } from 'lucide-react';

const ContactUs = () => {
  useEffect(() => {
    document.title = "Contact Us | Senteur Fragrances";
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif text-gold mb-8">Contact Us</h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-lg text-white/80">
              For product issues or support, please reach out to us through any of the following channels:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-darker border border-gold/20 rounded-lg p-6 text-center">
                <Mail className="w-8 h-8 text-gold mx-auto mb-4" />
                <h3 className="text-lg font-serif text-gold mb-2">Email</h3>
                <a 
                  href="mailto:team@senteurfragrances.com" 
                  className="text-white/80 hover:text-gold transition-colors"
                >
                  team@senteurfragrances.com
                </a>
              </div>

              <div className="bg-darker border border-gold/20 rounded-lg p-6 text-center">
                <MessageCircle className="w-8 h-8 text-gold mx-auto mb-4" />
                <h3 className="text-lg font-serif text-gold mb-2">WhatsApp</h3>
                <a 
                  href="http://wa.me/971509635636" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-gold transition-colors"
                >
                  +971 50 963 5636
                </a>
              </div>

              <div className="bg-darker border border-gold/20 rounded-lg p-6 text-center">
                <Instagram className="w-8 h-8 text-gold mx-auto mb-4" />
                <h3 className="text-lg font-serif text-gold mb-2">Instagram</h3>
                <a 
                  href="https://www.instagram.com/senteur.fragrances/?igsh=MTNqeXZ2c2l3ZWYwcg%3D%3D&utm_source=qr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-gold transition-colors"
                >
                  @senteur.fragrances
                </a>
              </div>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Customer Support Hours</h2>
              <p>
                Our customer support team is available to assist you during business hours. 
                We aim to respond to all inquiries within 24 hours.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-gold">Follow Us</h2>
              <p>
                Stay updated with our latest fragrances and exclusive offers by following us on social media:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>
                  Instagram: <a 
                    href="https://www.instagram.com/senteur.fragrances/?igsh=MTNqeXZ2c2l3ZWYwcg%3D%3D&utm_source=qr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    @senteur.fragrances
                  </a>
                </li>
                <li>
                  TikTok: <a 
                    href="https://www.tiktok.com/@senteur.fragrance?_t=ZS-8wi9CI5uMit&_r=1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    @senteur.fragrance
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUs;
