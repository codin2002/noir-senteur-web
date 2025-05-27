
import { CustomerInfo } from './customerInfoExtractor.ts';
import { OrderCalculation } from './orderCalculator.ts';

export async function recordSuccessfulPayment(
  paymentIntentId: string,
  orderId: string,
  orderCalculation: OrderCalculation,
  customerInfo: CustomerInfo,
  orderCartItems: any[],
  deliveryAddress: string,
  isGuest: boolean,
  actualUserId: string | null,
  supabaseService: any
): Promise<void> {
  // Prepare product details for storage in successful_payments
  const productDetails = orderCartItems.map(item => {
    const perfume = item.perfume || item;
    return `${perfume.name} (Qty: ${item.quantity || 1})`;
  }).join(', ');

  console.log('Product details for storage:', productDetails);

  // Record successful payment with correct payment_id and product details
  const { error: paymentError } = await supabaseService
    .from('successful_payments')
    .insert({
      payment_id: paymentIntentId,
      order_id: orderId,
      amount: orderCalculation.totalAmount,
      currency: 'AED',
      payment_method: 'ziina',
      payment_status: 'completed',
      user_id: isGuest ? null : actualUserId,
      customer_name: customerInfo.customerName,
      customer_email: customerInfo.customerEmail,
      delivery_address: deliveryAddress,
      product_details: productDetails,
      email_sent: false
    });

  if (paymentError) {
    console.error('Error recording payment:', paymentError);
    // Don't fail the entire process for this
  } else {
    console.log('Payment recorded successfully in successful_payments table');
  }
}
