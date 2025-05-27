
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Profile from '@/pages/Profile';
import Cart from '@/pages/Cart';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/AuthCallback';
import PaymentSuccess from '@/components/PaymentSuccess';
import PaymentFailed from '@/pages/PaymentFailed';
import PerfumeDetail from '@/pages/PerfumeDetail';
import Wishlist from '@/pages/Wishlist';
import NotFound from '@/pages/NotFound';
import TermsConditions from '@/pages/TermsConditions';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import ShippingPolicy from '@/pages/ShippingPolicy';
import ContactUs from '@/pages/ContactUs';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failed" element={<PaymentFailed />} />
      <Route path="/perfume/:id" element={<PerfumeDetail />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/shipping-policy" element={<ShippingPolicy />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
