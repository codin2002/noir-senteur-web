
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
    console.log('Delivery Address:', deliveryAddress);
    console.log('Is Guest:', isGuest);
    console.log('User ID:', userId);
    console.log('Cart Items:', cartItems?.length || 0);

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
      
      let user = null;
      let orderCartItems = [];

      if (!isGuest) {
        // Get user from auth header for authenticated users
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(JSON.stringify({ 
            success: false,
            error: { message: 'Authorization header missing', details: 'Authentication required for user checkout' }
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
        user = userData.user;
        
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

        orderCartItems = cartData.map((item: any) => ({
          perfume_id: item.perfume_id,
          quantity: item.quantity,
          price: item.perfume.price_value,
          name: item.perfume.name
        }));
      } else {
        // For guest checkout, use cart items from the request
        console.log('=== GUEST CHECKOUT ===');
        
        if (!cartItems || cartItems.length === 0) {
          return new Response(JSON.stringify({ 
            success: false,
            error: { message: 'No cart items provided for guest checkout', details: 'Cart items are required for guest orders' }
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }

        console.log('Guest cart items count:', cartItems.length);
        
        orderCartItems = cartItems.map((item: any) => ({
          perfume_id: item.perfume.id,
          quantity: item.quantity,
          price: item.perfume.price_value,
          name: item.perfume.name
        }));
      }

      // Calculate total from cart items
      const totalAmount = orderCartItems.reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity);
      }, 0) + 1; // Add shipping

      console.log('=== CALCULATED TOTAL ===');
      console.log('Total amount:', totalAmount);
      console.log('Order cart items:', orderCartItems.length);

      let orderId;

      if (!isGuest && user) {
        // Authenticated user order
        console.log('=== CALLING CREATE_ORDER_WITH_ITEMS PROCEDURE FOR USER ===');
        
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

        orderId = orderIdResult;
      } else {
        // Guest order
        console.log('=== CALLING CREATE_ORDER_WITH_ITEMS PROCEDURE FOR GUEST ===');
        
        // Parse guest details from delivery address
        const addressParts = deliveryAddress.split(' | ');
        const guestName = addressParts.find(part => part.startsWith('Contact:'))?.replace('Contact: ', '') || 'Guest';
        const guestEmail = addressParts.find(part => part.startsWith('Email:'))?.replace('Email: ', '') || '';
        const guestPhone = addressParts.find(part => part.startsWith('Phone:'))?.replace('Phone: ', '') || '';
        const actualAddress = addressParts[0] || deliveryAddress;
        
        console.log('Guest details parsed:', { guestName, guestEmail, guestPhone, actualAddress });

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
          console.error('=== GUEST ORDER CREATION ERROR ===');
          console.error('Error details:', JSON.stringify(orderError, null, 2));
          return new Response(JSON.stringify({ 
            success: false,
            error: { message: 'Failed to create guest order', details: orderError.message }
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }

        orderId = orderIdResult;
      }

      console.log('=== ORDER CREATED SUCCESSFULLY ===');
      console.log('Order ID:', orderId);

      // Record successful payment with product details
      console.log('=== RECORDING SUCCESSFUL PAYMENT WITH PRODUCT DETAILS ===');
      
      // Create product summary for successful_payments table
      const productSummary = orderCartItems.map(item => 
        `${item.name} (Qty: ${item.quantity})`
      ).join(', ');
      
      const paymentRecord = {
        user_id: user?.id || null,
        order_id: orderId,
        payment_id: paymentIntentId,
        payment_method: 'ziina',
        amount: paymentData.amount / 100, // Convert from fils to AED
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
        console.error('=== PAYMENT RECORD ERROR ===');
        console.error('Error details:', JSON.stringify(paymentRecordError, null, 2));
        // Don't fail the whole process if payment recording fails
      } else {
        console.log('=== PAYMENT RECORDED SUCCESSFULLY WITH PRODUCT DETAILS ===');
      }

      // Send order confirmation emails
      console.log('=== TRIGGERING ORDER CONFIRMATION EMAILS ===');
      try {
        const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-order-confirmation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ orderId: orderId }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send order confirmation emails:', await emailResponse.text());
        } else {
          console.log('Order confirmation emails triggered successfully');
        }
      } catch (emailError) {
        console.error('Error triggering order confirmation emails:', emailError);
        // Don't fail the payment process if email sending fails
      }

      console.log('=== RETURNING SUCCESS RESPONSE ===');
      const successResponse = {
        success: true,
        orderId: orderId,
        deliveryMethod: 'home',
        deliveryAddress: deliveryAddress || 'No address provided',
        paymentMethod: 'ziina',
        cartCleared: !isGuest
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
