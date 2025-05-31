
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

  // Function to ensure user profile exists
  const ensureUserProfile = async (user: User) => {
    try {
      console.log('Checking/creating profile for user:', user.id);
      
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating new profile for user:', user.id);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      user.email?.split('@')[0] || '',
            avatar_url: user.user_metadata?.avatar_url || null
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          console.log('Profile created successfully:', newProfile);
        }
      } else if (existingProfile) {
        console.log('Profile already exists for user:', user.id);
      } else if (fetchError) {
        console.error('Error checking profile:', fetchError);
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsContextLoading(false);
        
        // Ensure profile exists for authenticated users
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          setTimeout(() => {
            ensureUserProfile(session.user);
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
      
      // Ensure profile exists for existing session
      if (session?.user) {
        setTimeout(() => {
          ensureUserProfile(session.user);
        }, 100);
      }
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
