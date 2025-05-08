
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Collection from '@/components/Collection';
import PerfumeSlider from '@/components/PerfumeSlider';
import About from '@/components/About';
import Footer from '@/components/Footer';
import { createStorageBucket } from '@/lib/supabase';

const Index = () => {
  useEffect(() => {
    document.title = "Senteur Fragrances";
    // Create storage bucket if it doesn't exist
    createStorageBucket();
  }, []);

  return (
    <div className="min-h-screen bg-cartier-red text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Collection />
      <PerfumeSlider />
      <About />
      <Footer />
    </div>
  );
};

export default Index;
