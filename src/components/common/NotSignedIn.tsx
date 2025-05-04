
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface NotSignedInProps {
  message?: string;
}

const NotSignedIn: React.FC<NotSignedInProps> = ({ 
  message = "Please sign in to view this content"
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h2 className="text-xl mb-4">{message}</h2>
      <Button 
        variant="outline"
        className="border-gold text-gold hover:bg-gold hover:text-darker"
        onClick={() => navigate('/auth')}
      >
        Sign In
      </Button>
    </div>
  );
};

export default NotSignedIn;
