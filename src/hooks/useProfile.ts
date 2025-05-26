
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from './useOrders';
import { useProfileManagement } from './useProfileManagement';

export const useProfile = () => {
  const { user } = useAuth();
  const { orders, isLoading, fetchOrders, formatDate } = useOrders();
  const { 
    profile, 
    formData, 
    fetchProfile, 
    updateProfile, 
    handleSignOut, 
    handleChange,
    initializeFormData
  } = useProfileManagement();

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchProfile();
      initializeFormData();
    }
  }, [user]);

  return {
    user,
    orders,
    profile,
    isLoading,
    formData,
    updateProfile,
    formatDate,
    handleSignOut,
    handleChange
  };
};
