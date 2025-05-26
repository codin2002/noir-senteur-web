
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
    console.log('=== VERIFY PAYMENT FUNCTION CALLED ===');
    console.log('Received parameters:', { sessionId, paymentId, ziinaResponse });

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
      console.log('=== PROCESSING ZIINA PAYMENT ===');
      console.log('Payment ID:', paymentId);
      console.log('Ziina Response:', JSON.stringify(ziinaResponse, null, 2));
      
      session = {
        payment_status: ziinaResponse.status === 'success' ? 'paid' : 'unpaid',
        metadata: ziinaResponse.metadata || {}
      };
    } else {
      console.error('=== INVALID PAYMENT DATA ===');
      console.log('Missing required data - sessionId:', sessionId, 'paymentId:', paymentId, 'ziinaResponse:', ziinaResponse);
      throw new Error('Invalid payment data provided');
    }

    console.log('=== PAYMENT STATUS CHECK ===');
    console.log('Payment status:', session.payment_status);
    console.log('Session metadata:', JSON.stringify(session.metadata, null, 2));

    if (session.payment_status === 'paid') {
      console.log('=== PAYMENT CONFIRMED AS PAID ===');
      
      // Parse cart items from metadata
      const cartItems = JSON.parse(session.metadata?.cart_items || '[]');
      const totalAmount = parseFloat(session.metadata?.total_amount || '0');
      const userEmail = session.metadata?.user_email || '';
      const userName = session.metadata?.user_name || '';
      const userId = session.metadata?.user_id;

      console.log('=== EXTRACTED PAYMENT DATA ===');
      console.log('User ID:', userId);
      console.log('User Email:', userEmail);
      console.log('User Name:', userName);
      console.log('Total Amount:', totalAmount);
      console.log('Cart Items Count:', cartItems.length);
      console.log('Cart Items:', JSON.stringify(cartItems, null, 2));

      if (!userId) {
        console.error('=== ERROR: USER ID NOT FOUND ===');
        throw new Error('User ID not found in payment metadata');
      }

      // Create order using the stored procedure (this also clears the cart)
      console.log('=== CALLING CREATE_ORDER_WITH_ITEMS PROCEDURE ===');
      console.log('Parameters:', {
        user_uuid: userId,
        cart_items: JSON.stringify(cartItems),
        order_total: totalAmount
      });

      const { data: orderId, error: orderError } = await supabaseService.rpc('create_order_with_items', {
        user_uuid: userId,
        cart_items: JSON.stringify(cartItems),
        order_total: totalAmount
      });

      if (orderError) {
        console.error('=== ORDER CREATION ERROR ===');
        console.error('Error details:', JSON.stringify(orderError, null, 2));
        throw orderError;
      }

      console.log('=== ORDER CREATED SUCCESSFULLY ===');
      console.log('Order ID:', orderId);

      // Record successful payment for email notifications
      console.log('=== RECORDING SUCCESSFUL PAYMENT ===');
      const paymentRecord = {
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
      };
      
      console.log('Payment record to insert:', JSON.stringify(paymentRecord, null, 2));

      const { error: paymentRecordError } = await supabaseService
        .from('successful_payments')
        .insert(paymentRecord);

      if (paymentRecordError) {
        console.error('=== PAYMENT RECORD ERROR ===');
        console.error('Error details:', JSON.stringify(paymentRecordError, null, 2));
        // Don't fail the whole process if payment recording fails
      } else {
        console.log('=== PAYMENT RECORDED SUCCESSFULLY ===');
      }

      // Double-check that cart is cleared (redundant but ensures it's cleared)
      try {
        console.log('=== ENSURING CART IS CLEARED ===');
        console.log('Clearing cart for user:', userId);
        
        const { error: cartClearError } = await supabaseService
          .from('cart')
          .delete()
          .eq('user_id', userId);
          
        if (cartClearError) {
          console.error('=== CART CLEAR ERROR ===');
          console.error('Error details:', JSON.stringify(cartClearError, null, 2));
        } else {
          console.log('=== CART CLEARED SUCCESSFULLY ===');
        }
      } catch (cartClearError) {
        console.error('=== CART CLEAR EXCEPTION ===');
        console.error('Exception details:', cartClearError);
      }

      console.log('=== RETURNING SUCCESS RESPONSE ===');
      const successResponse = { 
        success: true, 
        orderId: orderId,
        deliveryMethod: session.metadata?.delivery_method || 'home',
        deliveryAddress: session.metadata?.delivery_address,
        paymentMethod: 'ziina',
        cartCleared: true
      };
      
      console.log('Success response:', JSON.stringify(successResponse, null, 2));

      return new Response(JSON.stringify(successResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      console.log('=== PAYMENT NOT COMPLETED ===');
      console.log('Payment status:', session.payment_status);
      return new Response(JSON.stringify({ success: false, status: session.payment_status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    console.error('=== VERIFY PAYMENT ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
