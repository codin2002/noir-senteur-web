
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    const { cartItems, deliveryMethod, deliveryAddress, pickupPointId } = await req.json();

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

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum: number, item: any) => 
      sum + (item.perfume.price_value * item.quantity), 0
    );
    const shippingCost = deliveryMethod === 'home' ? 20 : 0;
    const total = subtotal + shippingCost;

    // Create line items for Stripe
    const lineItems = cartItems.map((item: any) => ({
      price_data: {
        currency: "aed",
        product_data: {
          name: item.perfume.name,
          description: item.perfume.description,
          images: [item.perfume.image],
        },
        unit_amount: Math.round(item.perfume.price_value * 100), // Convert to fils (AED cents)
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if applicable
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "aed",
          product_data: {
            name: "Home Delivery",
            description: "Delivery to your address",
          },
          unit_amount: Math.round(shippingCost * 100), // Convert to fils
        },
        quantity: 1,
      });
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/cart?payment=success`,
      cancel_url: `${req.headers.get("origin")}/cart?payment=cancelled`,
      metadata: {
        user_id: user.id,
        delivery_method: deliveryMethod,
        delivery_address: deliveryAddress,
        pickup_point_id: pickupPointId || "",
        cart_items: JSON.stringify(cartItems.map((item: any) => ({
          perfume_id: item.perfume_id,
          quantity: item.quantity,
          price: item.perfume.price_value
        }))),
        total_amount: total.toString(),
      },
    });

    console.log('Payment session created:', session.id);

    return new Response(JSON.stringify({ url: session.url }), {
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
