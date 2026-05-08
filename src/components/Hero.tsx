
import React, { useEffect, useRef, useState } from 'react';

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setIsVideoLoaded(true);
    const handleVideoReady = () => {
      setIsVideoLoaded(true);
      tryPlay();
    };
    const tryPlay = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => undefined);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tryPlay();
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleVideoReady);
    video.addEventListener('loadedmetadata', handleVideoReady);
    video.addEventListener('playing', handleCanPlay);
    video.addEventListener('timeupdate', handleCanPlay);
    video.addEventListener('pause', tryPlay);
    window.addEventListener('focus', tryPlay);
    window.addEventListener('pageshow', tryPlay);
    window.addEventListener('click', tryPlay);
    window.addEventListener('touchstart', tryPlay, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    tryPlay();
    const retryPlayback = window.setInterval(tryPlay, 1200);

    return () => {
      window.clearInterval(retryPlayback);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleVideoReady);
      video.removeEventListener('loadedmetadata', handleVideoReady);
      video.removeEventListener('playing', handleCanPlay);
      video.removeEventListener('timeupdate', handleCanPlay);
      video.removeEventListener('pause', tryPlay);
      window.removeEventListener('focus', tryPlay);
      window.removeEventListener('pageshow', tryPlay);
      window.removeEventListener('click', tryPlay);
      window.removeEventListener('touchstart', tryPlay);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Black fallback while the video starts */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: '#000000',
        }}
      />

      {/* Video background */}
      <video
        ref={videoRef}
        className={`absolute top-0 left-0 min-w-full min-h-full object-cover pointer-events-none transition-opacity duration-300 ${
          isVideoLoaded ? 'opacity-100' : 'opacity-95'
        }`}
        autoPlay
        loop
        muted
        playsInline
        {...({ 'webkit-playsinline': 'true', 'x-webkit-airplay': 'deny' } as any)}
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onLoadedData={() => setIsVideoLoaded(true)}
        preload="auto"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      >
        <source
          src="https://gzddmdwgzcnikqurtnsy.supabase.co/storage/v1/object/public/video-hero//Final%20Confession.mp4"
          type="video/mp4"
        />
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
