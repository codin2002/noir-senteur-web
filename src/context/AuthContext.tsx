
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cartRestoreService } from '@/services/cartRestoreService';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isContextLoading, setIsContextLoading] = useState<boolean>(true);
  
  const {
    isLoading: operationsLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut: handleSignOut,
    forgotPassword
  } = useAuthOperations();

  const isLoading = isContextLoading || operationsLoading;

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed:", _event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsContextLoading(false);
        
        // Restore cart from localStorage on successful sign-in/sign-up
        if (_event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            cartRestoreService.restoreCartFromLocalStorage(session.user.id);
          }, 100);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Got existing session:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsContextLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Clear local state immediately to prevent UI issues
    setUser(null);
    setSession(null);
    
    try {
      await handleSignOut();
    } catch (error) {
      // Re-set user state if sign out failed
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    forgotPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
