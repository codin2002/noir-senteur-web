import React, { useEffect, useRef, useState } from 'react';
const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  useEffect(() => {
    // Preload the video before attempting to play
    const preloadVideo = () => {
      if (videoRef.current) {
        videoRef.current.load();
        console.log("Video preloading started");
      }
    };
    const attemptPlay = async () => {
      if (videoRef.current) {
        try {
          // Only set video started after play() succeeds
          await videoRef.current.play();
          console.log("Video playback started successfully");
          setIsVideoLoaded(true);
          setVideoStarted(true);
        } catch (error) {
          console.error("Auto-play failed:", error);
          setVideoError(true);

          // Add a click event listener to play the video on user interaction
          const handleClick = () => {
            if (videoRef.current) {
              videoRef.current.play().then(() => {
                console.log("Video playing after user interaction");
                setIsVideoLoaded(true);
                setVideoStarted(true);
              }).catch(e => {
                console.error("Still could not play video after click:", e);
                setVideoError(true);
              });
              document.removeEventListener('click', handleClick);
            }
          };
          document.addEventListener('click', handleClick);
        }
      }
    };

    // Start preloading immediately
    preloadVideo();

    // Wait a moment for the video element to be properly initialized
    const timer = setTimeout(() => {
      attemptPlay();

      // Debug video element
      if (videoRef.current) {
        console.log("Video element ready state:", videoRef.current.readyState);
      }
    }, 1000);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', () => {});
    };
  }, []);
  return <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Only show the background when video hasn't started or there's an error */}
      {(!videoStarted || videoError) && <div className="absolute inset-0 bg-gradient-to-b from-cartier-red/40 to-cartier-red/70 z-0"></div>}
      
      {/* Video background with opacity 0 until loaded */}
      <video ref={videoRef} className={`absolute top-0 left-0 min-w-full min-h-full object-cover transition-opacity duration-700 ${videoStarted ? 'opacity-100' : 'opacity-0'}`} autoPlay loop muted playsInline poster="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1887&auto=format&fit=crop" onLoadedData={() => setIsVideoLoaded(true)} onError={() => setVideoError(true)} preload="auto" style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }}>
        <source src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero//Final%20Confession.mp4" type="video/mp4" onError={e => console.error("MP4 source failed:", e)} />
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
        <a href="#collection" className="btn-outline">٣١٣</a>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold">
          <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>;
};
export default Hero;
