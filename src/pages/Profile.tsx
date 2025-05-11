
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { TabsContent } from "@/components/ui/tabs";
import { useProfile } from '@/hooks/useProfile';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PurchaseHistory from '@/components/profile/PurchaseHistory';
import AccountForm from '@/components/profile/AccountForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import NotSignedIn from '@/components/common/NotSignedIn';
import { useLocation } from 'react-router-dom';

const Profile = () => {
  const { 
    user, 
    orders, 
    isLoading, 
    formData, 
    updateProfile, 
    formatDate, 
    handleSignOut,
    handleChange
  } = useProfile();
  const location = useLocation();

  useEffect(() => {
    document.title = "My Profile | Senteur Fragrances";
    
    // Get the tab from URL if available
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    // If there's a tab parameter and the element exists, scroll to it
    if (tabParam) {
      const element = document.getElementById(tabParam);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  if (!user) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-12 px-6 flex items-center justify-center">
          <NotSignedIn message="Sign in to access your profile" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <ProfileHeader title="My Profile" />

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <ProfileTabs>
              <TabsContent value="history" className="mt-0" id="history">
                <PurchaseHistory 
                  orders={orders} 
                  formatDate={formatDate} 
                />
              </TabsContent>
              
              <TabsContent value="account" id="account">
                <AccountForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSignOut={handleSignOut}
                  updateProfile={updateProfile}
                />
              </TabsContent>
            </ProfileTabs>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
