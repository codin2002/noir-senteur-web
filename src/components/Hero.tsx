
import React, { useEffect, useRef } from 'react';

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Ensure video plays when component mounts
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Video playback failed:", error);
          
          // Add a click event listener to play the video on user interaction
          const handleClick = () => {
            if (videoRef.current) {
              videoRef.current.play();
              document.removeEventListener('click', handleClick);
            }
          };
          
          document.addEventListener('click', handleClick);
        });
      }
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video Element with multiple sources for better browser compatibility */}
      <video 
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay 
        loop 
        muted 
        playsInline
        style={{ zIndex: 1 }}
        poster="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero/poster.jpg"
      >
        <source src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero/Video.mp4" type="video/mp4" />
        <source src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero/Video.mov" type="video/quicktime" />
        <source src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero/Video.webm" type="video/webm" />
        Your browser does not support video playback.
      </video>
      
      {/* Dark overlay for text visibility */}
      <div 
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/40 to-black/70"
        style={{ zIndex: 2 }}
      ></div>
      
      {/* Content positioned above the video */}
      <div 
        className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center px-6"
        style={{ zIndex: 3 }}
      >
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

      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
        style={{ zIndex: 3 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
