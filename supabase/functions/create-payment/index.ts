
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

    // Create Ziina payment request with correct endpoint and format
    const ziinaPayload = {
      amount: Math.round(total * 100), // Convert to fils (smallest currency unit)
      currency: "AED",
      description: `Senteur Fragrances Order - ${cartItems.length} item(s)`,
      customer: {
        name: user.user_metadata?.full_name || "Customer",
        email: user.email,
      },
      redirect: {
        success_url: `${req.headers.get("origin") || "https://gzddmdwgzcnikqurtnsy.supabase.co"}/cart?payment=success`,
        cancel_url: `${req.headers.get("origin") || "https://gzddmdwgzcnikqurtnsy.supabase.co"}/cart?payment=cancelled`
      },
      metadata: {
        user_id: user.id,
        delivery_address: deliveryAddress,
        order_items: JSON.stringify(cartItems.map((item: any) => ({
          perfume_id: item.perfume_id,
          quantity: item.quantity,
          price: item.perfume.price_value
        })))
      }
    };

    console.log('Creating Ziina payment with payload:', ziinaPayload);

    // Call Ziina API using the correct endpoint
    const ziinaResponse = await fetch("https://api.ziina.com/v1/payment_intents", {
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
      
      // Try to parse error as JSON
      let errorMessage = `Ziina API error (${ziinaResponse.status})`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const ziinaData = await ziinaResponse.json();
    console.log('Ziina payment created successfully:', ziinaData);

    // Return the payment URL and details
    return new Response(JSON.stringify({ 
      success: true,
      payment_url: ziinaData.checkout_url || ziinaData.payment_url || ziinaData.url,
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
