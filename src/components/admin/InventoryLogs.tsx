import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, AlertTriangle } from 'lucide-react';

interface InventoryLog {
  id: string;
  perfume_id: string;
  change_type: string;
  action_category: string | null;
  quantity_before: number;
  quantity_after: number;
  quantity_change: number;
  reason: string;
  reference_id: string | null;
  user_name: string | null;
  is_unusual: boolean;
  order_id?: string | null;
  created_at: string;
  perfumes?: { name: string } | null;
}

const CATEGORY_LABEL: Record<string, { label: string; cls: string }> = {
  stock_in: { label: 'Stock In', cls: 'bg-green-500/20 text-green-300 border-green-500/40' },
  stock_out: { label: 'Stock Out', cls: 'bg-red-500/20 text-red-300 border-red-500/40' },
  damaged: { label: 'Damaged', cls: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  manual_correction: { label: 'Manual Correction', cls: 'bg-gold/20 text-gold border-gold/40' },
  // legacy fallback
  order_delivery: { label: 'Order Delivery', cls: 'bg-red-500/20 text-red-300 border-red-500/40' },
  manual_adjustment: { label: 'Manual Adjustment', cls: 'bg-gold/20 text-gold border-gold/40' },
  stock_addition: { label: 'Stock Addition', cls: 'bg-green-500/20 text-green-300 border-green-500/40' },
};

const InventoryLogs: React.FC = () => {
  const [productFilter, setProductFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['inventory-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_logs')
        .select(`id, perfume_id, change_type, action_category, quantity_before, quantity_after, quantity_change, reason, reference_id, user_name, is_unusual, order_id, created_at, perfumes:perfume_id(name)`)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as InventoryLog[];
    },
    refetchInterval: 10000,
  });

  const products = useMemo(() => {
    const m = new Map<string, string>();
    logs.forEach(l => { if (l.perfume_id) m.set(l.perfume_id, l.perfumes?.name || 'Unknown'); });
    return Array.from(m.entries());
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (productFilter !== 'all' && l.perfume_id !== productFilter) return false;
      if (actionFilter !== 'all') {
        const cat = l.action_category || l.change_type;
        if (cat !== actionFilter) return false;
      }
      if (dateFrom && l.created_at < new Date(dateFrom).toISOString()) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (l.created_at > end.toISOString()) return false;
      }
      return true;
    });
  }, [logs, productFilter, actionFilter, dateFrom, dateTo]);

  if (isLoading) {
    return (
      <Card className="bg-darker border-gold/20">
        <CardContent className="p-6 text-center">Loading inventory logs...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-darker border-gold/20">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <Activity className="w-5 h-5" /> Inventory Activity Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="bg-dark border-gold/30"><SelectValue placeholder="Product" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              {products.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="bg-dark border-gold/30"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="stock_in">Stock In</SelectItem>
              <SelectItem value="stock_out">Stock Out</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
              <SelectItem value="manual_correction">Manual Correction</SelectItem>
              <SelectItem value="order_delivery">Order Delivery (legacy)</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-dark border-gold/30" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-dark border-gold/30" />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gold/20">
                <TableHead className="text-gold">Date</TableHead>
                <TableHead className="text-gold">Product</TableHead>
                <TableHead className="text-gold">Action</TableHead>
                <TableHead className="text-gold">Before</TableHead>
                <TableHead className="text-gold">Change</TableHead>
                <TableHead className="text-gold">After</TableHead>
                <TableHead className="text-gold">User</TableHead>
                <TableHead className="text-gold">Reference</TableHead>
                <TableHead className="text-gold">Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => {
                const cat = log.action_category || log.change_type;
                const meta = CATEGORY_LABEL[cat] || { label: cat, cls: 'bg-muted/20' };
                return (
                  <TableRow key={log.id} className={`border-gold/10 ${log.is_unusual ? 'bg-yellow-500/5' : ''}`}>
                    <TableCell className="text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{log.perfumes?.name || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={`${meta.cls} text-[10px]`} variant="outline">{meta.label}</Badge>
                        {log.is_unusual && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.quantity_before}</TableCell>
                    <TableCell className={`font-mono text-sm ${log.quantity_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-semibold text-gold">{log.quantity_after}</TableCell>
                    <TableCell className="text-xs">{log.user_name || (log.order_id ? 'system' : '—')}</TableCell>
                    <TableCell className="text-xs">
                      {log.reference_id ? log.reference_id : log.order_id ? <span className="text-blue-400">#{log.order_id.substring(0, 8)}</span> : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate" title={log.reason}>{log.reason}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground py-8">No matching log entries.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryLogs;
