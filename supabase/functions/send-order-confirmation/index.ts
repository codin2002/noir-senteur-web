
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
  emailType?: 'confirmation' | 'delivery';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== SEND ORDER CONFIRMATION FUNCTION CALLED ===");
    
    const { orderId, emailType = 'confirmation' }: OrderConfirmationRequest = await req.json();
    
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log("Processing email for order:", orderId, "Type:", emailType);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch order details
    const order = await fetchOrderById(orderId, supabaseClient);

    // Get user information
    const userInfo = await getUserInfo(order, supabaseClient);

    // Create items list for email
    const itemsList = createItemsList(order);

    // Send email
    const emailResult = await sendEmail(
      userInfo.email,
      userInfo.name,
      order,
      itemsList,
      emailType
    );

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
