import React, { useState } from 'react';
import AdminAuth from '@/components/admin/AdminAuth';
import AdminLoadingState from '@/components/admin/AdminLoadingState';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/siteConfig';
import { Construction, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ActionsInsights = () => {
  const { isAuthenticated, isCheckingAuth, handleAuthenticated, handleLogout } = useAdminAuth();
  const navigate = useNavigate();
  const [isMaintenanceOn, setIsMaintenanceOn] = useState(siteConfig.maintenanceMode);

  const handleToggle = (checked: boolean) => {
    const newValue = !checked; // checked = live, so maintenance = !checked
    siteConfig.maintenanceMode = newValue;
    setIsMaintenanceOn(newValue);
    toast.success(newValue ? 'Maintenance mode enabled' : 'Site is now live!');
  };

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
                {isMaintenanceOn ? (
                  <Construction className="h-6 w-6 text-accent" />
                ) : (
                  <Globe className="h-6 w-6 text-green-500" />
                )}
                <div>
                  <p className="text-foreground font-medium">
                    {isMaintenanceOn ? 'Under Construction' : 'Live Site'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isMaintenanceOn
                      ? 'Visitors see the "Coming Soon" page'
                      : 'Visitors see the full website'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {isMaintenanceOn ? 'Maintenance' : 'Live'}
                </span>
                <Switch
                  checked={!isMaintenanceOn}
                  onCheckedChange={handleToggle}
                />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gold/10 bg-dark/50">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Toggle the switch to instantly switch between the <strong className="text-gold">"Under Construction"</strong> page 
                and the <strong className="text-gold">full live site</strong>. Changes take effect immediately — 
                just refresh the homepage to see the result.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActionsInsights;
