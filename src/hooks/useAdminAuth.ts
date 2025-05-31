
import { useState, useEffect } from 'react';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    console.log('AdminOrders: Checking authentication status...');
    const adminAuth = sessionStorage.getItem('admin_authenticated');
    console.log('AdminOrders: Found auth status:', adminAuth);
    
    setIsAuthenticated(adminAuth === 'true');
    setIsCheckingAuth(false);
  }, []);

  const handleAuthenticated = () => {
    console.log('AdminOrders: Authentication successful');
    setIsAuthenticated(true);
    sessionStorage.setItem('admin_authenticated', 'true');
  };

  const handleLogout = () => {
    console.log('AdminOrders: Logging out');
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isCheckingAuth,
    handleAuthenticated,
    handleLogout
  };
};
