import React, { FormEvent, useEffect, useState } from 'react';
import { ClipboardPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type PerfumeOption = { id: string; name: string; price_value: number };

interface ManualOrderDialogProps {
  onCreated: () => void;
}

const ManualOrderDialog: React.FC<ManualOrderDialogProps> = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [perfumes, setPerfumes] = useState<PerfumeOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [perfumeId, setPerfumeId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [alreadyHandedOver, setAlreadyHandedOver] = useState(false);

  useEffect(() => {
    if (!open || perfumes.length) return;
    setLoadingProducts(true);
    supabase
      .from('perfumes')
      .select('id, name, price_value')
      .order('name')
      .then(({ data, error }) => {
        if (error) toast.error('Could not load perfumes');
        else setPerfumes((data || []) as PerfumeOption[]);
      })
      .finally(() => setLoadingProducts(false));
  }, [open, perfumes.length]);

  const reset = () => {
    setCustomerName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setPerfumeId('');
    setQuantity(1);
    setUnitPrice('');
    setNotes('');
    setAlreadyHandedOver(false);
  };

  const selectPerfume = (value: string) => {
    setPerfumeId(value);
    const perfume = perfumes.find((item) => item.id === value);
    if (perfume) setUnitPrice(String(perfume.price_value));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const price = Number(unitPrice);
    if (!customerName.trim() || !perfumeId || !Number.isFinite(price) || price < 0 || quantity < 1) {
      toast.error('Please add a name, perfume, quantity and valid price.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc('create_manual_order' as never, {
      p_perfume_id: perfumeId,
      p_quantity: quantity,
      p_unit_price: price,
      p_customer_name: customerName.trim(),
      p_customer_phone: phone.trim() || null,
      p_customer_email: email.trim() || null,
      p_delivery_address: address.trim() || null,
      p_notes: notes.trim() || null,
      p_already_handed_over: alreadyHandedOver,
    } as never);
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(alreadyHandedOver ? 'Manual entry recorded and stock updated.' : 'Manual order added to the fulfilment queue.');
    reset();
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-stone-900 text-white hover:bg-stone-800"><ClipboardPlus className="h-4 w-4" /> Add manual order</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-stone-200 bg-white text-stone-950 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Manual order or gift</DialogTitle>
          <DialogDescription>Record an offline sale or gift. It will reduce stock and appear with your other orders.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="manual-customer-name">Name *</Label>
              <Input id="manual-customer-name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Friend or customer name" required />
            </div>
            <div className="space-y-1.5"><Label htmlFor="manual-phone">Mobile number</Label><Input id="manual-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Optional" /></div>
            <div className="space-y-1.5"><Label htmlFor="manual-email">Email</Label><Input id="manual-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Optional" /></div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manual-address">Delivery details</Label>
            <Input id="manual-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Optional — leave blank for a handover" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="manual-perfume">Perfume *</Label>
              <select id="manual-perfume" value={perfumeId} onChange={(event) => selectPerfume(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" disabled={loadingProducts} required>
                <option value="">{loadingProducts ? 'Loading perfumes…' : 'Choose a perfume'}</option>
                {perfumes.map((perfume) => <option key={perfume.id} value={perfume.id}>{perfume.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><Label htmlFor="manual-quantity">Quantity *</Label><Input id="manual-quantity" type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} required /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="manual-price">Price per perfume (AED) *</Label><Input id="manual-price" type="number" min="0" step="0.01" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} required /></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="manual-notes">Notes</Label><Textarea id="manual-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="For example: friend gift, cash sale, or special price" /></div>
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-stone-200 p-3 text-sm text-stone-700">
            <input type="checkbox" checked={alreadyHandedOver} onChange={(event) => setAlreadyHandedOver(event.target.checked)} className="mt-0.5 h-4 w-4" />
            <span><span className="font-medium text-stone-950">Already handed over</span><br />Mark as delivered now. Leave unticked to add it to the fulfilment queue.</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" className="bg-stone-900 text-white hover:bg-stone-800" disabled={saving || loadingProducts}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save manual order</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualOrderDialog;
