import React from 'react';
import AdminAuth from '@/components/admin/AdminAuth';
import AdminLoadingState from '@/components/admin/AdminLoadingState';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/siteConfig';
import { Construction, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActionsInsights = () => {
  const { isAuthenticated, isCheckingAuth, handleAuthenticated, handleLogout } = useAdminAuth();
  const navigate = useNavigate();

  if (isCheckingAuth) return <AdminLoadingState />;
  if (!isAuthenticated) return <AdminAuth onAuthenticated={handleAuthenticated} />;

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/orders')}
              className="text-gold hover:text-gold-light"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-serif text-gold">Actions & Insights</h1>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-gold/30 text-gold hover:bg-gold/10"
          >
            Logout
          </Button>
        </div>

        {/* Maintenance Mode Card */}
        <Card className="bg-darker border-gold/20">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <Construction className="h-5 w-5" />
              Site Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-dark border border-gold/10">
              <div className="flex items-center gap-3">
                {siteConfig.maintenanceMode ? (
                  <Construction className="h-6 w-6 text-accent" />
                ) : (
                  <Globe className="h-6 w-6 text-green-500" />
                )}
                <div>
                  <p className="text-foreground font-medium">
                    {siteConfig.maintenanceMode ? 'Under Construction' : 'Live Site'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {siteConfig.maintenanceMode
                      ? 'Visitors see the "Coming Soon" page'
                      : 'Visitors see the full website'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {siteConfig.maintenanceMode ? 'Maintenance' : 'Live'}
                </span>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  siteConfig.maintenanceMode
                    ? 'bg-accent/20 text-accent'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {siteConfig.maintenanceMode ? 'ON' : 'OFF'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gold/10 bg-dark/50">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-gold">How to toggle:</strong> Edit{' '}
                <code className="px-1.5 py-0.5 rounded bg-secondary text-accent text-xs">
                  src/config/siteConfig.ts
                </code>{' '}
                and set <code className="px-1.5 py-0.5 rounded bg-secondary text-accent text-xs">maintenanceMode</code>{' '}
                to <code className="px-1.5 py-0.5 rounded bg-secondary text-accent text-xs">false</code> to go live, 
                or <code className="px-1.5 py-0.5 rounded bg-secondary text-accent text-xs">true</code> for maintenance. 
                Then publish the site.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActionsInsights;
