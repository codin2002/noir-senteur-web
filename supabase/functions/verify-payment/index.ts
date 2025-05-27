
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
    const { paymentIntentId, deliveryAddress, isGuest, userId, cartItems } = await req.json();
    console.log('=== VERIFY PAYMENT FUNCTION CALLED ===');
    console.log('Payment Intent ID:', paymentIntentId);
    console.log('Is Guest:', isGuest);
    console.log('User ID:', userId);

    if (!paymentIntentId) {
      console.error('Missing payment intent ID');
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Payment Intent ID is required'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get Ziina API key
    const ziinaApiKey = Deno.env.get("ZIINA_API_KEY");
    if (!ziinaApiKey) {
      console.error('Ziina API key not configured');
      return new Response(JSON.stringify({ 
        success: false,
        message: "Payment verification service unavailable"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // STEP 1: Verify payment status with Ziina
    console.log('=== STEP 1: CHECKING PAYMENT STATUS WITH ZIINA ===');
    const ziinaResponse = await fetch(`https://api-v2.ziina.com/api/payment_intent/${paymentIntentId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ziinaApiKey}`,
        "Accept": "application/json",
      },
    });

    console.log('Ziina API response status:', ziinaResponse.status);

    if (!ziinaResponse.ok) {
      const errorText = await ziinaResponse.text();
      console.error('Ziina API error:', errorText);
      return new Response(JSON.stringify({ 
        success: false,
        message: `Payment verification failed: ${ziinaResponse.status}`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const paymentData = await ziinaResponse.json();
    console.log('Payment status from Ziina:', paymentData.status);
    console.log('Payment amount:', paymentData.amount);

    // STEP 2: Check if payment is completed
    if (paymentData.status !== 'completed') {
      console.log('Payment not completed, status:', paymentData.status);
      return new Response(JSON.stringify({ 
        success: false, 
        message: `Payment status: ${paymentData.status}`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log('=== STEP 2: PAYMENT CONFIRMED AS COMPLETED ===');

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // STEP 3: Get cart items for order creation
    let orderCartItems = [];
    let user = null;

    if (!isGuest && userId) {
      console.log('=== STEP 3A: PROCESSING USER ORDER ===');
      
      // Get user cart items
      const { data: cartData, error: cartError } = await supabaseService.rpc('get_cart_with_perfumes', {
        user_uuid: userId
      });

      if (cartError) {
        console.error('Cart fetch error:', cartError);
        return new Response(JSON.stringify({ 
          success: false,
          message: 'Failed to fetch cart data'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      if (!cartData || cartData.length === 0) {
        console.log('No cart items found for user, checking for existing order');
        // Check if order already exists
        const { data: existingOrder } = await supabaseService
          .from('orders')
          .select('id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (existingOrder && existingOrder.length > 0) {
          return new Response(JSON.stringify({
            success: true,
            orderId: existingOrder[0].id,
            deliveryMethod: 'home',
            deliveryAddress: deliveryAddress || 'Address on file',
            paymentMethod: 'ziina'
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        return new Response(JSON.stringify({ 
          success: false,
          message: 'No cart items found for user'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      orderCartItems = cartData.map((item: any) => ({
        perfume_id: item.perfume_id,
        quantity: item.quantity,
        price: item.perfume.price_value,
        name: item.perfume.name
      }));

      user = { id: userId };
    } else {
      console.log('=== STEP 3B: PROCESSING GUEST ORDER ===');
      
      if (!cartItems || cartItems.length === 0) {
        return new Response(JSON.stringify({ 
          success: false,
          message: 'No cart items provided for guest checkout'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      orderCartItems = cartItems.map((item: any) => ({
        perfume_id: item.perfume.id,
        quantity: item.quantity,
        price: item.perfume.price_value,
        name: item.perfume.name
      }));
    }

    // STEP 4: Calculate total and create order
    const totalAmount = orderCartItems.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0) + 1; // Add shipping

    console.log('=== STEP 4: CREATING ORDER ===');
    console.log('Total amount:', totalAmount);
    console.log('Order items count:', orderCartItems.length);

    let orderId;

    if (!isGuest && user) {
      // User order
      const { data: orderIdResult, error: orderError } = await supabaseService.rpc('create_order_with_items', {
        cart_items: orderCartItems.map(item => ({
          perfume_id: item.perfume_id,
          quantity: item.quantity,
          price: item.price
        })),
        order_total: totalAmount,
        user_uuid: user.id
      });

      if (orderError) {
        console.error('Order creation error:', orderError);
        return new Response(JSON.stringify({ 
          success: false,
          message: 'Failed to create order'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      orderId = orderIdResult;
    } else {
      // Guest order
      const addressParts = deliveryAddress.split(' | ');
      const guestName = addressParts.find(part => part.startsWith('Contact:'))?.replace('Contact: ', '') || 'Guest';
      const guestEmail = addressParts.find(part => part.startsWith('Email:'))?.replace('Email: ', '') || '';
      const guestPhone = addressParts.find(part => part.startsWith('Phone:'))?.replace('Phone: ', '') || '';
      const actualAddress = addressParts[0] || deliveryAddress;

      const { data: orderIdResult, error: orderError } = await supabaseService.rpc('create_order_with_items', {
        cart_items: orderCartItems.map(item => ({
          perfume_id: item.perfume_id,
          quantity: item.quantity,
          price: item.price
        })),
        order_total: totalAmount,
        user_uuid: null,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        delivery_address: actualAddress
      });

      if (orderError) {
        console.error('Guest order creation error:', orderError);
        return new Response(JSON.stringify({ 
          success: false,
          message: 'Failed to create guest order'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      orderId = orderIdResult;
    }

    console.log('=== STEP 5: ORDER CREATED SUCCESSFULLY ===');
    console.log('Order ID:', orderId);

    // STEP 5: Record successful payment
    const productSummary = orderCartItems.map(item => 
      `${item.name} (Qty: ${item.quantity})`
    ).join(', ');
    
    const paymentRecord = {
      user_id: user?.id || null,
      order_id: orderId,
      payment_id: paymentIntentId,
      payment_method: 'ziina',
      amount: paymentData.amount / 100,
      currency: 'AED',
      customer_email: user?.email || (deliveryAddress.includes('Email:') ? 
        deliveryAddress.split('Email: ')[1]?.split(' |')[0] : 'guest@example.com'),
      customer_name: user?.user_metadata?.full_name || 
        (deliveryAddress.includes('Contact:') ? 
          deliveryAddress.split('Contact: ')[1]?.split(' |')[0] : 'Guest'),
      delivery_address: deliveryAddress || 'No address provided',
      payment_status: 'completed',
      ziina_response: paymentData,
      product_details: productSummary
    };

    const { error: paymentRecordError } = await supabaseService
      .from('successful_payments')
      .insert(paymentRecord);

    if (paymentRecordError) {
      console.error('Payment record error:', paymentRecordError);
    } else {
      console.log('Payment recorded successfully');
    }

    console.log('=== VERIFICATION COMPLETE - RETURNING SUCCESS ===');
    return new Response(JSON.stringify({
      success: true,
      orderId: orderId,
      deliveryMethod: 'home',
      deliveryAddress: deliveryAddress || 'Address provided',
      paymentMethod: 'ziina'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('=== VERIFY PAYMENT ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false,
      message: error.message || "Payment verification failed"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
