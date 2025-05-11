
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Processing authentication callback...");
        // Get the session and handle any errors
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError("Authentication failed. Please try again.");
          sonnerToast.error("Authentication error", {
            description: "Authentication failed. Please try again."
          });
          navigate('/auth');
          return;
        }

        if (!data.session) {
          console.error('No session found');
          setError('No session found. Please try signing in again.');
          sonnerToast.error("Authentication error", {
            description: "No session found. Please try signing in again."
          });
          navigate('/auth');
          return;
        }

        console.log('Authentication successful');
        sonnerToast.success("Successfully signed in", {
          description: `Welcome to senteurfragrances.com!`
        });
        
        // Check if there was a previous location the user was trying to access
        const storedPath = localStorage.getItem('auth_redirect_path');
        const redirectTo = storedPath || '/';
        
        if (storedPath) {
          localStorage.removeItem('auth_redirect_path');
        }
        
        navigate(redirectTo);
      } catch (err: any) {
        console.error('Unexpected error during authentication:', err);
        setError('An unexpected error occurred');
        sonnerToast.error("Authentication error", {
          description: 'An unexpected error occurred'
        });
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-serif mb-4">Processing authentication...</h2>
        <div className="w-16 h-16 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        {error && (
          <div className="mt-4 text-red-500">
            <p>{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              You will be redirected to the login page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
