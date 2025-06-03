
import { supabase } from '@/integrations/supabase/client';
import { logInventoryChange } from './inventoryLoggingService';

interface OrderItem {
  perfume_id: string;
  quantity: number;
}

export const reduceInventoryForOrder = async (orderId: string) => {
  console.log('🔄 Starting inventory reduction for order:', orderId);

  // First, get the order items
  const { data: orderItems, error: orderError } = await supabase
    .from('order_items')
    .select('perfume_id, quantity')
    .eq('order_id', orderId);

  if (orderError) {
    console.error('❌ Error fetching order items:', orderError);
    throw orderError;
  }

  if (!orderItems || orderItems.length === 0) {
    console.warn('⚠️ No order items found for order:', orderId);
    return;
  }

  console.log('📦 Order items found:', orderItems);

  // For each item, reduce the inventory and log the change
  for (const item of orderItems as OrderItem[]) {
    console.log(`🔽 Processing perfume ${item.perfume_id}, reducing ${item.quantity} units`);

    // Get current inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('stock_quantity, id')
      .eq('perfume_id', item.perfume_id)
      .single();

    if (inventoryError) {
      console.error('❌ Error fetching inventory for perfume:', item.perfume_id, inventoryError);
      // If no inventory record exists, create one with 0 stock
      if (inventoryError.code === 'PGRST116') {
        console.log('📝 Creating new inventory record for perfume:', item.perfume_id);
        const { error: createError } = await supabase
          .from('inventory')
          .insert({
            perfume_id: item.perfume_id,
            stock_quantity: 0,
            low_stock_threshold: 5
          });
        
        if (createError) {
          console.error('❌ Error creating inventory record:', createError);
          throw createError;
        }

        // Log the creation with zero reduction
        await logInventoryChange(
          item.perfume_id,
          'order_delivery',
          0,
          0,
          `Order delivery - No stock available (Order: ${orderId.substring(0, 8)})`,
          orderId
        );

        console.log('✅ Created inventory record with 0 stock for perfume:', item.perfume_id);
        continue;
      }
      throw inventoryError;
    }

    if (!inventory) {
      console.warn('⚠️ No inventory record found for perfume:', item.perfume_id);
      continue;
    }

    const currentStock = inventory.stock_quantity;
    const newQuantity = Math.max(0, currentStock - item.quantity);
    
    console.log(`📊 Inventory update: ${item.perfume_id} | Current: ${currentStock} | Reducing: ${item.quantity} | New: ${newQuantity}`);
    
    // Update inventory with explicit logging
    console.log(`🔄 Updating inventory in database for perfume ${item.perfume_id}...`);
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ 
        stock_quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('perfume_id', item.perfume_id);

    if (updateError) {
      console.error('❌ Error updating inventory for perfume:', item.perfume_id, updateError);
      throw updateError;
    }

    console.log(`✅ Database update successful for ${item.perfume_id}: ${currentStock} → ${newQuantity}`);

    // Log the inventory change
    console.log(`📝 Logging inventory change for perfume ${item.perfume_id}...`);
    await logInventoryChange(
      item.perfume_id,
      'order_delivery',
      currentStock,
      newQuantity,
      `Inventory reduced for delivered order (Order: ${orderId.substring(0, 8)})`,
      orderId
    );

    console.log(`✅ Successfully updated and logged inventory for ${item.perfume_id}: ${currentStock} → ${newQuantity}`);
  }

  console.log('🎉 Inventory reduction completed successfully for order:', orderId);
};

export const adjustInventoryManually = async (
  perfumeId: string, 
  newQuantity: number, 
  reason: string
) => {
  console.log(`🔧 Manual inventory adjustment for perfume ${perfumeId}: new quantity = ${newQuantity}`);
  
  // Get current inventory
  const { data: inventory, error: fetchError } = await supabase
    .from('inventory')
    .select('stock_quantity')
    .eq('perfume_id', perfumeId)
    .single();

  if (fetchError) {
    console.error('❌ Error fetching current inventory:', fetchError);
    throw fetchError;
  }

  const currentStock = inventory.stock_quantity;
  console.log(`📊 Current stock: ${currentStock}, New quantity: ${newQuantity}`);

  // Update inventory
  const { error: updateError } = await supabase
    .from('inventory')
    .update({ 
      stock_quantity: newQuantity,
      updated_at: new Date().toISOString()
    })
    .eq('perfume_id', perfumeId);

  if (updateError) {
    console.error('❌ Error updating inventory:', updateError);
    throw updateError;
  }

  console.log(`✅ Manual inventory update successful: ${currentStock} → ${newQuantity}`);

  // Log the change
  await logInventoryChange(
    perfumeId,
    'manual_adjustment',
    currentStock,
    newQuantity,
    reason
  );

  return { currentStock, newQuantity };
};
