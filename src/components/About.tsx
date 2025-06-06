
import React from 'react';

const About = () => {
  return (
    <section id="about" className="section bg-darker">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-1 gap-12 items-center">
          <div className="animate-fade-up">
            <h2 className="text-sm uppercase tracking-widest text-gold mb-3">About Us</h2>
            <h3 className="text-4xl md:text-5xl font-serif mb-6">Our Philosophy</h3>
            <div className="w-24 h-0.5 bg-gold mb-8"></div>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                Since our founding in 2025, Senteur Fragrances has been dedicated to the art of perfumery, 
                crafting distinctive scents that capture moments, memories, and emotions.
              </p>
              <p>
                Our fragrances are created using only the finest ingredients sourced from around the world, 
                meticulously blended by our master perfumer to achieve perfect harmony and remarkable longevity.
              </p>
              <p>
                Each bottle is a testament to our commitment to quality and artistry, 
                designed to evoke a sense of luxury and sophistication. We believe that fragrance is 
                more than just a scent—it's an extension of your identity.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-dark">
            <div className="text-gold text-4xl font-serif mb-4">1</div>
            <h4 className="text-xl font-serif mb-4">Artisanal Craft</h4>
            <p className="text-muted-foreground">Every fragrance is meticulously handcrafted in small batches to ensure quality and attention to detail.</p>
          </div>
          
          <div className="text-center p-8 bg-dark">
            <div className="text-gold text-4xl font-serif mb-4">2</div>
            <h4 className="text-xl font-serif mb-4">Sustainable Sources</h4>
            <p className="text-muted-foreground">We source our ingredients responsibly, ensuring ethical practices and environmental consciousness.</p>
          </div>
          
          <div className="text-center p-8 bg-dark">
            <div className="text-gold text-4xl font-serif mb-4">3</div>
            <h4 className="text-xl font-serif mb-4">Timeless Design</h4>
            <p className="text-muted-foreground">Our bottles are designed to be both elegant and functional, a statement piece for your collection.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
