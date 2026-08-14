
export async function fetchOrderById(orderId: string, supabaseClient: any) {
  console.log('Fetching order details for:', orderId);
  // This function runs with the service role. Query the one requested order
  // directly instead of the admin dashboard RPC, which deliberately requires
  // an administrator's browser session.
  const { data: order, error: orderError } = await supabaseClient
    .from('orders')
    .select(`
      id, user_id, total, status, created_at,
      guest_name, guest_email, guest_phone, delivery_address,
      items:order_items!order_items_order_id_fkey(
        id, perfume_id, quantity, price,
        perfume:perfumes!fk_order_items_perfume_id(*)
      )
    `)
    .eq('id', orderId)
    .maybeSingle();

  if (orderError) {
    console.error('Error fetching order:', orderError);
    throw new Error('Failed to fetch order details');
  }
  
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
