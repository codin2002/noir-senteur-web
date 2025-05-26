
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, paymentId, ziinaResponse } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client using service role key to bypass RLS
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let session;
    let isZiinaPayment = false;

    // Check if this is a Ziina payment or Stripe payment
    if (paymentId && ziinaResponse) {
      // Handle Ziina payment verification
      isZiinaPayment = true;
      console.log('Processing Ziina payment:', paymentId);
      
      // For Ziina, we'll use the metadata passed from the frontend
      // In a real implementation, you'd verify with Ziina API here
      session = {
        payment_status: ziinaResponse.status === 'success' ? 'paid' : 'unpaid',
        metadata: ziinaResponse.metadata || {}
      };
    } else if (sessionId) {
      // Handle Stripe payment verification
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } else {
      throw new Error('Missing payment information');
    }

    if (session.payment_status === 'paid') {
      // Parse cart items from metadata
      const cartItems = JSON.parse(session.metadata?.cart_items || '[]');
      const totalAmount = parseFloat(session.metadata?.total_amount || '0');
      const userEmail = session.metadata?.user_email || '';
      const userName = session.metadata?.user_name || '';

      // Create order using the stored procedure
      const { data: orderId, error: orderError } = await supabaseService.rpc('create_order_with_items', {
        user_uuid: session.metadata?.user_id,
        cart_items: JSON.stringify(cartItems),
        order_total: totalAmount
      });

      if (orderError) {
        throw orderError;
      }

      console.log('Order created successfully:', orderId);

      // Record successful payment for email notifications
      const { error: paymentRecordError } = await supabaseService
        .from('successful_payments')
        .insert({
          user_id: session.metadata?.user_id,
          order_id: orderId,
          payment_id: isZiinaPayment ? paymentId : sessionId,
          payment_method: isZiinaPayment ? 'ziina' : 'stripe',
          amount: totalAmount,
          currency: 'AED',
          customer_email: userEmail,
          customer_name: userName,
          delivery_address: session.metadata?.delivery_address,
          payment_status: 'completed',
          ziina_response: isZiinaPayment ? ziinaResponse : null
        });

      if (paymentRecordError) {
        console.error('Error recording payment:', paymentRecordError);
        // Don't fail the whole process if payment recording fails
      }

      return new Response(JSON.stringify({ 
        success: true, 
        orderId: orderId,
        deliveryMethod: session.metadata?.delivery_method,
        deliveryAddress: session.metadata?.delivery_address,
        paymentMethod: isZiinaPayment ? 'ziina' : 'stripe'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ success: false, status: session.payment_status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
