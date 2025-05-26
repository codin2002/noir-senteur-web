
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
    const { paymentIntentId, deliveryAddress } = await req.json();
    console.log('=== VERIFY PAYMENT FUNCTION CALLED ===');
    console.log('Payment Intent ID:', paymentIntentId);
    console.log('Delivery Address:', deliveryAddress);

    if (!paymentIntentId) {
      return new Response(JSON.stringify({ 
        success: false,
        error: { message: 'Payment Intent ID is required', details: 'Missing paymentIntentId in request body' }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get Ziina API key from environment
    const ziinaApiKey = Deno.env.get("ZIINA_API_KEY");
    if (!ziinaApiKey) {
      return new Response(JSON.stringify({ 
        success: false,
        error: { message: "Ziina API key not configured", details: 'Service configuration error' }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Fetch payment status from Ziina API
    console.log('=== FETCHING PAYMENT STATUS FROM ZIINA ===');
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
      console.error('Ziina API error response:', errorText);
      return new Response(JSON.stringify({ 
        success: false,
        error: { 
          message: `Failed to fetch payment status: ${ziinaResponse.status}`,
          details: errorText 
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const paymentData = await ziinaResponse.json();
    console.log('=== ZIINA PAYMENT DATA ===');
    console.log('Payment data:', JSON.stringify(paymentData, null, 2));

    // Create Supabase client using service role key to bypass RLS
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log('=== PAYMENT STATUS CHECK ===');
    console.log('Payment status:', paymentData.status);

    if (paymentData.status === 'completed') {
      console.log('=== PAYMENT CONFIRMED AS COMPLETED ===');
      
      // Get user from auth header with improved error handling
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ 
          success: false,
          error: { message: 'Authorization header missing', details: 'Authentication required' }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }

      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
      const user = userData.user;
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        return new Response(JSON.stringify({ 
          success: false,
          error: { message: 'Invalid or expired token', details: authError?.message || 'Authentication failed' }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }

      console.log('=== AUTHENTICATED USER ===');
      console.log('User ID:', user.id);

      // Update user profile with delivery address if provided
      if (deliveryAddress && deliveryAddress.trim()) {
        console.log('=== UPDATING USER PROFILE WITH DELIVERY ADDRESS ===');
        const { error: profileUpdateError } = await supabaseService
          .from('profiles')
          .upsert({
            id: user.id,
            address: deliveryAddress.trim(),
            updated_at: new Date().toISOString()
          });

        if (profileUpdateError) {
          console.error('Profile update error:', profileUpdateError);
          // Don't fail the payment process if profile update fails
        } else {
          console.log('Profile updated successfully with delivery address');
        }
      }

      // Get the user's current cart to process the order
      const { data: cartData, error: cartError } = await supabaseService.rpc('get_cart_with_perfumes', {
        user_uuid: user.id
      });

      if (cartError) {
        console.error('=== CART FETCH ERROR ===');
        console.error('Error details:', JSON.stringify(cartError, null, 2));
        return new Response(JSON.stringify({ 
          success: false,
          error: { message: 'Failed to fetch cart data', details: cartError.message }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      if (!cartData || cartData.length === 0) {
        console.log('=== NO CART ITEMS FOUND ===');
        // Cart might already be cleared, check if order exists
        const { data: existingOrder } = await supabaseService
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (existingOrder && existingOrder.length > 0) {
          console.log('=== ORDER ALREADY EXISTS ===');
          return new Response(JSON.stringify({
            success: true,
            orderId: existingOrder[0].id,
            deliveryMethod: 'home',
            deliveryAddress: deliveryAddress || 'Address on file',
            paymentMethod: 'ziina',
            message: 'Order already processed'
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          return new Response(JSON.stringify({ 
            success: false,
            error: { message: 'No cart items found', details: 'Cart is empty and no recent order exists' }
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
      }

      console.log('=== CART DATA FOUND ===');
      console.log('Cart items count:', cartData.length);

      // Calculate total from cart
      const totalAmount = cartData.reduce((sum: number, item: any) => {
        return sum + (item.perfume.price_value * item.quantity);
      }, 0) + 1; // Add shipping

      console.log('=== CALCULATED TOTAL ===');
      console.log('Total amount:', totalAmount);

      // Prepare cart items for order creation - pass as JSONB array, not stringified JSON
      const cartItems = cartData.map((item: any) => ({
        perfume_id: item.perfume_id,
        quantity: item.quantity,
        price: item.perfume.price_value
      }));

      console.log('=== CALLING CREATE_ORDER_WITH_ITEMS PROCEDURE ===');
      console.log('Cart items to pass:', cartItems);
      
      // Pass the cart items as JSONB, not as a stringified JSON
      const { data: orderId, error: orderError } = await supabaseService.rpc('create_order_with_items', {
        user_uuid: user.id,
        cart_items: cartItems, // Pass as JSONB array directly
        order_total: totalAmount
      });

      if (orderError) {
        console.error('=== ORDER CREATION ERROR ===');
        console.error('Error details:', JSON.stringify(orderError, null, 2));
        return new Response(JSON.stringify({ 
          success: false,
          error: { message: 'Failed to create order', details: orderError.message }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      console.log('=== ORDER CREATED SUCCESSFULLY ===');
      console.log('Order ID:', orderId);

      // Record successful payment
      console.log('=== RECORDING SUCCESSFUL PAYMENT ===');
      const paymentRecord = {
        user_id: user.id,
        order_id: orderId,
        payment_id: paymentIntentId,
        payment_method: 'ziina',
        amount: totalAmount,
        currency: 'AED',
        customer_email: user.email,
        customer_name: user.user_metadata?.full_name || user.email,
        delivery_address: deliveryAddress || 'Home delivery',
        payment_status: 'completed',
        ziina_response: paymentData
      };

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

      console.log('=== RETURNING SUCCESS RESPONSE ===');
      const successResponse = {
        success: true,
        orderId: orderId,
        deliveryMethod: 'home',
        deliveryAddress: deliveryAddress || 'Home delivery',
        paymentMethod: 'ziina',
        cartCleared: true
      };

      return new Response(JSON.stringify(successResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      console.log('=== PAYMENT NOT COMPLETED ===');
      console.log('Payment status:', paymentData.status);
      return new Response(JSON.stringify({ 
        success: false, 
        status: paymentData.status,
        message: `Payment status: ${paymentData.status}`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error: any) {
    console.error('=== VERIFY PAYMENT ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: {
        message: error.message || "Payment verification failed",
        details: error.toString()
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
