import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const restoreCartFromLocalStorage = async (userId: string) => {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      
      if (cartItems.length > 0) {
        console.log('Restoring cart items from localStorage:', cartItems);
        
        // First, get existing cart items to avoid duplicates
        const { data: existingItems, error: fetchError } = await supabase.rpc('get_cart_with_perfumes', {
          user_uuid: userId
        });
        
        if (fetchError) {
          console.error('Error fetching existing cart:', fetchError);
          return;
        }
        
        const existingPerfumeIds = new Set(existingItems?.map(item => item.perfume_id) || []);
        
        // Only add items that don't already exist in the database cart
        const newItems = cartItems.filter(item => !existingPerfumeIds.has(item.perfume.id));
        
        if (newItems.length > 0) {
          for (const item of newItems) {
            await supabase
              .from('cart')
              .insert({
                user_id: userId,
                perfume_id: item.perfume.id,
                quantity: item.quantity
              });
          }
          
          sonnerToast.success('Cart restored', {
            description: `${newItems.length} new item(s) restored to your cart`
          });
        }
        
        // Clear localStorage after processing
        localStorage.removeItem('cartItems');
      }
    } catch (error) {
      console.error('Error restoring cart:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed:", _event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Restore cart from localStorage on successful sign-in/sign-up
        if (_event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            restoreCartFromLocalStorage(session.user.id);
          }, 100);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Got existing session:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      console.log("Signing up with email:", email);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        console.log("Signup successful:", data.user.email);
        sonnerToast.success("Account created successfully", {
          description: "Check your email for the confirmation link."
        });
      } else {
        sonnerToast.info("Verification required", {
          description: "Check your email for the confirmation link."
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error.message);
      sonnerToast.error("Signup failed", {
        description: error.message || "An error occurred during sign up"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Signing in with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      if (data.user) {
        console.log("Sign in successful:", data.user.email);
        sonnerToast.success("Welcome back!", {
          description: `Signed in as ${data.user.email}`
        });
      }
    } catch (error: any) {
      console.error("Sign in error:", error.message);
      sonnerToast.error("Sign in failed", {
        description: error.message || "An error occurred during sign in"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("Initiating Google sign in");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error.message);
      sonnerToast.error("Google sign in failed", {
        description: error.message || "An error occurred during Google sign in"
      });
      throw error;
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      console.log("Signing out");
      
      // Clear local state immediately to prevent UI issues
      setUser(null);
      setSession(null);
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Don't throw error if session doesn't exist - user is already signed out
      if (error && error.message !== "Session not found" && !error.message.includes("session")) {
        console.error("Sign out error:", error.message);
        throw error;
      }
      
      console.log("Sign out successful");
      sonnerToast.success("Signed out successfully");
    } catch (error: any) {
      console.error("Sign out error:", error.message);
      // Re-set user state if sign out failed
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      sonnerToast.error("Sign out failed", {
        description: error.message || "An error occurred during sign out"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      console.log("Sending password reset email to:", email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      sonnerToast.success("Password reset email sent", {
        description: "Check your email for the password reset link"
      });
    } catch (error: any) {
      console.error("Password reset error:", error.message);
      sonnerToast.error("Password reset failed", {
        description: error.message || "An error occurred during password reset"
      });
      throw error;
    } finally {
      setIsLoading(false);
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
