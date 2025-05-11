
import React from 'react';
import { Instagram, Tiktok, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-dark pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-serif mb-6">SENTEUR<span className="gold-text">.</span></h2>
            <p className="text-muted-foreground mb-6">
              Crafting exceptional fragrances for those who appreciate the art of scent.
            </p>
            <div className="flex space-x-4">
              <a href="http://wa.me/971509635636" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold transition-colors">
                <MessageCircle size={20} />
              </a>
              <a href="https://www.instagram.com/senteur.fragrances/?igsh=MTNqeXZ2c2l3ZWYwcg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.tiktok.com/@senteurfragrances?_t=ZS-8wGnFChmyoB&_r=1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold transition-colors">
                <Tiktok size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-serif mb-6">Visit Us</h3>
            <address className="not-italic text-muted-foreground">
              <p>25 Rue Saint-Honoré</p>
              <p>75001 Paris, France</p>
              <p className="mt-4">Mon - Sat: 10am - 7pm</p>
              <p>Sunday: By appointment</p>
            </address>
          </div>
          
          <div>
            <h3 className="text-lg font-serif mb-6">Contact</h3>
            <ul className="text-muted-foreground space-y-2">
              <li>
                <a href="mailto:contact@senteurfragrances.com" className="hover:text-gold transition-colors">
                  contact@senteurfragrances.com
                </a>
              </li>
              <li>
                <a href="tel:+33142560987" className="hover:text-gold transition-colors">
                  +33 1 42 56 09 87
                </a>
              </li>
              <li className="pt-4">
                <form className="mt-2">
                  <p className="mb-2">Subscribe to our newsletter:</p>
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="bg-dark border border-gray-800 p-2 text-sm flex-grow focus:outline-none focus:border-gold"
                    />
                    <button className="bg-gold text-darker px-4 py-2 text-sm">
                      SEND
                    </button>
                  </div>
                </form>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Senteur Fragrances. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
