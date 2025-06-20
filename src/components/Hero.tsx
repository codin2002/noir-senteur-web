
import React, { useEffect, useRef, useState } from 'react';

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => {
        setIsVideoLoaded(true);
      };

      video.addEventListener('canplay', handleCanPlay);
      return () => video.removeEventListener('canplay', handleCanPlay);
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cartier-red/40 to-cartier-red/70 z-0"></div>
      
      {/* Video background */}
      <video 
        ref={videoRef} 
        className={`absolute top-0 left-0 min-w-full min-h-full object-cover transition-opacity duration-700 ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`} 
        autoPlay 
        loop 
        muted 
        playsInline
        poster="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1887&auto=format&fit=crop" 
        onLoadedData={() => setIsVideoLoaded(true)} 
        preload="auto" 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      >
        <source 
          src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero//Final%20Confession.mp4" 
          type="video/mp4" 
        />
        Your browser does not support video playback.
      </video>
      
      {/* Dark overlay for text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 z-10"></div>
      
      {/* Content positioned above the video */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 bg-transparent px-[25px]">
        <h2 className="text-sm md:text-base uppercase tracking-[0.3em] text-gold mb-4">Artisanal Fragrances</h2>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-6">
          Discover <span className="italic">Extraordinary</span> <br />
          Scent Experiences
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Meticulously crafted fragrances for those who seek distinction in every detail.
        </p>
        <a href="#collection" className="btn-outline">EXPLORE ٣١٣</a>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

export default Hero;
