
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import AdminOrders from '@/pages/AdminOrders';
import ActionsInsights from '@/pages/ActionsInsights';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/actions" element={<ActionsInsights />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
