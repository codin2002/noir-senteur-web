import React from 'react';

const StoryCard: React.FC = () => {
  return (
    <div className="story-card-wrapper">
      <div className="story-card group relative overflow-hidden rounded-[20px] px-6 py-8 md:px-10 md:py-10 text-center">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(212,175,122,0.08), transparent 55%), radial-gradient(ellipse at bottom, rgba(212,175,122,0.04), transparent 65%)',
          }}
        />
        {/* Noise texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
        {/* Shine sweep */}
        <div className="story-shine pointer-events-none absolute inset-0 rounded-[20px]" />

        <div className="relative z-10 flex flex-col items-center gap-5">
          {/* Heading */}
          <div className="story-heading flex flex-col items-center gap-1">
            <span className="font-serif text-[11px] md:text-xs uppercase tracking-[0.35em]" style={{ color: 'rgba(212,175,122,0.7)' }}>
              The number that tells
            </span>
            <span className="font-serif text-2xl md:text-3xl tracking-[0.12em] uppercase" style={{ color: '#D4AF7A' }}>
              Our Story
            </span>
          </div>

          {/* Divider */}
          <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,122,0.5), transparent)' }} />

          {/* Body */}
          <p className="story-body max-w-md font-light leading-relaxed text-sm md:text-[15px]" style={{ color: '#B8B0A4' }}>
            Crafted by three friends united by one vision,<br className="hidden md:block" />
            313 became the beginning of our journey —<br className="hidden md:block" />
            a signature scent built on three unforgettable notes:<br className="hidden md:block" />
            <span className="font-normal" style={{ color: '#D4AF7A' }}>amber, cashmere, and oud.</span>
          </p>

          {/* Footer tagline */}
          <p className="story-tagline text-[10px] md:text-[11px] tracking-[0.3em] uppercase font-medium" style={{ color: '#D4AF7A' }}>
            3 People <span className="opacity-40 mx-1.5">•</span> 1 Vision <span className="opacity-40 mx-1.5">•</span> 3 Notes
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;
