
import { CustomerInfo } from './customerInfoExtractor.ts';
import { OrderCalculation } from './orderCalculator.ts';

export async function createOrder(
  orderCalculation: OrderCalculation,
  customerInfo: CustomerInfo,
  isGuest: boolean,
  actualUserId: string | null,
  deliveryAddress: string,
  supabaseService: any
): Promise<string> {
  console.log('=== STEP 5: ORDER CREATION ===');
  console.log('Order total being saved:', orderCalculation.totalAmount);
  console.log('Subtotal:', orderCalculation.subtotal);
  console.log('Shipping cost:', orderCalculation.shippingCost);
  console.log('Order items:', orderCalculation.orderItems);

  // Create order using the stored procedure with the correct total
  const { data: orderId, error: orderError } = await supabaseService
    .rpc('create_order_with_items', {
      cart_items: orderCalculation.orderItems,
      order_total: orderCalculation.totalAmount, // This should match the payment amount
      user_uuid: isGuest ? null : actualUserId,
      guest_name: isGuest ? customerInfo.customerName : null,
      guest_email: isGuest ? customerInfo.customerEmail : null,
      guest_phone: isGuest ? customerInfo.customerPhone : null,
      delivery_address: deliveryAddress
    });

  if (orderError) {
    console.error('Error creating order:', orderError);
    throw new Error('Failed to create order');
  }

  console.log('Order created successfully with ID:', orderId);
  console.log('Order total saved to database:', orderCalculation.totalAmount);

  // Reduce inventory immediately when order is placed
  try {
    console.log('📦 Reducing inventory for order placement...');
    
    for (const item of orderCalculation.orderItems) {
      console.log(`🔽 Processing perfume ${item.perfume_id}, reducing ${item.quantity} units`);

      // Get current inventory
      const { data: inventory, error: inventoryError } = await supabaseService
        .from('inventory')
        .select('stock_quantity, id')
        .eq('perfume_id', item.perfume_id)
        .single();

      if (inventoryError) {
        console.error('❌ Error fetching inventory for perfume:', item.perfume_id, inventoryError);
        // If no inventory record exists, create one with 0 stock
        if (inventoryError.code === 'PGRST116') {
          console.log('📝 Creating new inventory record for perfume:', item.perfume_id);
          const { error: createError } = await supabaseService
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

          // Log the order placement with zero reduction
          await supabaseService
            .from('inventory_logs')
            .insert({
              perfume_id: item.perfume_id,
              change_type: 'order_delivery',
              quantity_before: 0,
              quantity_after: 0,
              quantity_change: 0,
              reason: `Order placed - No stock available (Order: ${orderId.substring(0, 8)})`,
              order_id: orderId
            });

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
      
      // Update inventory
      console.log(`🔄 Updating inventory in database for perfume ${item.perfume_id}...`);
      const { error: updateError } = await supabaseService
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
      await supabaseService
        .from('inventory_logs')
        .insert({
          perfume_id: item.perfume_id,
          change_type: 'order_delivery',
          quantity_before: currentStock,
          quantity_after: newQuantity,
          quantity_change: newQuantity - currentStock,
          reason: `Inventory reduced for order placement (Order: ${orderId.substring(0, 8)})`,
          order_id: orderId
        });

      console.log(`✅ Successfully updated and logged inventory for ${item.perfume_id}: ${currentStock} → ${newQuantity}`);
    }

    console.log('🎉 Inventory reduction completed successfully for order placement');
  } catch (inventoryError) {
    console.error('⚠️ Failed to reduce inventory during order placement:', inventoryError);
    // Don't fail the order creation for inventory issues, but log it
  }

  return orderId;
}
