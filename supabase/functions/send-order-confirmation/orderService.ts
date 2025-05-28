
export async function fetchOrderById(orderId: string, supabaseClient: any) {
  console.log('Fetching order details for:', orderId);
  
  const { data: orderData, error: orderError } = await supabaseClient.rpc('get_orders_with_items');
  
  if (orderError) {
    console.error('Error fetching order:', orderError);
    throw new Error('Failed to fetch order details');
  }

  const order = orderData?.find((o: any) => o.id === orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }

  console.log('Order found:', order);
  return order;
}

export function createItemsList(order: any): string {
  return order.items.map((item: any) => 
    `• ${item.perfume.name} (Qty: ${item.quantity}) - AED ${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');
}
