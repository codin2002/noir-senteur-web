
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface AdminAuthProps {
  onAuthenticated: () => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Admin login attempt:', { username, password: password.length > 0 ? '***' : 'empty' });

    try {
      // Check credentials
      if (username === 'senteur' && password === 'SenteurSAF@2025') {
        console.log('Admin credentials verified successfully');
        toast.success('Admin access granted');
        sessionStorage.setItem('admin_authenticated', 'true');
        onAuthenticated();
      } else {
        console.log('Invalid admin credentials provided');
        toast.error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-darker border-gold/20">
        <CardHeader>
          <CardTitle className="text-gold text-center">Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gold">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-dark border-gold/30"
                placeholder="Enter username"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block text-gold">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-dark border-gold/30"
                placeholder="Enter password"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold text-darker hover:bg-gold/90"
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
