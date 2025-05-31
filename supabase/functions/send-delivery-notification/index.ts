
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { OrderService } from "./orderService.ts";
import { EmailService } from "./emailService.ts";
import { 
  corsHeaders, 
  DeliveryNotificationRequest,
  createSuccessResponse,
  createAlreadySentResponse,
  createErrorResponse
} from "./responseUtils.ts";

serve(async (req) => {
  console.log("🔥 === DELIVERY NOTIFICATION FUNCTION STARTED ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  
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
    console.log("🔧 Creating services...");

    // Initialize environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY_REAL");
    
    console.log("Environment check:");
    console.log("- SUPABASE_URL exists:", !!supabaseUrl);
    console.log("- SUPABASE_SERVICE_ROLE_KEY exists:", !!supabaseServiceKey);
    console.log("- RESEND_API_KEY_REAL exists:", !!resendApiKey);
    console.log("- Key length:", resendApiKey?.length || 0);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY_REAL environment variable is not set');
      throw new Error('Email service not configured - missing API key');
    }

    // Initialize services
    const orderService = new OrderService(supabaseUrl, supabaseServiceKey);
    const emailService = new EmailService(resendApiKey);

    // Fetch order details
    const order = await orderService.fetchOrderById(orderId);

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    // Check if delivery email was already sent
    if (order.delivery_email_sent) {
      console.log('⚠️ Delivery email was already sent for this order');
      return createAlreadySentResponse(orderId);
    }

    // Determine recipient email and name
    let recipientEmail = '';
    let recipientName = '';

    if (order.user_id) {
      const user = await orderService.getUserById(order.user_id);
      if (user) {
        recipientEmail = user.email;
        recipientName = user.name;
      }
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

    // Send delivery notification email
    const emailResult = await emailService.sendDeliveryNotification(
      recipientEmail,
      recipientName,
      order
    );

    // Update delivery_email_sent flag
    await orderService.updateDeliveryEmailFlag(orderId);

    return createSuccessResponse({
      emailId: emailResult.id,
      orderId: orderId,
      recipientEmail: recipientEmail,
      recipientName: recipientName
    });

  } catch (error: any) {
    return createErrorResponse(error);
  }
});
