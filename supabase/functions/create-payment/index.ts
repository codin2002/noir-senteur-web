
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
      const price = perfume.price_value || 1;
      const quantity = item.quantity || 1;
      
      console.log(`Item: ${perfume.name}, price: ${price}, quantity: ${quantity}`);
      
      subtotal += price * quantity;
      totalQuantity += quantity;
    });

    // Apply correct shipping logic - free shipping if 2+ items, otherwise 1 AED
    const shipping = subtotal > 0 && totalQuantity < 2 ? 1 : 0;
    const total = subtotal + shipping;

    console.log("Calculated subtotal:", subtotal, "shipping:", shipping, "total:", total);

    // Convert to fils (1 AED = 100 fils)
    const amountInFils = Math.round(total * 100);

    if (!deliveryAddress?.trim()) {
      throw new Error('Delivery address is required');
    }

    // Create Ziina payment
    const ziinaPayload = {
      amount: amountInFils,
      currency_code: "AED",
      message: `Senteur Fragrances Order - ${itemsToProcess.length} item(s)`,
      success_url: `https://senteurfragrances.com/payment-success?payment_intent_id={PAYMENT_INTENT_ID}`,
      cancel_url: `https://senteurfragrances.com/cart?payment=cancelled`,
      failure_url: `https://senteurfragrances.com/payment-failed`,
      expiry: (Date.now() + 15 * 60 * 1000).toString(), // 15 minutes from now
      test: false,
      transaction_source: "directApi",
      allow_tips: false
    };

    console.log("Creating Ziina payment with payload:", ziinaPayload);

    const ziinaResponse = await fetch("https://api.ziina.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("ZIINA_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ziinaPayload),
    });

    console.log("Ziina API response status:", ziinaResponse.status);

    if (!ziinaResponse.ok) {
      const errorData = await ziinaResponse.text();
      console.error("Ziina API error:", errorData);
      throw new Error(`Ziina API error: ${ziinaResponse.status}`);
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

  } catch (error: any) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: {
        message: error.message || "Payment creation failed"
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
