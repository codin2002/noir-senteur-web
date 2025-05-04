
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Store the current path in localStorage when redirecting to auth
  useEffect(() => {
    if (!isLoading && !user) {
      localStorage.setItem('auth_redirect_path', location.pathname);
    }
  }, [user, isLoading, location.pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-4">Loading...</h2>
          <div className="w-16 h-16 border-4 border-t-gold border-b-gold border-r-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to auth page with return path
  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
