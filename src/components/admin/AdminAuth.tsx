
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const AdminAuth: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="admin-light min-h-screen bg-white flex items-center justify-center p-6 text-gray-900">
      <Card className="w-full max-w-md bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 text-center">Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600">{user.email} is signed in, but does not have administrator access.</p>
              <Button type="button" variant="outline" onClick={() => void signOut()} className="w-full">Sign out</Button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600">Sign in with the Supabase account assigned to Senteur operations.</p>
              <Button type="button" onClick={() => navigate('/auth', { state: { from: '/admin/orders' } })} className="w-full bg-gray-900 text-white hover:bg-gray-800">Sign in to admin</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
