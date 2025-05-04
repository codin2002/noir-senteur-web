
import React from 'react';

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
              <a href="#" className="text-muted-foreground hover:text-gold transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-gold transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-gold transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
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
