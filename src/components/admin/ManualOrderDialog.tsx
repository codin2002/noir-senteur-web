import React, { FormEvent, useEffect, useState } from 'react';
import { ClipboardPlus, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type PerfumeOption = { id: string; name: string; price_value: number };
type BuilderLine = { id: string; kind: 'perfume' | 'signature_duo'; perfumeId?: string; quantity: number; unitPrice: string };
const makeLine = (kind: BuilderLine['kind']): BuilderLine => ({ id: crypto.randomUUID(), kind, quantity: 1, unitPrice: kind === 'signature_duo' ? '220' : '' });

const ManualOrderDialog: React.FC<{ onCreated: () => void }> = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [perfumes, setPerfumes] = useState<PerfumeOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [alreadyHandedOver, setAlreadyHandedOver] = useState(false);
  const [lines, setLines] = useState<BuilderLine[]>([makeLine('signature_duo')]);

  useEffect(() => {
    if (!open || perfumes.length) return;
    setLoadingProducts(true);
    supabase.from('perfumes').select('id, name, price_value').order('name')
      .then(({ data, error }) => error ? toast.error('Could not load perfumes') : setPerfumes((data || []) as PerfumeOption[]))
      .finally(() => setLoadingProducts(false));
  }, [open, perfumes.length]);

  const updateLine = (id: string, changes: Partial<BuilderLine>) => setLines((current) => current.map((line) => line.id === id ? { ...line, ...changes } : line));
  const choosePerfume = (id: string, perfumeId: string) => {
    const perfume = perfumes.find((item) => item.id === perfumeId);
    updateLine(id, { perfumeId, unitPrice: perfume ? String(perfume.price_value) : '' });
  };
  const reset = () => { setCustomerName(''); setPhone(''); setEmail(''); setAddress(''); setNotes(''); setAlreadyHandedOver(false); setLines([makeLine('signature_duo')]); };
  const total = lines.reduce((sum, line) => sum + (Number(line.unitPrice) || 0) * line.quantity, 0);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const valid = customerName.trim() && lines.length > 0 && lines.every((line) => line.quantity >= 1 && Number.isFinite(Number(line.unitPrice)) && Number(line.unitPrice) >= 0 && (line.kind === 'signature_duo' || line.perfumeId));
    if (!valid) return toast.error('Please complete every order item with a valid quantity and price.');
    setSaving(true);
    const { error } = await supabase.rpc('create_manual_order' as never, {
      p_lines: lines.map((line) => line.kind === 'signature_duo'
        ? { kind: 'signature_duo', quantity: line.quantity, unit_price: Number(line.unitPrice) }
        : { kind: 'perfume', perfume_id: line.perfumeId, quantity: line.quantity, unit_price: Number(line.unitPrice) }),
      p_customer_name: customerName.trim(), p_customer_phone: phone.trim() || null, p_customer_email: email.trim() || null,
      p_delivery_address: address.trim() || null, p_notes: notes.trim() || null, p_already_handed_over: alreadyHandedOver,
    } as never);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(alreadyHandedOver ? 'Manual entry recorded and stock updated.' : 'Manual order added to the fulfilment queue.');
    reset(); setOpen(false); onCreated();
  };

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button className="gap-2 bg-stone-900 text-white hover:bg-stone-800"><ClipboardPlus className="h-4 w-4" /> Add manual order</Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] overflow-y-auto border-stone-200 bg-white text-stone-950 sm:max-w-2xl">
      <DialogHeader><DialogTitle>Manual order or gift</DialogTitle><DialogDescription>Add a Signature Duo, individual bottles, or both in one tracked order. Stock updates automatically.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="manual-customer-name">Name *</Label><Input id="manual-customer-name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Friend or customer name" required /></div><div className="space-y-1.5"><Label htmlFor="manual-phone">Mobile number</Label><Input id="manual-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Optional" /></div><div className="space-y-1.5"><Label htmlFor="manual-email">Email</Label><Input id="manual-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Optional" /></div></div>
        <div className="space-y-1.5"><Label htmlFor="manual-address">Delivery details</Label><Input id="manual-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Optional — leave blank for a handover" /></div>
        <div className="space-y-3 rounded-lg border border-stone-200 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><Label>Order items *</Label><p className="mt-1 text-xs text-stone-500">The Duo includes one ٣١٣ and one ٤٢٤ at AED 220.</p></div><div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setLines((current) => [...current, makeLine('signature_duo')])}><Plus className="mr-1 h-3.5 w-3.5" /> Duo</Button><Button type="button" size="sm" variant="outline" onClick={() => setLines((current) => [...current, makeLine('perfume')])}><Plus className="mr-1 h-3.5 w-3.5" /> Perfume</Button></div></div>
          {lines.map((line) => <div key={line.id} className="grid gap-3 rounded-md bg-stone-50 p-3 sm:grid-cols-[minmax(0,1fr)_90px_130px_36px] sm:items-end">
            <div className="space-y-1.5"><Label>{line.kind === 'signature_duo' ? 'Bundle' : 'Perfume'}</Label>{line.kind === 'signature_duo' ? <div className="flex h-10 items-center rounded-md border border-stone-200 bg-white px-3 text-sm font-medium">Signature Duo — ٣١٣ + ٤٢٤</div> : <select value={line.perfumeId || ''} onChange={(event) => choosePerfume(line.id, event.target.value)} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm" disabled={loadingProducts} required><option value="">{loadingProducts ? 'Loading…' : 'Choose a perfume'}</option>{perfumes.map((perfume) => <option key={perfume.id} value={perfume.id}>{perfume.name}</option>)}</select>}</div>
            <div className="space-y-1.5"><Label>Qty</Label><Input type="number" min="1" value={line.quantity} onChange={(event) => updateLine(line.id, { quantity: Math.max(1, Number(event.target.value) || 1) })} required /></div>
            <div className="space-y-1.5"><Label>Line price (AED)</Label><Input type="number" min="0" step="0.01" value={line.unitPrice} onChange={(event) => updateLine(line.id, { unitPrice: event.target.value })} required /></div>
            <Button type="button" size="icon" variant="ghost" className="text-stone-500 hover:text-red-600" disabled={lines.length === 1} onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))} aria-label="Remove item"><Trash2 className="h-4 w-4" /></Button>
          </div>)}</div>
        <div className="flex items-center justify-between rounded-md bg-stone-900 px-4 py-3 text-white"><span className="text-sm text-stone-300">Order total</span><span className="text-lg font-semibold">AED {total.toFixed(2)}</span></div>
        <div className="space-y-1.5"><Label htmlFor="manual-notes">Notes</Label><Textarea id="manual-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="For example: friend gift, cash sale, or special price" /></div>
        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-stone-200 p-3 text-sm text-stone-700"><input type="checkbox" checked={alreadyHandedOver} onChange={(event) => setAlreadyHandedOver(event.target.checked)} className="mt-0.5 h-4 w-4" /><span><span className="font-medium text-stone-950">Already handed over</span><br />Mark as delivered now. Leave unticked to add it to the fulfilment queue.</span></label>
        <div className="flex justify-end gap-3 pt-2"><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" className="bg-stone-900 text-white hover:bg-stone-800" disabled={saving || loadingProducts}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save manual order</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
};

export default ManualOrderDialog;
