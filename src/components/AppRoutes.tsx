
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Cart from '@/pages/Cart';
import Wishlist from '@/pages/Wishlist';
import PerfumeDetail from '@/pages/PerfumeDetail';
import PaymentFailed from '@/pages/PaymentFailed';
import AuthCallback from '@/pages/AuthCallback';
import ContactUs from '@/pages/ContactUs';
import TermsConditions from '@/pages/TermsConditions';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import ShippingPolicy from '@/pages/ShippingPolicy';
import NotFound from '@/pages/NotFound';
import AdminOrders from '@/pages/AdminOrders';
import { PaymentSuccess } from '@/components/PaymentSuccess';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/perfume/:id" element={<PerfumeDetail />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/terms" element={<TermsConditions />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/shipping" element={<ShippingPolicy />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
