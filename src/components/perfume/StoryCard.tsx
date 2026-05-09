import React from 'react';

const StoryCard: React.FC = () => {
  return (
    <div className="story-card-wrapper animate-fade-in">
      <div className="story-card group relative overflow-hidden rounded-[24px] px-8 py-12 md:px-12 md:py-16 text-center">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(212,175,122,0.10), transparent 60%), radial-gradient(ellipse at bottom, rgba(212,175,122,0.06), transparent 70%)',
          }}
        />
        {/* Noise texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
        {/* Shine sweep */}
        <div className="story-shine pointer-events-none absolute inset-0 rounded-[24px]" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="story-numeral font-serif text-6xl md:text-7xl tracking-wider"
            style={{ color: '#D4AF7A', textShadow: '0 0 30px rgba(212,175,122,0.25)' }}>
            ٣١٣
          </div>

          <div className="mt-6 h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,122,0.6), transparent)' }} />

          <p className="story-line mt-6 text-sm md:text-base uppercase tracking-[0.3em]" style={{ color: '#D4AF7A' }}>
            The number that tells our story
          </p>

          <p className="story-line story-delay-1 mt-6 max-w-xl font-light leading-relaxed text-base md:text-lg" style={{ color: '#EDE7DD' }}>
            Crafted by three friends united by one vision,
            <br className="hidden md:block" />
            313 became the beginning of our journey — a signature scent built on three unforgettable notes:
            <span className="italic" style={{ color: '#D4AF7A' }}> amber, cashmere, and oud.</span>
          </p>

          <div className="mt-8 h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,122,0.6), transparent)' }} />

          <p className="story-line story-delay-2 mt-6 text-xs md:text-sm tracking-[0.4em] uppercase" style={{ color: '#D4AF7A' }}>
            3 people <span className="opacity-50 mx-2">•</span> 1 vision <span className="opacity-50 mx-2">•</span> 3 notes
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
