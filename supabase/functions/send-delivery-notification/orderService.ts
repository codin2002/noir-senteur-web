
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface OrderData {
  id: string;
  status: string;
  total: number;
  user_id?: string;
  guest_email?: string;
  guest_name?: string;
  delivery_email_sent: boolean;
  items?: Array<{
    perfume: { name: string };
    quantity: number;
    price: number;
  }>;
}

export class OrderService {
  private supabaseClient: any;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  }

  async fetchOrderById(orderId: string): Promise<OrderData | null> {
    console.log('📊 Fetching order details from database...');
    const { data: orderData, error: orderError } = await this.supabaseClient.rpc('get_orders_with_items');
    
    if (orderError) {
      console.error('❌ Database error fetching orders:', orderError);
      throw new Error(`Failed to fetch order details: ${orderError.message}`);
    }

    console.log('📊 Database query successful. Orders found:', orderData?.length || 0);
    
    if (!orderData || orderData.length === 0) {
      console.error('❌ No orders found in database');
      throw new Error('No orders found in database');
    }

    console.log('🔍 Searching for order with ID:', orderId);
    const order = orderData.find((o: any) => o.id === orderId);
    
    if (!order) {
      console.error(`❌ Order not found with ID: ${orderId}`);
      console.log('Available order IDs:', orderData.map((o: any) => o.id));
      throw new Error(`Order with ID ${orderId} not found`);
    }

    console.log('✅ Order found successfully:', {
      id: order.id,
      status: order.status,
      total: order.total,
      customer: order.guest_name || order.guest_email || 'registered user',
      itemCount: order.items?.length || 0,
      user_id: order.user_id,
      guest_email: order.guest_email,
      guest_name: order.guest_name,
      delivery_email_sent: order.delivery_email_sent
    });

    return order;
  }

  async updateDeliveryEmailFlag(orderId: string): Promise<void> {
    console.log('🔄 Updating delivery_email_sent flag...');
    const { error: updateError } = await this.supabaseClient
      .from('orders')
      .update({ delivery_email_sent: true })
      .eq('id', orderId);
      
    if (updateError) {
      console.error('❌ Error updating delivery_email_sent flag:', updateError);
      // Don't throw error - email was sent successfully
    } else {
      console.log('✅ delivery_email_sent flag updated successfully');
    }
  }

  async getUserById(userId: string): Promise<{ email: string; name: string } | null> {
    console.log('👤 Order is from authenticated user, fetching user details...');
    console.log('User ID:', userId);
    
    const { data: { user }, error: userError } = await this.supabaseClient.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      console.error('❌ Error fetching user:', userError);
      throw new Error(`Failed to fetch user details: ${userError?.message || 'User not found'}`);
    }
    
    const email = user.email || '';
    const name = user.user_metadata?.full_name || 'Valued Customer';
    console.log('✅ User details retrieved:', { email, name });
    
    return { email, name };
  }
}
