
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeliveryNotificationRequest {
  orderId: string;
}

serve(async (req) => {
  console.log("🔥 === DELIVERY NOTIFICATION FUNCTION STARTED ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  if (req.method === "OPTIONS") {
    console.log("⚡ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📥 Reading request body...");
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);
    
    let parsedBody: DeliveryNotificationRequest;
    try {
      parsedBody = JSON.parse(requestBody);
      console.log("Parsed request body:", parsedBody);
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError);
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }
    
    const { orderId } = parsedBody;
    
    if (!orderId) {
      console.error('❌ No orderId provided in request');
      throw new Error('Order ID is required');
    }

    console.log("✅ Order ID received:", orderId);
    console.log("🔧 Creating Supabase client...");

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Environment check:");
    console.log("- SUPABASE_URL exists:", !!supabaseUrl);
    console.log("- SUPABASE_SERVICE_ROLE_KEY exists:", !!supabaseServiceKey);
    console.log("- SUPABASE_URL value:", supabaseUrl);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    console.log("✅ Supabase client created successfully");

    // Get order details with items using the RPC function
    console.log('📊 Fetching order details from database...');
    const { data: orderData, error: orderError } = await supabaseClient.rpc('get_orders_with_items');
    
    if (orderError) {
      console.error('❌ Database error fetching orders:', orderError);
      throw new Error(`Failed to fetch order details: ${orderError.message}`);
    }

    console.log('📊 Database query successful. Orders found:', orderData?.length || 0);
    
    if (!orderData || orderData.length === 0) {
      console.error('❌ No orders found in database');
      throw new Error('No orders found in database');
    }

    // Find the specific order
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
      guest_name: order.guest_name
    });

    // Update order status to delivered if not already
    if (order.status !== 'delivered') {
      console.log(`🔄 Updating order status from ${order.status} to delivered`);
      
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId);
        
      if (updateError) {
        console.error('❌ Error updating order status:', updateError);
        throw new Error(`Failed to update order status: ${updateError.message}`);
      }
      
      console.log('✅ Order status updated to delivered successfully');
    } else {
      console.log('ℹ️ Order is already marked as delivered');
    }

    // Determine recipient email and name
    let recipientEmail = '';
    let recipientName = '';

    if (order.user_id) {
      console.log('👤 Order is from authenticated user, fetching user details...');
      console.log('User ID:', order.user_id);
      
      const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(order.user_id);
      
      if (userError || !user) {
        console.error('❌ Error fetching user:', userError);
        throw new Error(`Failed to fetch user details: ${userError?.message || 'User not found'}`);
      }
      
      recipientEmail = user.email || '';
      recipientName = user.user_metadata?.full_name || 'Valued Customer';
      console.log('✅ User details retrieved:', { email: recipientEmail, name: recipientName });
    } else {
      console.log('👥 Order is from guest user');
      recipientEmail = order.guest_email || '';
      recipientName = order.guest_name || 'Valued Customer';
      console.log('✅ Guest details:', { email: recipientEmail, name: recipientName });
    }

    if (!recipientEmail) {
      console.error('❌ No recipient email found for order');
      throw new Error('No recipient email found for this order');
    }

    console.log('📧 Preparing to send delivery notification to:', recipientEmail);

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY_REAL");
    console.log("🔑 Resend API key check:");
    console.log("- RESEND_API_KEY_REAL exists:", !!resendApiKey);
    console.log("- Key length:", resendApiKey?.length || 0);
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY_REAL environment variable is not set');
      throw new Error('Email service not configured - missing API key');
    }

    const resend = new Resend(resendApiKey);
    console.log('✅ Resend client initialized');

    // Create items list for email
    const items = order.items || [];
    console.log('📦 Order items:', items.length);
    
    const itemsList = items.map((item: any) => 
      `• ${item.perfume?.name || 'Unknown Item'} (Qty: ${item.quantity}) - AED ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    console.log('📋 Email items list prepared:', itemsList);

    // Create delivery notification email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; margin: 0;">🎉 Your Order Has Been Delivered!</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${recipientName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Great news! Your Senteur Fragrances order has been successfully delivered to your address.
          </p>
        </div>

        <div style="background-color: #fff; border: 1px solid #eee; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #D4AF37; margin-top: 0;">📦 Order Details</h3>
          <p><strong>Order ID:</strong> #${order.id.substring(0, 8)}</p>
          <p><strong>Delivery Address:</strong> ${order.delivery_address || 'Not specified'}</p>
          <p><strong>Order Total:</strong> AED ${Number(order.total).toFixed(2)}</p>
          
          <h4 style="color: #333; margin-bottom: 10px;">Items Delivered:</h4>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <pre style="margin: 0; white-space: pre-wrap; font-family: Arial, sans-serif;">${itemsList}</pre>
          </div>
        </div>

        <div style="background-color: #f0f8ff; border-left: 4px solid #D4AF37; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">💝 Thank You for Choosing Senteur Fragrances</h3>
          <p style="color: #666; line-height: 1.6;">
            We hope you love your new fragrances! Your order has been carefully prepared and delivered with love.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px; margin: 5px 0;">
            Senteur Fragrances - Premium Perfumes Delivered
          </p>
          <p style="color: #999; font-size: 14px; margin: 5px 0;">
            For support, contact us at senteur.ae@gmail.com
          </p>
        </div>
      </div>
    `;

    console.log('📧 Email HTML template prepared');
    console.log('✉️ Sending delivery notification email via Resend...');

    // Send delivery notification email
    const emailResult = await resend.emails.send({
      from: "Senteur Fragrances <orders@senteurfragrances.com>",
      to: [recipientEmail],
      subject: "🎉 Your Senteur Fragrances Order Has Been Delivered!",
      html: emailHtml,
    });

    console.log('📧 Resend API call completed');
    console.log('📧 Resend API response:', JSON.stringify(emailResult, null, 2));

    if (emailResult.error) {
      console.error('❌ Resend API error:', emailResult.error);
      throw new Error(`Email sending failed: ${JSON.stringify(emailResult.error)}`);
    }

    console.log('✅ Delivery notification email sent successfully!');
    console.log('📧 Email ID:', emailResult.data?.id);

    const successResponse = {
      success: true,
      message: 'Delivery notification sent successfully',
      emailId: emailResult.data?.id,
      orderId: orderId,
      recipientEmail: recipientEmail,
      recipientName: recipientName,
      timestamp: new Date().toISOString()
    };

    console.log('🎉 === SUCCESS RESPONSE ===');
    console.log(JSON.stringify(successResponse, null, 2));

    return new Response(JSON.stringify(successResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("💥 === DELIVERY NOTIFICATION ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    
    const errorResponse = {
      success: false,
      error: {
        message: error.message || "Failed to send delivery notification",
        type: error.name || "UnknownError",
        timestamp: new Date().toISOString(),
        stack: error.stack
      }
    };

    console.error("💥 Error response:", JSON.stringify(errorResponse, null, 2));
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
