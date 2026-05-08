import React, { useState } from 'react';
import { X } from 'lucide-react';

const QATAR_URL = 'https://www.aurabelleperfumes.com/category/senteur';

const RegionBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(
    typeof window !== 'undefined' && sessionStorage.getItem('region-banner-dismissed') === '1'
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('region-banner-dismissed', '1');
    setDismissed(true);
  };

  return (
    <div className="relative z-[60] bg-gradient-to-r from-darker via-dark to-darker border-b border-gold/20 text-white text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-2 flex items-center justify-center gap-3 text-center">
        <span className="text-muted-foreground">
          Currently shopping: <span className="text-white font-medium">🇦🇪 UAE</span>
        </span>
        <span className="hidden sm:inline text-muted-foreground">·</span>
        <span className="text-muted-foreground hidden sm:inline">Shopping from Qatar?</span>
        <a
          href={QATAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:text-gold/80 underline-offset-4 hover:underline font-medium tracking-wide"
        >
          Visit our Qatar Store →
        </a>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default RegionBanner;
