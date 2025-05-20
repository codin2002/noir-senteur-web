
import React from 'react';
import { Button } from './ui/button';

const Hero = () => {
  return (
    <div className="banner">
      <video autoPlay loop muted playsInline className="hero-video">
        <source src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero//Video.mov" type="video/quicktime" />
        Your browser does not support video playback.
      </video>
      
      {/* Overlay for better text visibility */}
      <div className="video-overlay"></div>
      
      {/* Content positioned above the video */}
      <div className="content">
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

      <div className="scroll-indicator">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
