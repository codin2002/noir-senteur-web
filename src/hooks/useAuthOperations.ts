
import { useState } from 'react';
import { authService } from '@/services/authService';
import { toast as sonnerToast } from "sonner";

export const useAuthOperations = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      await authService.signUp(email, password, fullName);
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
      await authService.signIn(email, password);
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
      await authService.signInWithGoogle();
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
      await authService.signOut();
    } catch (error: any) {
      console.error("Sign out error:", error.message);
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
      await authService.forgotPassword(email);
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

  return {
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    forgotPassword
  };
};
