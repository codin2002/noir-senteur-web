
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { user, isLoading: isAuthLoading, signOut } = useAuth();

  useEffect(() => {
    let active = true;
    const checkRole = async () => {
      if (isAuthLoading) return;
      if (!user) {
        if (active) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
        return;
      }
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      if (active) {
        setIsAuthenticated(!error && Boolean(data));
        setIsCheckingAuth(false);
      }
    };
    setIsCheckingAuth(true);
    void checkRole();
    return () => { active = false; };
  }, [user, isAuthLoading]);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await signOut();
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isCheckingAuth,
    handleAuthenticated,
    handleLogout,
    user
  };
};
