
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PerfumeForm from '@/components/admin/PerfumeForm';
import PerfumeTable from '@/components/admin/PerfumeTable';

const Admin = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    document.title = "Senteur Fragrances - Admin";
  }, []);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-cartier-red text-white">
      <Navbar />
      <div className="pt-24 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif mb-8">Admin Dashboard</h1>
        
        <div className="space-y-12">
          <div className="bg-darker/50 rounded-lg p-6">
            <h2 className="text-2xl font-serif mb-6">Add New Perfume</h2>
            <PerfumeForm />
          </div>
          
          <div className="bg-darker/50 rounded-lg p-6">
            <h2 className="text-2xl font-serif mb-6">Manage Perfumes</h2>
            <PerfumeTable />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
