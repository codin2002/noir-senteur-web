
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Collection from '@/components/Collection';
import About from '@/components/About';
import Footer from '@/components/Footer';
import { createStorageBucket } from '@/lib/supabase';

const Index = () => {
  useEffect(() => {
    document.title = "Senteur Fragrances";
    // Create storage bucket if it doesn't exist
    createStorageBucket();
    
    // Check if there's a hash in the URL to scroll to that section
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Small delay to ensure elements are rendered
    }
  }, []);

  return (
    <div className="min-h-screen bg-cartier-red text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <div id="collection">
        <Collection />
      </div>
      <div id="about">
        <About />
      </div>
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
