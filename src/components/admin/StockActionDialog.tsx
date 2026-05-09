import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { performStockAction, ActionCategory, isUnusualChange } from '@/services/inventoryActionService';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  perfumeId: string;
  perfumeName: string;
  currentStock: number;
  category: ActionCategory;
}

const CATEGORY_META: Record<ActionCategory, { title: string; defaultReason: string; refLabel: string; verb: string }> = {
  stock_in: { title: 'Stock In (Purchase / Supplier)', defaultReason: 'Stock received from supplier', refLabel: 'Supplier / Invoice #', verb: 'Add' },
  stock_out: { title: 'Stock Out (Sales / Delivery)', defaultReason: 'Stock dispatched to customer', refLabel: 'Order ID', verb: 'Remove' },
  damaged: { title: 'Damaged / Wastage', defaultReason: 'Damaged goods removed from stock', refLabel: 'Reference (optional)', verb: 'Remove' },
  manual_correction: { title: 'Manual Correction (Admin)', defaultReason: 'Manual stock recount', refLabel: 'Reference (optional)', verb: 'Set to' },
};

const StockActionDialog: React.FC<Props> = ({ open, onOpenChange, perfumeId, perfumeName, currentStock, category }) => {
  const meta = CATEGORY_META[category];
  const [quantity, setQuantity] = useState<number>(category === 'manual_correction' ? currentStock : 1);
  const [reason, setReason] = useState(meta.defaultReason);
  const [reference, setReference] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    if (open) {
      setQuantity(category === 'manual_correction' ? currentStock : 1);
      setReason(meta.defaultReason);
      setReference('');
      setConfirming(false);
    }
  }, [open, category, currentStock, meta.defaultReason]);

  const delta =
    category === 'stock_in' ? quantity :
    category === 'manual_correction' ? quantity - currentStock :
    -quantity;

  const projected = currentStock + delta;
  const wouldBeNegative = projected < 0;
  const unusual = isUnusualChange(currentStock, delta);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Reason is required');
      return;
    }
    if (quantity <= 0 && category !== 'manual_correction') {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (category === 'manual_correction' && quantity < 0) {
      toast.error('Stock cannot be negative');
      return;
    }
    if (wouldBeNegative) {
      toast.error('This would make stock negative');
      return;
    }
    if (unusual && !confirming) {
      setConfirming(true);
      return;
    }
    setSubmitting(true);
    try {
      await performStockAction({
        perfumeId,
        category,
        quantity,
        reason,
        referenceId: reference || undefined,
      });
      toast.success(`${meta.title} recorded`);
      qc.invalidateQueries({ queryKey: ['inventory'] });
      qc.invalidateQueries({ queryKey: ['inventory-logs'] });
      qc.invalidateQueries({ queryKey: ['inventory-insights'] });
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to record action');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-50 border-gray-200 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-gray-900">{meta.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{perfumeName} — current stock: <span className="text-gray-900 font-semibold">{currentStock}</span></p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-600">
              {category === 'manual_correction' ? 'New Stock Value' : 'Quantity'}
            </Label>
            <Input
              type="number"
              min={category === 'manual_correction' ? 0 : 1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="bg-white border-gray-300 mt-1 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label className="text-gray-600">Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="bg-white border-gray-300 mt-1 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label className="text-gray-600">{meta.refLabel}</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Optional"
              className="bg-white border-gray-300 mt-1 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Before</span><span className="font-mono text-gray-900 font-semibold">{currentStock}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Change</span><span className={`font-mono font-semibold ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>{delta >= 0 ? '+' : ''}{delta}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">After</span><span className={`font-mono font-semibold ${wouldBeNegative ? 'text-red-600' : 'text-gray-900'}`}>{projected}</span></div>
          </div>

          {unusual && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-200">
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              <div>
                Unusual change detected (large absolute or % movement).
                {confirming && <div className="mt-1 font-medium">Click confirm again to proceed.</div>}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || wouldBeNegative} className="bg-gray-900 text-white hover:bg-gray-800">
            {submitting ? 'Saving…' : confirming ? 'Confirm' : meta.verb}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockActionDialog;
