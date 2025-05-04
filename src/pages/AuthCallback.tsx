
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        toast({
          title: "Authentication error",
          description: error.message,
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      toast({
        title: "Successfully signed in",
      });
      navigate('/');
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-serif mb-4">Processing authentication...</h2>
        <div className="w-16 h-16 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
