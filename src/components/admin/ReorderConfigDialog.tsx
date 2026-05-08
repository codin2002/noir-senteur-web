import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { updateReorderConfig } from '@/services/inventoryActionService';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  perfumeId: string;
  perfumeName: string;
  leadTimeDays: number;
  safetyStock: number;
}

const ReorderConfigDialog: React.FC<Props> = ({ open, onOpenChange, perfumeId, perfumeName, leadTimeDays, safetyStock }) => {
  const [lead, setLead] = useState(leadTimeDays);
  const [safety, setSafety] = useState(safetyStock);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const save = async () => {
    if (lead < 0 || safety < 0) {
      toast.error('Values cannot be negative');
      return;
    }
    setSaving(true);
    try {
      await updateReorderConfig(perfumeId, lead, safety);
      toast.success('Reorder settings updated');
      qc.invalidateQueries({ queryKey: ['inventory'] });
      qc.invalidateQueries({ queryKey: ['inventory-insights'] });
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-50 border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Reorder Settings — {perfumeName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-gold/80">Lead Time (days)</Label>
            <Input type="number" min={0} value={lead} onChange={(e) => setLead(Number(e.target.value))} className="bg-white border-gray-300 mt-1" />
            <p className="text-xs text-muted-foreground mt-1">How many days from order to receipt.</p>
          </div>
          <div>
            <Label className="text-gold/80">Safety Stock (units)</Label>
            <Input type="number" min={0} value={safety} onChange={(e) => setSafety(Number(e.target.value))} className="bg-white border-gray-300 mt-1" />
            <p className="text-xs text-muted-foreground mt-1">Buffer to keep on hand.</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Reorder Point = Avg Daily Usage × Lead Time + Safety Stock
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-gray-900 text-white hover:bg-gray-800">{saving ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReorderConfigDialog;
