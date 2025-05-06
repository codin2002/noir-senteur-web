
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Collection from '@/components/Collection';
import About from '@/components/About';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    document.title = "Senteur Fragrances";
  }, []);

  return (
    <div className="min-h-screen bg-cartier-red text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Collection />
      <About />
      <Footer />
    </div>
  );
};

export default Index;
