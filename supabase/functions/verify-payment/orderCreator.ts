
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
  return orderId;
}
