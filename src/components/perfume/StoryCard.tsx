import React from 'react';

const StoryCard: React.FC = () => {
  return (
    <div className="story-card-wrapper max-w-xl mx-auto">
      <div className="story-card group relative overflow-hidden rounded-none px-5 py-5 md:px-8 md:py-6 text-center">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(212,175,122,0.08), transparent 55%), radial-gradient(ellipse at bottom, rgba(212,175,122,0.04), transparent 65%)',
          }}
        />
        {/* Shine sweep */}
        <div className="story-shine pointer-events-none absolute inset-0 rounded-none" />

        <div className="relative z-10 flex flex-col items-center gap-3">
          {/* Heading */}
          <div className="story-heading flex flex-col items-center gap-0.5">
            <span className="font-serif text-[10px] md:text-[11px] uppercase tracking-[0.35em]" style={{ color: 'rgba(212,175,122,0.7)' }}>
              The number that tells
            </span>
            <span className="font-serif text-xl md:text-2xl tracking-[0.12em] uppercase" style={{ color: '#D4AF7A' }}>
              Our Story
            </span>
          </div>

          {/* Divider */}
          <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,122,0.5), transparent)' }} />

          {/* Body */}
          <p className="story-body max-w-md font-light leading-snug text-[13px] md:text-sm" style={{ color: '#B8B0A4' }}>
            Crafted by three friends united by one vision, 313 became the beginning of our journey — a signature scent built on three unforgettable notes:{' '}
            <span className="font-normal" style={{ color: '#D4AF7A' }}>amber, cashmere, and oud.</span>
          </p>

          {/* Footer tagline */}
          <p className="story-tagline text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: '#D4AF7A' }}>
            3 People <span className="opacity-40 mx-1">•</span> 1 Vision <span className="opacity-40 mx-1">•</span> 3 Notes
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
