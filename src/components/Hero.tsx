
import React, { useEffect, useRef, useState } from 'react';

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  useEffect(() => {
    // Function to attempt playing the video
    const attemptPlay = async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.play();
          console.log("Video playback started successfully");
          setIsVideoLoaded(true);
        } catch (error) {
          console.error("Auto-play failed:", error);
          
          // Add a click event listener to play the video on user interaction
          const handleClick = () => {
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => {
                  console.log("Video playing after user interaction");
                  setIsVideoLoaded(true);
                })
                .catch(e => console.error("Still could not play video after click:", e));
              document.removeEventListener('click', handleClick);
            }
          };
          
          document.addEventListener('click', handleClick);
        }
      }
    };

    // Wait a moment for the video element to be properly initialized
    setTimeout(() => {
      attemptPlay();
      
      // Debug video element
      if (videoRef.current) {
        console.log("Video element properties:", {
          readyState: videoRef.current.readyState,
          networkState: videoRef.current.networkState,
          error: videoRef.current.error,
          paused: videoRef.current.paused,
          currentSrc: videoRef.current.currentSrc,
          videoWidth: videoRef.current.videoWidth,
          videoHeight: videoRef.current.videoHeight
        });
      }
    }, 1000);

    return () => {
      // Cleanup any event listeners
      document.removeEventListener('click', () => {});
    };
  }, []);

  // Log when sources change
  const handleSourceError = (e: React.SyntheticEvent<HTMLSourceElement>) => {
    console.error("Source failed to load:", e.currentTarget.src);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Fallback background in case video doesn't load */}
      <div className="absolute inset-0 bg-cartier-red opacity-30"></div>
      
      {/* Video Element with multiple sources for better browser compatibility */}
      {/* Use direct URLs to the video files */}
      <video 
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay 
        loop 
        muted 
        playsInline
        poster="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero/poster.jpg"
        onLoadedData={() => setIsVideoLoaded(true)}
      >
        {/* Try the MOV file first since it's confirmed to exist */}
        <source 
          src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero/Video.mov" 
          type="video/quicktime"
          onError={handleSourceError} 
        />
        <source 
          src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero/Video.mp4" 
          type="video/mp4"
          onError={handleSourceError} 
        />
        <source 
          src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero/Video.webm" 
          type="video/webm"
          onError={handleSourceError} 
        />
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
