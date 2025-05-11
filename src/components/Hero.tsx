
import React from 'react';
import { Button } from './ui/button';

const Hero = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video background with proper positioning */}
      <div className="absolute inset-0">
        <video
          className="absolute right-0 bottom-0 min-w-full min-h-full w-auto h-auto object-cover z-0"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero//Video.mov" type="video/quicktime" />
          Your browser does not support video playback.
        </video>
        {/* Overlay gradient to improve text visibility */}
        <div className="absolute inset-0 bg-gradient z-0"></div>
      </div>

      {/* Content positioned above the video */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in">
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

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
