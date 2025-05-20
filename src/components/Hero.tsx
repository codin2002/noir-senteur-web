
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
              videoRef.current.play().catch(e => console.error("Still could not play video:", e));
              document.removeEventListener('click', handleClick);
            }
          };
          
          document.addEventListener('click', handleClick);
        });
      }
    }
    
    // Debug video element
    console.log("Video element:", videoRef.current);
    console.log("Video sources:", videoRef.current?.querySelectorAll('source'));
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video Element with multiple sources for better browser compatibility */}
      <video 
        ref={videoRef}
        className="absolute top-0 left-0 min-w-full min-h-full w-auto h-auto object-cover"
        autoPlay 
        loop 
        muted 
        playsInline
        poster="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero/poster.jpg"
      >
        {/* Fix URL typos by removing double slashes */}
        <source src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero/Video.mp4" type="video/mp4" />
        <source src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero/Video.webm" type="video/webm" />
        <source src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero/Video.mov" type="video/quicktime" />
        Your browser does not support video playback.
      </video>
      
      {/* Dark overlay for text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 z-10"></div>
      
      {/* Content positioned above the video */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20">
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

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
