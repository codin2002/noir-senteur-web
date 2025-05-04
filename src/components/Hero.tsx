
import React from 'react';

const Hero = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-darker">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1624359736213-e8cec3a37945?q=80&w=1000')] 
          bg-cover bg-center opacity-60"
        ></div>
        <div className="absolute inset-0 bg-gradient"></div>
      </div>

      <div className="relative z-10 text-center px-6 animate-fade-in">
        <h2 className="text-sm md:text-base uppercase tracking-[0.3em] text-gold mb-4">Artisanal Fragrances</h2>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-6">
          Discover <span className="italic">Extraordinary</span> <br />
          Scent Experiences
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Meticulously crafted fragrances for those who seek distinction in every detail.
        </p>
        <a href="#collection" className="btn-outline">
          EXPLORE COLLECTION
        </a>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
