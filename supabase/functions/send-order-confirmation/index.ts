
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { fetchOrderById, createItemsList } from "./orderService.ts";
import { getUserInfo } from "./userService.ts";
import { sendEmail } from "./emailService.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  orderStatus?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== SEND ORDER CONFIRMATION FUNCTION CALLED ===");
    
    const { orderId, orderStatus }: OrderConfirmationRequest = await req.json();
    
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log("Processing email for order:", orderId, "Status:", orderStatus);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch order details
    const order = await fetchOrderById(orderId, supabaseClient);

    // Determine if we should send an email based on status
    const shouldSendEmail = orderStatus === 'processing' || orderStatus === 'delivered';
    
    if (!shouldSendEmail) {
      console.log(`Status "${orderStatus}" does not require email notification`);
      return new Response(JSON.stringify({
        success: true,
        message: `Order status updated to ${orderStatus} - no email required`,
        orderId: orderId,
        emailSent: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // For delivery emails, check if already sent
    if (orderStatus === 'delivered' && order.delivery_email_sent) {
      console.log('⚠️ Delivery email was already sent for this order');
      return new Response(JSON.stringify({
        success: true,
        message: 'Delivery notification was already sent for this order',
        orderId: orderId,
        alreadySent: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get user information
    const userInfo = await getUserInfo(order, supabaseClient);

    // Create items list for email
    const itemsList = createItemsList(order);

    // Determine email type based on status
    const emailType = orderStatus === 'delivered' ? 'delivery' : 'confirmation';

    // Send email
    const emailResult = await sendEmail(
      userInfo.email,
      userInfo.name,
      order,
      itemsList,
      emailType
    );

    // Update delivery_email_sent flag if this was a delivery email
    if (orderStatus === 'delivered') {
      console.log('🔄 Updating delivery_email_sent flag...');
      const { error: updateError } = await supabaseClient
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

    return new Response(JSON.stringify({
      success: true,
      message: `${emailType} email sent successfully`,
      emailId: emailResult.data?.id,
      orderId: orderId,
      recipientEmail: userInfo.email,
      emailType: emailType
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("=== EMAIL SENDING ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: {
        message: error.message || "Failed to send email",
        type: error.name || "UnknownError",
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
