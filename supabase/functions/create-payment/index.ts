
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
    
    // Validate request payload
    if (!Array.isArray(cartItems) || typeof deliveryAddress !== "string") {
      console.error('Invalid request payload:', { cartItems: Array.isArray(cartItems), deliveryAddress: typeof deliveryAddress });
      return new Response(JSON.stringify({ 
        success: false,
        error: { message: "Invalid request payload", details: "cartItems must be array and deliveryAddress must be string" }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log('Received cart items:', JSON.stringify(cartItems, null, 2));

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(JSON.stringify({ 
        success: false,
        error: { message: "Authorization header missing", details: "Authentication required" }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Extract the token from the Bearer header
    const token = authHeader.replace("Bearer ", "");
    console.log('Token extracted, length:', token.length);
    
    // Get user from the token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    console.log('Auth response:', { user: user?.email, error: authError });
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ 
        success: false,
        error: { message: "Invalid or expired token", details: authError?.message || 'Authentication failed' }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    console.log('Authenticated user:', user.email);

    // Calculate totals - handle both data structures
    const subtotal = cartItems.reduce((sum: number, item: any) => {
      // Handle both structures: item.perfume.price_value or item.price
      const price = item.perfume?.price_value || item.price || 0;
      const quantity = item.quantity || 1;
      
      console.log(`Item price: ${price}, quantity: ${quantity}`);
      return sum + (price * quantity);
    }, 0);
    
    const shippingCost = 1; // Updated shipping cost
    const total = subtotal + shippingCost;

    console.log(`Calculated subtotal: ${subtotal}, shipping: ${shippingCost}, total: ${total}`);

    // Get Ziina API key from environment
    const ziinaApiKey = Deno.env.get("ZIINA_API_KEY");
    if (!ziinaApiKey) {
      throw new Error("Ziina API key not configured");
    }

    const baseUrl = req.headers.get("origin") || "https://senteurfragrances.com";
    
    // Set payment expiry to 15 minutes from now as Unix timestamp string
    const expiryTimestamp = Math.floor(Date.now() / 1000) + (15 * 60); // 15 minutes in seconds

    // Create Ziina payment request with enhanced configuration
    const ziinaPayload = {
      amount: Math.round(total * 100), // Convert to fils
      currency_code: "AED",
      message: `Senteur Fragrances Order - ${cartItems.length} item(s)`,
      success_url: `${baseUrl}/payment-success?payment_intent_id={PAYMENT_INTENT_ID}`,
      cancel_url: `${baseUrl}/cart?payment=cancelled`,
      failure_url: `${baseUrl}/payment-failed`,
      expiry: expiryTimestamp.toString(), // Convert to string format as required by Ziina API
      test: false, // Set to false for production mode
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
      return new Response(JSON.stringify({ 
        success: false,
        error: { 
          message: `Ziina API error (${ziinaResponse.status})`,
          details: errorText 
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const ziinaData = await ziinaResponse.json();
    console.log('Ziina payment created successfully:', ziinaData);

    // Return the payment URL and details
    return new Response(JSON.stringify({ 
      success: true,
      payment_url: ziinaData.redirect_url,
      payment_id: ziinaData.id,
      total_amount: total.toString(),
      expiry: expiryTimestamp.toString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error creating payment session:', {
      message: error.message,
      stack: error.stack,
      requestBody: { cartItems: 'redacted', deliveryAddress: 'redacted' }, // Don't log sensitive data
    });
    return new Response(JSON.stringify({ 
      success: false,
      error: {
        message: error.message || "Payment creation failed",
        details: error.toString()
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
