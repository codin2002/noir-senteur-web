
import { supabase } from '@/integrations/supabase/client';

export const logInventoryChange = async (
  perfumeId: string,
  changeType: 'manual_adjustment' | 'order_delivery' | 'stock_addition' | 'return_processing',
  quantityBefore: number,
  quantityAfter: number,
  reason: string,
  orderId?: string
) => {
  try {
    const { error } = await supabase
      .from('inventory_logs')
      .insert({
        perfume_id: perfumeId,
        change_type: changeType,
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        quantity_change: quantityAfter - quantityBefore,
        reason,
        order_id: orderId
      });

    if (error) {
      console.error('❌ Error logging inventory change:', error);
    } else {
      console.log('✅ Inventory change logged successfully');
    }
  } catch (error) {
    console.error('❌ Failed to log inventory change:', error);
  }
};
