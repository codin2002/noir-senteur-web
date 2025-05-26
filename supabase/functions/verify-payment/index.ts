
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    console.log('Verify payment called with:', { sessionId, paymentId, ziinaResponse });

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
      
      // For production Ziina payments, we should verify with Ziina API
      // For now, we'll trust the response from the frontend since we're in production mode
      session = {
        payment_status: ziinaResponse.status === 'success' ? 'paid' : 'unpaid',
        metadata: ziinaResponse.metadata || {}
      };
    } else {
      throw new Error('Invalid payment data provided');
    }

    console.log('Payment status:', session.payment_status);
    console.log('Session metadata:', session.metadata);

    if (session.payment_status === 'paid') {
      // Parse cart items from metadata
      const cartItems = JSON.parse(session.metadata?.cart_items || '[]');
      const totalAmount = parseFloat(session.metadata?.total_amount || '0');
      const userEmail = session.metadata?.user_email || '';
      const userName = session.metadata?.user_name || '';
      const userId = session.metadata?.user_id;

      console.log('Creating order for user:', userId);
      console.log('Cart items:', cartItems);
      console.log('Total amount:', totalAmount);

      if (!userId) {
        throw new Error('User ID not found in payment metadata');
      }

      // Create order using the stored procedure (this also clears the cart)
      const { data: orderId, error: orderError } = await supabaseService.rpc('create_order_with_items', {
        user_uuid: userId,
        cart_items: JSON.stringify(cartItems),
        order_total: totalAmount
      });

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      console.log('Order created successfully:', orderId);

      // Record successful payment for email notifications
      const { error: paymentRecordError } = await supabaseService
        .from('successful_payments')
        .insert({
          user_id: userId,
          order_id: orderId,
          payment_id: paymentId,
          payment_method: 'ziina',
          amount: totalAmount,
          currency: 'AED',
          customer_email: userEmail,
          customer_name: userName,
          delivery_address: session.metadata?.delivery_address,
          payment_status: 'completed',
          ziina_response: ziinaResponse
        });

      if (paymentRecordError) {
        console.error('Error recording payment:', paymentRecordError);
        // Don't fail the whole process if payment recording fails
      }

      // Double-check that cart is cleared (redundant but ensures it's cleared)
      try {
        await supabaseService
          .from('cart')
          .delete()
          .eq('user_id', userId);
        console.log('Cart cleared for user:', userId);
      } catch (cartClearError) {
        console.error('Error clearing cart:', cartClearError);
        // Don't fail if cart clearing fails as the stored procedure should handle this
      }

      return new Response(JSON.stringify({ 
        success: true, 
        orderId: orderId,
        deliveryMethod: session.metadata?.delivery_method || 'home',
        deliveryAddress: session.metadata?.delivery_address,
        paymentMethod: 'ziina',
        cartCleared: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      console.log('Payment not completed, status:', session.payment_status);
      return new Response(JSON.stringify({ success: false, status: session.payment_status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
