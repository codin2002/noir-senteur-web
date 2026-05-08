import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Minus, AlertTriangle, Trash2, Pencil, Settings2, Clock } from 'lucide-react';
import { useInventoryWithInsights, InventoryRow } from '@/hooks/useInventoryInsights';
import StockActionDialog from './StockActionDialog';
import ReorderConfigDialog from './ReorderConfigDialog';
import { ActionCategory } from '@/services/inventoryActionService';

const statusBadge = (s: InventoryRow['status']) => {
  if (s === 'critical') return <Badge variant="destructive" className="text-[10px]">CRITICAL</Badge>;
  if (s === 'low') return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/40 text-[10px]">REORDER SOON</Badge>;
  return <Badge className="bg-green-500/20 text-green-700 border-green-500/40 text-[10px]">NORMAL</Badge>;
};

const InventoryManager: React.FC = () => {
  const { data: inventory = [], isLoading } = useInventoryWithInsights();
  const [actionState, setActionState] = useState<{ open: boolean; row?: InventoryRow; category: ActionCategory }>({ open: false, category: 'stock_in' });
  const [reorderState, setReorderState] = useState<{ open: boolean; row?: InventoryRow }>({ open: false });

  const openAction = (row: InventoryRow, category: ActionCategory) =>
    setActionState({ open: true, row, category });

  if (isLoading) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6 text-center">Loading inventory...</CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" /> Inventory Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {inventory.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border ${
                item.status === 'critical' ? 'border-red-500/40 bg-red-500/5' :
                item.status === 'low' ? 'border-yellow-500/40 bg-yellow-500/5' :
                'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{item.perfumes?.name}</h3>
                    {statusBadge(item.status)}
                    {item.status === 'critical' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    <span>Reorder pt: <span className="text-gray-900">{item.reorderPoint}</span></span>
                    <span>Suggested qty: <span className="text-gray-900">{item.reorderQty}</span></span>
                    <span>Lead: {item.lead_time_days}d</span>
                    <span>Safety: {item.safety_stock}</span>
                    <span>Avg/day: {item.avgDaily.toFixed(2)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.lastMovementAt ? `${item.daysSinceMovement}d ago` : 'no movement'}
                    </span>
                  </div>
                </div>

                <div className="text-center px-3">
                  <div className="text-3xl font-bold text-gray-900 leading-none">{item.stock_quantity}</div>
                  <div className="text-[10px] uppercase text-muted-foreground tracking-wider mt-1">in stock</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
                <Button size="sm" onClick={() => openAction(item, 'stock_in')} className="bg-green-600/20 text-green-700 border border-green-500/40 hover:bg-green-600/30">
                  <Plus className="w-3 h-3 mr-1" /> Stock In
                </Button>
                <Button size="sm" onClick={() => openAction(item, 'stock_out')} className="bg-red-600/20 text-red-700 border border-red-500/40 hover:bg-red-600/30">
                  <Minus className="w-3 h-3 mr-1" /> Stock Out
                </Button>
                <Button size="sm" onClick={() => openAction(item, 'damaged')} className="bg-orange-600/20 text-orange-700 border border-orange-500/40 hover:bg-orange-600/30">
                  <Trash2 className="w-3 h-3 mr-1" /> Damaged
                </Button>
                <Button size="sm" onClick={() => openAction(item, 'manual_correction')} variant="outline" className="border-gray-300 text-gray-900 hover:bg-gray-100">
                  <Pencil className="w-3 h-3 mr-1" /> Correct
                </Button>
                <Button size="sm" onClick={() => setReorderState({ open: true, row: item })} variant="outline" className="border-gray-200 text-muted-foreground hover:text-gray-900">
                  <Settings2 className="w-3 h-3 mr-1" /> Settings
                </Button>
              </div>
            </div>
          ))}

          {inventory.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No inventory items found.
            </div>
          )}
        </CardContent>
      </Card>

      {actionState.row && (
        <StockActionDialog
          open={actionState.open}
          onOpenChange={(o) => setActionState((s) => ({ ...s, open: o }))}
          perfumeId={actionState.row.perfume_id}
          perfumeName={actionState.row.perfumes?.name || ''}
          currentStock={actionState.row.stock_quantity}
          category={actionState.category}
        />
      )}

      {reorderState.row && (
        <ReorderConfigDialog
          open={reorderState.open}
          onOpenChange={(o) => setReorderState((s) => ({ ...s, open: o }))}
          perfumeId={reorderState.row.perfume_id}
          perfumeName={reorderState.row.perfumes?.name || ''}
          leadTimeDays={reorderState.row.lead_time_days}
          safetyStock={reorderState.row.safety_stock}
        />
      )}
    </>
  );
};

export default InventoryManager;
