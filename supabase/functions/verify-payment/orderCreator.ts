
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

  // Log the order placement in inventory logs for tracking (but don't reduce inventory yet)
  try {
    console.log('📝 Logging order placement in inventory logs...');
    
    for (const item of orderCalculation.orderItems) {
      // Get current inventory for this perfume
      const { data: inventory, error: inventoryError } = await supabaseService
        .from('inventory')
        .select('stock_quantity')
        .eq('perfume_id', item.perfume_id)
        .single();

      if (!inventoryError && inventory) {
        // Log the order placement (no quantity change, just logging the order)
        await supabaseService
          .from('inventory_logs')
          .insert({
            perfume_id: item.perfume_id,
            change_type: 'order_delivery',
            quantity_before: inventory.stock_quantity,
            quantity_after: inventory.stock_quantity, // No change yet
            quantity_change: 0, // Will be reduced when order is marked as delivered
            reason: `Order placed - ${item.quantity} units will be reduced on delivery (Order: ${orderId.substring(0, 8)})`,
            order_id: orderId
          });
      }
    }
    
    console.log('✅ Order placement logged in inventory logs');
  } catch (logError) {
    console.error('⚠️ Failed to log order placement:', logError);
    // Don't fail the order creation for logging issues
  }

  return orderId;
}
