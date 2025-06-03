
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown, Package } from 'lucide-react';

interface InventoryLog {
  id: string;
  perfume_id: string;
  change_type: 'manual_adjustment' | 'order_delivery' | 'stock_addition' | 'return_processing';
  quantity_before: number;
  quantity_after: number;
  quantity_change: number;
  reason: string;
  order_id?: string;
  created_at: string;
  perfumes?: {
    name: string;
  };
}

const InventoryLogs: React.FC = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['inventory-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_logs')
        .select(`
          id,
          perfume_id,
          change_type,
          quantity_before,
          quantity_after,
          quantity_change,
          reason,
          order_id,
          created_at,
          perfumes:perfume_id (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as InventoryLog[];
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'manual_adjustment':
        return <Package className="w-4 h-4" />;
      case 'order_delivery':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'stock_addition':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'return_processing':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getChangeTypeBadge = (type: string) => {
    const variants = {
      manual_adjustment: 'secondary',
      order_delivery: 'destructive',
      stock_addition: 'success',
      return_processing: 'outline'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'secondary'}>
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card className="bg-darker border-gold/20">
        <CardContent className="p-6">
          <div className="text-center">Loading inventory logs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-darker border-gold/20">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Inventory Activity Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gold/20">
                <TableHead className="text-gold">Date</TableHead>
                <TableHead className="text-gold">Product</TableHead>
                <TableHead className="text-gold">Type</TableHead>
                <TableHead className="text-gold">Before</TableHead>
                <TableHead className="text-gold">Change</TableHead>
                <TableHead className="text-gold">After</TableHead>
                <TableHead className="text-gold">Reason</TableHead>
                <TableHead className="text-gold">Order ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id} className="border-gold/10">
                  <TableCell className="text-sm">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.perfumes?.name || 'Unknown Product'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getChangeTypeIcon(log.change_type)}
                      {getChangeTypeBadge(log.change_type)}
                    </div>
                  </TableCell>
                  <TableCell>{log.quantity_before}</TableCell>
                  <TableCell>
                    <span className={log.quantity_change > 0 ? 'text-green-400' : 'text-red-400'}>
                      {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">{log.quantity_after}</TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {log.reason}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.order_id ? (
                      <span className="text-blue-400">#{log.order_id.substring(0, 8)}</span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {(!logs || logs.length === 0) && (
            <div className="text-center text-gray-400 py-8">
              No inventory logs found. Logs will appear here when inventory changes occur.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryLogs;
