
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

    // Create Ziina payment request
    const ziinaPayload = {
      amount: total,
      currency: "AED",
      description: `Senteur Fragrances Order - ${cartItems.length} item(s)`,
      customer: {
        name: user.user_metadata?.full_name || "Customer",
        email: user.email,
      },
      metadata: {
        user_id: user.id,
        delivery_address: deliveryAddress,
        order_items: cartItems.map((item: any) => ({
          perfume_id: item.perfume_id,
          quantity: item.quantity,
          price: item.perfume.price_value
        }))
      }
    };

    console.log('Creating Ziina payment with payload:', ziinaPayload);

    // Call Ziina API to create payment
    const ziinaResponse = await fetch("https://api.ziina.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ziinaApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ziinaPayload),
    });

    if (!ziinaResponse.ok) {
      const errorData = await ziinaResponse.text();
      console.error('Ziina API error:', errorData);
      throw new Error(`Ziina payment creation failed: ${ziinaResponse.status}`);
    }

    const ziinaData = await ziinaResponse.json();
    console.log('Ziina payment created successfully:', ziinaData);

    return new Response(JSON.stringify({ 
      success: true,
      payment_url: ziinaData.payment_url || ziinaData.checkout_url,
      payment_id: ziinaData.id,
      total_amount: total.toString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
