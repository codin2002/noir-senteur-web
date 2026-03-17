
import React, { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    document.title = "Senteur Fragrances — Coming Soon";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <h1 className="text-4xl md:text-6xl font-serif tracking-[0.3em] text-foreground mb-2">
        SENTEUR
      </h1>
      <div className="w-16 h-[1px] bg-accent mx-auto mb-12" />

      {/* Message */}
      <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide mb-4">
        WEBSITE UNDER CONSTRUCTION
      </p>
      <p className="text-sm text-muted-foreground/70 max-w-md leading-relaxed">
        We're crafting something extraordinary. Our new collection will be available soon.
      </p>

      {/* Decorative line */}
      <div className="w-8 h-[1px] bg-accent/40 mx-auto mt-16 mb-6" />

      <p className="text-xs text-muted-foreground/50 tracking-widest uppercase">
        Senteur Fragrances
      </p>
    </div>
  );
};

export default Index;
