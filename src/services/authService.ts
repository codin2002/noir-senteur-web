
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from "sonner";

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
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
  },

  async signIn(email: string, password: string) {
    console.log("Signing in with email:", email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error;
    
    if (data.user) {
      console.log("Sign in successful:", data.user.email);
      sonnerToast.success("Welcome back!", {
        description: `Signed in as ${data.user.email}`
      });
    }
  },

  async signInWithGoogle() {
    console.log("Initiating Google sign in");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  },

  async signOut() {
    console.log("Signing out");
    
    const { error } = await supabase.auth.signOut();
    
    // Don't throw error if session doesn't exist - user is already signed out
    if (error && error.message !== "Session not found" && !error.message.includes("session")) {
      console.error("Sign out error:", error.message);
      throw error;
    }
    
    console.log("Sign out successful");
    sonnerToast.success("Signed out successfully");
  },

  async forgotPassword(email: string) {
    console.log("Sending password reset email to:", email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
    sonnerToast.success("Password reset email sent", {
      description: "Check your email for the password reset link"
    });
  }
};
