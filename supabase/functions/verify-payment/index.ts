
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
    console.log('=== VERIFY PAYMENT FUNCTION CALLED ===');
    
    const { paymentIntentId, deliveryAddress, isGuest, userId, cartItems } = await req.json();
    
    console.log('Payment Intent ID:', paymentIntentId);
    console.log('Is Guest:', isGuest);
    console.log('User ID:', userId);
    console.log('Delivery Address:', deliveryAddress);

    // Create Supabase client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log('=== STEP 1: CHECKING PAYMENT STATUS WITH ZIINA ===');

    // Get Ziina API key
    const ziinaApiKey = Deno.env.get("ZIINA_API_KEY");
    if (!ziinaApiKey) {
      throw new Error("Ziina API key not configured");
    }

    // Check payment status with Ziina
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
      throw new Error(`Failed to verify payment with Ziina: ${ziinaResponse.status}`);
    }

    const paymentData = await ziinaResponse.json();
    console.log('Payment status from Ziina:', paymentData.status);
    console.log('Payment amount:', paymentData.amount);

    if (paymentData.status !== 'completed') {
      console.error('Payment not completed. Status:', paymentData.status);
      return new Response(JSON.stringify({
        success: false,
        message: `Payment not completed. Status: ${paymentData.status}`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log('=== STEP 2: PAYMENT CONFIRMED AS COMPLETED ===');

    // Get cart items - either from parameter (guest) or database (authenticated user)
    let orderCartItems = [];
    
    if (isGuest && cartItems) {
      console.log('=== STEP 3A: PROCESSING GUEST ORDER ===');
      orderCartItems = cartItems;
    } else if (!isGuest && userId) {
      console.log('=== STEP 3B: PROCESSING AUTHENTICATED USER ORDER ===');
      // Get cart items from database for authenticated user
      const { data: userCartItems, error: cartError } = await supabaseService
        .rpc('get_cart_with_perfumes', { user_uuid: userId });

      if (cartError) {
        console.error('Error fetching user cart:', cartError);
        throw new Error('Failed to fetch user cart items');
      }

      if (!userCartItems || userCartItems.length === 0) {
        console.error('No cart items found for user');
        return new Response(JSON.stringify({
          success: false,
          message: 'No cart items found for user'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      orderCartItems = userCartItems;
      console.log('Found cart items for user:', orderCartItems.length);
    } else {
      console.error('Invalid request: missing user ID or cart items');
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid request: missing user ID or cart items'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log('=== STEP 4: CREATING ORDER ===');

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = orderCartItems.map(item => {
      const perfume = item.perfume || item;
      const price = perfume.price_value || 1;
      const quantity = item.quantity || 1;
      totalAmount += price * quantity;
      
      return {
        perfume_id: perfume.id,
        quantity: quantity,
        price: price
      };
    });

    const shipping = 1;
    totalAmount += shipping;

    console.log('Total amount:', totalAmount);
    console.log('Order items count:', orderItems.length);

    // Extract customer information from delivery address or user profile
    let customerName = 'Guest Customer';
    let customerEmail = 'guest@example.com';
    let customerPhone = 'Not provided';

    if (!isGuest && userId) {
      // Get user profile for authenticated users
      const { data: profile, error: profileError } = await supabaseService
        .from('profiles')
        .select('full_name, phone')
        .eq('id', userId)
        .single();

      if (!profileError && profile) {
        customerName = profile.full_name || 'User';
        customerPhone = profile.phone || 'Not provided';
      }

      // Get user email from auth
      const { data: { user }, error: userError } = await supabaseService.auth.admin.getUserById(userId);
      if (!userError && user) {
        customerEmail = user.email || 'user@example.com';
      }
    } else {
      // For guest orders, try to extract from delivery address
      const addressParts = deliveryAddress.split('|');
      for (const part of addressParts) {
        if (part.includes('Contact:')) {
          customerName = part.replace('Contact:', '').trim();
        } else if (part.includes('Email:')) {
          customerEmail = part.replace('Email:', '').trim();
        } else if (part.includes('Phone:')) {
          customerPhone = part.replace('Phone:', '').trim();
        }
      }
    }

    // Create order using the stored procedure
    const { data: orderId, error: orderError } = await supabaseService
      .rpc('create_order_with_items', {
        cart_items: orderItems,
        order_total: totalAmount,
        user_uuid: isGuest ? null : userId,
        guest_name: isGuest ? customerName : null,
        guest_email: isGuest ? customerEmail : null,
        guest_phone: isGuest ? customerPhone : null,
        delivery_address: deliveryAddress
      });

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    console.log('=== STEP 5: ORDER CREATED SUCCESSFULLY ===');
    console.log('Order ID:', orderId);

    // Record successful payment
    const { error: paymentError } = await supabaseService
      .from('successful_payments')
      .insert({
        payment_intent_id: paymentIntentId,
        order_id: orderId,
        amount: totalAmount,
        currency: 'AED',
        payment_method: 'ziina',
        payment_status: 'completed',
        user_id: isGuest ? null : userId,
        customer_name: customerName,
        customer_email: customerEmail,
        delivery_address: deliveryAddress
      });

    if (paymentError) {
      console.error('Error recording payment:', paymentError);
      // Don't fail the entire process for this
    } else {
      console.log('Payment recorded successfully');
    }

    // Trigger email confirmation function
    console.log('=== STEP 6: TRIGGERING EMAIL CONFIRMATION ===');
    try {
      const emailResult = await supabaseService.functions.invoke('send-order-confirmation', {
        body: { orderId: orderId }
      });
      
      if (emailResult.error) {
        console.error('Email sending failed:', emailResult.error);
      } else {
        console.log('Email confirmation triggered successfully');
      }
    } catch (emailError) {
      console.error('Error triggering email:', emailError);
      // Don't fail the main process for email issues
    }

    console.log('=== VERIFICATION COMPLETE - RETURNING SUCCESS ===');

    return new Response(JSON.stringify({
      success: true,
      orderId: orderId,
      paymentMethod: 'Ziina',
      deliveryMethod: 'Home Delivery',
      deliveryAddress: deliveryAddress,
      message: 'Payment verified and order created successfully'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Payment verification failed'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
