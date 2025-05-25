
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

    // TODO: Integrate with Ziina API when ready
    // For now, we'll just return a placeholder response
    console.log('Payment request received:', {
      userId: user.id,
      email: user.email,
      deliveryAddress,
      cartItems: cartItems.map((item: any) => ({
        perfume_id: item.perfume_id,
        quantity: item.quantity,
        price: item.perfume.price_value
      })),
      subtotal,
      shippingCost,
      total
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Payment processing with Ziina will be implemented",
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
