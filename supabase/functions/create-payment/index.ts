
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { cartItems, deliveryAddress } = await req.json();

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item: any) => 
      sum + (item.perfume.price_value * item.quantity), 0
    );
    const shippingCost = 4.99; // Fixed delivery charge
    const total = subtotal + shippingCost;

    // Get Ziina API key from environment
    const ziinaApiKey = Deno.env.get("ZIINA_API_KEY");
    if (!ziinaApiKey) {
      throw new Error("Ziina API key not configured");
    }

    // Create Ziina payment request with correct API v2 format
    const ziinaPayload = {
      amount: Math.round(total * 100), // Convert to fils
      currency_code: "AED",
      message: `Senteur Fragrances Order - ${cartItems.length} item(s)`,
      success_url: `${req.headers.get("origin") || "https://senteurfragrances.com"}/cart?payment=success`,
      cancel_url: `${req.headers.get("origin") || "https://senteurfragrances.com"}/cart?payment=cancelled`,
      test: true, // Set to true for testing
      transaction_source: "directApi",
      allow_tips: false,
    };

    console.log('Creating Ziina payment with payload:', ziinaPayload);

    // Call Ziina API using the correct v2 endpoint
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
      console.error('Ziina API error response:', errorText);
      throw new Error(`Ziina API error (${ziinaResponse.status}): ${errorText}`);
    }

    const ziinaData = await ziinaResponse.json();
    console.log('Ziina payment created successfully:', ziinaData);

    // Return the payment URL and details
    return new Response(JSON.stringify({ 
      success: true,
      payment_url: ziinaData.redirect_url,
      payment_id: ziinaData.id,
      total_amount: total.toString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Payment creation failed",
      details: error.toString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
