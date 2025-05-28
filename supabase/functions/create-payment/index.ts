
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Constants to match frontend pricing
const PRICING = {
  SHIPPING_COST: 4.99,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== CREATE PAYMENT FUNCTION CALLED ===");
    
    const { cartItems, deliveryAddress, isGuest, userId } = await req.json();
    
    console.log("Is guest checkout:", isGuest);
    console.log("User ID:", userId);
    console.log("Cart items count:", cartItems?.length || 0);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    let itemsToProcess = cartItems || [];

    // For authenticated users, get cart from database
    if (!isGuest && userId) {
      const { data: dbCartItems, error } = await supabaseClient.rpc('get_cart_with_perfumes', {
        user_uuid: userId
      });
      
      if (error) {
        console.error('Error fetching cart from database:', error);
        throw new Error('Failed to fetch cart items');
      }
      
      if (dbCartItems && dbCartItems.length > 0) {
        itemsToProcess = dbCartItems;
      }
    }

    if (!itemsToProcess || itemsToProcess.length === 0) {
      throw new Error('No items in cart');
    }

    // Calculate totals with correct shipping logic
    let subtotal = 0;
    let totalQuantity = 0;
    
    itemsToProcess.forEach(item => {
      const perfume = item.perfume || item;
      const price = perfume.price_value || 100;
      const quantity = item.quantity || 1;
      
      console.log(`Item: ${perfume.name}, price: ${price}, quantity: ${quantity}`);
      
      subtotal += price * quantity;
      totalQuantity += quantity;
    });

    // Apply correct shipping logic - free shipping if 2+ items, otherwise 4.99 AED
    const shipping = subtotal > 0 && totalQuantity < 2 ? PRICING.SHIPPING_COST : 0;
    const total = subtotal + shipping;

    console.log("Calculated subtotal:", subtotal, "shipping:", shipping, "total:", total);

    // Convert to fils (1 AED = 100 fils)
    const amountInFils = Math.round(total * 100);

    if (!deliveryAddress?.trim()) {
      throw new Error('Delivery address is required');
    }

    // Get Ziina API key
    const ziinaApiKey = Deno.env.get("ZIINA_API_KEY");
    if (!ziinaApiKey) {
      console.error("ZIINA_API_KEY not found in environment variables");
      throw new Error('Payment service configuration error');
    }

    console.log("Ziina API key found:", ziinaApiKey ? "Yes" : "No");

    // Create expiry timestamp (30 minutes from now)
    const currentTimeMs = Date.now();
    const expiryDurationMs = 30 * 60 * 1000; // 30 minutes
    const expiryTimestamp = currentTimeMs + expiryDurationMs;

    console.log("Current time:", currentTimeMs);
    console.log("Expiry time:", expiryTimestamp);
    console.log("Expiry in 30 minutes:", new Date(expiryTimestamp).toISOString());

    // Create Ziina payment with correct endpoint and format
    const ziinaPayload = {
      amount: amountInFils,
      currency_code: "AED",
      message: `Senteur Fragrances Order - ${itemsToProcess.length} item(s)`,
      success_url: `https://senteurfragrances.com/payment-success?payment_intent_id={PAYMENT_INTENT_ID}`,
      cancel_url: `https://senteurfragrances.com/cart?payment=cancelled`,
      failure_url: `https://senteurfragrances.com/payment-failed`,
      expiry: expiryTimestamp.toString(), // Convert to string as required by Ziina API
      test: false,
      transaction_source: "directApi",
      allow_tips: false
    };

    console.log("Creating Ziina payment with payload:", ziinaPayload);

    // Add timeout and better error handling for the Ziina API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      console.log("=== MAKING ZIINA API REQUEST ===");
      console.log("URL: https://api-v2.ziina.com/api/payment_intent");
      console.log("Method: POST");
      console.log("Headers: Authorization: Bearer [REDACTED], Content-Type: application/json");
      
      const ziinaResponse = await fetch("https://api-v2.ziina.com/api/payment_intent", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ziinaApiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "Senteur-Fragrances/1.0",
          "Accept": "application/json"
        },
        body: JSON.stringify(ziinaPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Ziina API response status:", ziinaResponse.status);
      console.log("Ziina API response headers:", Object.fromEntries(ziinaResponse.headers.entries()));

      if (!ziinaResponse.ok) {
        const errorText = await ziinaResponse.text();
        console.error("Ziina API error response:", errorText);
        console.error("Ziina API error status:", ziinaResponse.status);
        console.error("Ziina API error statusText:", ziinaResponse.statusText);
        
        throw new Error(`Ziina API error (${ziinaResponse.status}): ${errorText || ziinaResponse.statusText}`);
      }

      const ziinaData = await ziinaResponse.json();
      console.log("Ziina payment created successfully:", ziinaData);

      return new Response(JSON.stringify({
        success: true,
        payment_url: ziinaData.redirect_url,
        payment_intent_id: ziinaData.id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      console.error("=== DETAILED FETCH ERROR ===");
      console.error("Error type:", typeof fetchError);
      console.error("Error constructor:", fetchError.constructor.name);
      console.error("Error name:", fetchError.name);
      console.error("Error message:", fetchError.message);
      console.error("Error stack:", fetchError.stack);
      
      if (fetchError.name === 'AbortError') {
        console.error("Ziina API request timed out after 30 seconds");
        throw new Error('Payment service timeout - please try again');
      }
      
      if (fetchError.name === 'TypeError' && fetchError.message.includes('error sending request')) {
        console.error("Network connectivity issue detected");
        throw new Error('Unable to connect to payment service. This may be a temporary network issue. Please try again in a few minutes.');
      }
      
      throw new Error(`Payment service connection error: ${fetchError.message}`);
    }

  } catch (error: any) {
    console.error("=== PAYMENT CREATION ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error constructor:", error.constructor?.name);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: {
        message: error.message || "Payment creation failed",
        type: error.name || "UnknownError",
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
