
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cartItems, deliveryAddress, isGuest, userId } = await req.json();
    
    console.log('=== CREATE PAYMENT FUNCTION CALLED ===');
    console.log('Is guest checkout:', isGuest);
    console.log('User ID:', userId);
    console.log('Received cart items:', JSON.stringify(cartItems, null, 2));

    // Get Ziina API key from environment
    const ziinaApiKey = Deno.env.get("ZIINA_API_KEY");
    if (!ziinaApiKey) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Ziina API key not configured" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "No cart items provided" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Process cart items based on checkout type
    if (isGuest) {
      console.log('Processing guest checkout');
    } else {
      console.log('Processing authenticated user checkout');
    }

    // Calculate total amount
    let subtotal = 0;
    for (const item of cartItems) {
      const price = item.perfume?.price_value || 0;
      const quantity = item.quantity || 1;
      console.log(`Item price: ${price}, quantity: ${quantity}`);
      subtotal += price * quantity;
    }

    const shipping = 1; // AED 1 shipping
    const total = subtotal + shipping;
    
    console.log(`Calculated subtotal: ${subtotal}, shipping: ${shipping}, total: ${total}`);

    // Convert to fils (1 AED = 100 fils)
    const amountInFils = Math.round(total * 100);

    // Create payment message
    const itemCount = cartItems.length;
    const paymentMessage = `Senteur Fragrances Order - ${itemCount} item(s)${isGuest ? ' (Guest)' : ''}`;

    // Set expiry to 15 minutes from now
    const expiryTime = Date.now() + (15 * 60 * 1000);

    // Create Ziina payment
    const ziinaPayload = {
      amount: amountInFils,
      currency_code: "AED",
      message: paymentMessage,
      success_url: `https://senteurfragrances.com/payment-success?payment_intent_id={PAYMENT_INTENT_ID}`,
      cancel_url: "https://senteurfragrances.com/cart?payment=cancelled",
      failure_url: "https://senteurfragrances.com/payment-failed",
      expiry: expiryTime.toString(),
      test: false,
      transaction_source: "directApi",
      allow_tips: false
    };

    console.log('Creating Ziina payment with payload:', JSON.stringify(ziinaPayload, null, 2));

    const ziinaResponse = await fetch("https://api-v2.ziina.com/api/payment_intent", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ziinaApiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(ziinaPayload),
    });

    console.log('Ziina API response status:', ziinaResponse.status);

    if (!ziinaResponse.ok) {
      const errorText = await ziinaResponse.text();
      console.error('Ziina API error:', errorText);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Ziina API error: ${ziinaResponse.status}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const paymentData = await ziinaResponse.json();
    console.log('Ziina payment created successfully:', JSON.stringify(paymentData, null, 2));

    return new Response(JSON.stringify({
      success: true,
      payment_url: paymentData.redirect_url,
      payment_intent_id: paymentData.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('Payment creation error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || "Payment creation failed" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
