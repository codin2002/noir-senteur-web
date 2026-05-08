import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventoryWithInsights } from '@/hooks/useInventoryInsights';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, TrendingUp, Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const InventoryInsights: React.FC = () => {
  const { data: rows = [] } = useInventoryWithInsights();

  const { data: unusual = [] } = useQuery({
    queryKey: ['unusual-activity'],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('inventory_logs')
        .select('id, perfume_id, quantity_change, quantity_before, quantity_after, created_at, action_category, reason, perfumes:perfume_id(name)')
        .eq('is_unusual', true)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000,
  });

  const lowStock = rows.filter(r => r.status !== 'normal').sort((a, b) => a.stock_quantity - b.stock_quantity);
  const fastMoving = [...rows].filter(r => r.avgDaily > 0).sort((a, b) => b.avgDaily - a.avgDaily).slice(0, 5);
  const deadStock = rows.filter(r => (r.daysSinceMovement === null || r.daysSinceMovement >= 30) && r.stock_quantity > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card className="bg-darker border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-gold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" /> Low / Critical Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {lowStock.length === 0 && <p className="text-xs text-muted-foreground">All products above reorder point.</p>}
          {lowStock.map(r => (
            <div key={r.id} className="flex items-center justify-between text-sm">
              <span className="truncate pr-2">{r.perfumes?.name || '—'}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-gold">{r.stock_quantity}</span>
                <Badge variant={r.status === 'critical' ? 'destructive' : 'secondary'} className="text-[10px]">
                  {r.status === 'critical' ? 'CRITICAL' : 'REORDER'}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-darker border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-gold text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Fast-Moving (30d)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {fastMoving.length === 0 && <p className="text-xs text-muted-foreground">No outgoing movement yet.</p>}
          {fastMoving.map(r => (
            <div key={r.id} className="flex items-center justify-between text-sm">
              <span className="truncate pr-2">{r.perfumes?.name || '—'}</span>
              <span className="font-mono text-green-400">{r.avgDaily.toFixed(2)}/day</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-darker border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-gold text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> Dead Stock (30d+)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {deadStock.length === 0 && <p className="text-xs text-muted-foreground">No stagnant inventory.</p>}
          {deadStock.map(r => (
            <div key={r.id} className="flex items-center justify-between text-sm">
              <span className="truncate pr-2">{r.perfumes?.name || '—'}</span>
              <span className="font-mono text-blue-300">{r.daysSinceMovement === null ? '∞' : `${r.daysSinceMovement}d`}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-darker border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-gold text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-orange-400" /> Unusual Activity (7d)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {unusual.length === 0 && <p className="text-xs text-muted-foreground">No unusual changes.</p>}
          {unusual.map((u: any) => (
            <div key={u.id} className="text-xs border border-orange-500/20 bg-orange-500/5 rounded p-2">
              <div className="flex justify-between font-medium">
                <span className="truncate pr-2">{u.perfumes?.name || '—'}</span>
                <span className={u.quantity_change > 0 ? 'text-green-400' : 'text-red-400'}>
                  {u.quantity_change > 0 ? '+' : ''}{u.quantity_change}
                </span>
              </div>
              <div className="text-muted-foreground truncate">{u.reason}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryInsights;
