
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session and handle any errors
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          toast({
            title: "Authentication error",
            description: sessionError.message,
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (!data.session) {
          console.error('No session found');
          setError('No session found. Please try signing in again.');
          toast({
            title: "Authentication error",
            description: "No session found. Please try signing in again.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        console.log('Authentication successful, session:', data.session);
        toast({
          title: "Successfully signed in",
        });
        navigate('/');
      } catch (err: any) {
        console.error('Unexpected error during authentication:', err);
        setError(err.message || 'An unexpected error occurred');
        toast({
          title: "Authentication error",
          description: err.message || 'An unexpected error occurred',
          variant: "destructive",
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
