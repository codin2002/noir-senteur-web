import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Clock, PackagePlus, Save, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PerfumeRow {
  id: string;
  name: string;
  product_type: string;
  preorder_enabled: boolean;
  preorder_start_date: string | null;
  preorder_end_date: string | null;
  expected_shipping_date: string | null;
  preorder_limit: number | null;
  preorder_count: number;
}

const toLocalInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

const PreorderManager: React.FC = () => {
  const [rows, setRows] = useState<PerfumeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [receiveQty, setReceiveQty] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('perfumes')
      .select('id, name, product_type, preorder_enabled, preorder_start_date, preorder_end_date, expected_shipping_date, preorder_limit, preorder_count')
      .order('name');
    if (error) toast.error('Failed to load perfumes');
    setRows((data as PerfumeRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRow = (id: string, patch: Partial<PerfumeRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const save = async (row: PerfumeRow) => {
    setSavingId(row.id);
    const { error } = await supabase
      .from('perfumes')
      .update({
        preorder_enabled: row.preorder_enabled,
        product_type: row.preorder_enabled ? 'preorder' : (row.product_type === 'preorder' ? 'in_stock' : row.product_type),
        preorder_start_date: row.preorder_start_date,
        preorder_end_date: row.preorder_end_date,
        expected_shipping_date: row.expected_shipping_date,
        preorder_limit: row.preorder_limit,
      })
      .eq('id', row.id);
    setSavingId(null);
    if (error) return toast.error('Save failed', { description: error.message });
    toast.success('Preorder settings saved');
    load();
  };

  const receiveStock = async (row: PerfumeRow) => {
    const qty = parseInt(receiveQty[row.id] || '0', 10);
    if (!qty || qty <= 0) return toast.error('Enter a quantity');
    const { data, error } = await supabase.rpc('receive_stock_and_fulfill_preorders', {
      _perfume_id: row.id,
      _quantity: qty,
      _notes: 'Stock received via admin',
    });
    if (error) return toast.error('Failed', { description: error.message });
    const r = (data as any)?.[0];
    toast.success(`Received ${qty} units. Fulfilled ${r?.fulfilled_items ?? 0} preorder unit(s).`);
    setReceiveQty((s) => ({ ...s, [row.id]: '' }));
    load();
  };

  if (loading) {
    return (
      <Card className="bg-darker border-gray-200">
        <CardContent className="p-6 text-center">Loading preorder settings...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-darker border-gray-200">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <Clock className="w-5 h-5" /> Preorder Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row) => {
          const remaining = row.preorder_limit != null ? Math.max(row.preorder_limit - row.preorder_count, 0) : null;
          return (
            <div key={row.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-lg">{row.name}</h3>
                  {row.preorder_enabled && (
                    <Badge className="bg-gold/20 text-gold border-gray-300 text-[10px]">PREORDER ON</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {row.preorder_count} preordered
                    {remaining != null ? ` · ${remaining} left` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`enabled-${row.id}`} className="text-xs">Enabled</Label>
                  <Switch
                    id={`enabled-${row.id}`}
                    checked={row.preorder_enabled}
                    onCheckedChange={(v) => updateRow(row.id, { preorder_enabled: v })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Start</Label>
                  <Input
                    type="datetime-local"
                    value={toLocalInput(row.preorder_start_date)}
                    onChange={(e) => updateRow(row.id, { preorder_start_date: fromLocalInput(e.target.value) })}
                    className="bg-dark border-gray-200"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">End</Label>
                  <Input
                    type="datetime-local"
                    value={toLocalInput(row.preorder_end_date)}
                    onChange={(e) => updateRow(row.id, { preorder_end_date: fromLocalInput(e.target.value) })}
                    className="bg-dark border-gray-200"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Expected ship</Label>
                  <Input
                    type="datetime-local"
                    value={toLocalInput(row.expected_shipping_date)}
                    onChange={(e) => updateRow(row.id, { expected_shipping_date: fromLocalInput(e.target.value) })}
                    className="bg-dark border-gray-200"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Limit (optional)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={row.preorder_limit ?? ''}
                    onChange={(e) => updateRow(row.id, { preorder_limit: e.target.value ? parseInt(e.target.value, 10) : null })}
                    className="bg-dark border-gray-200"
                    placeholder="No limit"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-end pt-2 border-t border-gray-200">
                <Button size="sm" onClick={() => save(row)} disabled={savingId === row.id} className="bg-gray-900 text-white hover:bg-gold/80">
                  <Save className="w-3 h-3 mr-1" /> {savingId === row.id ? 'Saving...' : 'Save'}
                </Button>
                <div className="flex-1 flex items-end gap-2 min-w-[200px]">
                  <div className="flex-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">Receive stock qty</Label>
                    <Input
                      type="number"
                      min={1}
                      value={receiveQty[row.id] || ''}
                      onChange={(e) => setReceiveQty((s) => ({ ...s, [row.id]: e.target.value }))}
                      className="bg-dark border-gray-200"
                      placeholder="e.g. 50"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => receiveStock(row)}
                    className="bg-green-600/20 text-green-300 border border-green-500/40 hover:bg-green-600/30"
                  >
                    <PackagePlus className="w-3 h-3 mr-1" /> Receive & Fulfill
                  </Button>
                </div>
              </div>
              {row.preorder_count > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Receiving stock fulfills oldest preorders first (FIFO).
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PreorderManager;
