import { supabase } from '@/integrations/supabase/client';

export type ActionCategory = 'stock_in' | 'stock_out' | 'damaged' | 'manual_correction';

export interface StockActionInput {
  perfumeId: string;
  category: ActionCategory;
  quantity: number; // always positive
  reason: string;
  referenceId?: string;
  userName?: string;
}

const UNUSUAL_ABS = 10;
const UNUSUAL_PCT = 0.5;

export const isUnusualChange = (currentStock: number, delta: number) => {
  const abs = Math.abs(delta);
  if (abs >= UNUSUAL_ABS) return true;
  if (currentStock > 0 && abs / currentStock >= UNUSUAL_PCT) return true;
  return false;
};

export const performStockAction = async (input: StockActionInput) => {
  const { perfumeId, category, quantity, reason, referenceId, userName } = input;

  if (!quantity || quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  // Fetch current inventory
  const { data: inv, error: invErr } = await supabase
    .from('inventory')
    .select('stock_quantity')
    .eq('perfume_id', perfumeId)
    .single();

  if (invErr) throw invErr;

  const before = inv?.stock_quantity ?? 0;

  let delta = 0;
  let after = before;

  if (category === 'stock_in') {
    delta = quantity;
    after = before + quantity;
  } else if (category === 'stock_out' || category === 'damaged') {
    delta = -quantity;
    after = before - quantity;
    if (after < 0) throw new Error('Insufficient stock — cannot go below zero');
  } else if (category === 'manual_correction') {
    // For manual correction, `quantity` is the new absolute target value
    after = quantity;
    delta = after - before;
  }

  // Update inventory
  const { error: upErr } = await supabase
    .from('inventory')
    .update({ stock_quantity: after, updated_at: new Date().toISOString() })
    .eq('perfume_id', perfumeId);
  if (upErr) throw upErr;

  // Map to existing change_type values for backward compatibility
  const changeType =
    category === 'stock_in'
      ? 'stock_addition'
      : category === 'stock_out'
      ? 'order_delivery'
      : 'manual_adjustment';

  const unusual = isUnusualChange(before, delta);

  const { error: logErr } = await supabase.from('inventory_logs').insert({
    perfume_id: perfumeId,
    change_type: changeType,
    quantity_before: before,
    quantity_after: after,
    quantity_change: delta,
    reason,
    action_category: category,
    reference_id: referenceId || null,
    user_name: userName || 'admin',
    is_unusual: unusual,
  });
  if (logErr) throw logErr;

  return { before, after, delta, unusual };
};

export const updateReorderConfig = async (
  perfumeId: string,
  leadTimeDays: number,
  safetyStock: number
) => {
  const { error } = await supabase
    .from('inventory')
    .update({
      lead_time_days: leadTimeDays,
      safety_stock: safetyStock,
      updated_at: new Date().toISOString(),
    })
    .eq('perfume_id', perfumeId);
  if (error) throw error;
};

export const calcReorderPoint = (avgDaily: number, leadDays: number, safety: number) =>
  Math.ceil(avgDaily * leadDays + safety);

export const calcReorderQty = (avgDaily: number, leadDays: number, safety: number) =>
  Math.max(Math.ceil(avgDaily * leadDays * 2 + safety), 5);
