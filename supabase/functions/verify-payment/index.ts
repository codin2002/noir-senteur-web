
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { validateZiinaPayment } from './paymentValidator.ts';
import { getCartItems } from './cartProcessor.ts';
import { calculateOrderTotal } from './orderCalculator.ts';
import { extractCustomerInfo } from './customerInfoExtractor.ts';
import { createOrder } from './orderCreator.ts';
import { recordSuccessfulPayment } from './paymentRecorder.ts';
import { sendOrderConfirmation } from './emailService.ts';
import { resolveUserId } from './userResolver.ts';
import { sendMetaPurchase } from '../_shared/metaConversions.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== VERIFY PAYMENT FUNCTION CALLED ===');
    
    const { paymentIntentId, deliveryAddress, isGuest, userId, cartItems, meta } = await req.json();
    
    console.log('Payment Intent ID:', paymentIntentId);
    console.log('Is Guest:', isGuest);
    console.log('User ID from request:', userId);
    console.log('Delivery Address:', deliveryAddress);
    console.log('Cart Items from request:', cartItems?.length || 0);

    // Create Supabase client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Resolve actual user ID
    const actualUserId = await resolveUserId(isGuest, userId, req, supabaseService);

    // Validate payment with Ziina
    const paymentValidation = await validateZiinaPayment(paymentIntentId);
    if (!paymentValidation.success) {
      return new Response(JSON.stringify({
        success: false,
        message: paymentValidation.message
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get cart items
    const orderCartItems = await getCartItems(isGuest, cartItems, actualUserId, supabaseService);

    // Calculate order totals
    const orderCalculation = await calculateOrderTotal(orderCartItems, supabaseService);

    // Extract customer information
    const customerInfo = await extractCustomerInfo(isGuest, actualUserId, deliveryAddress, supabaseService);

    // Create order
    const orderId = await createOrder(
      orderCalculation, 
      customerInfo, 
      isGuest, 
      actualUserId, 
      deliveryAddress, 
      supabaseService
    );

    // Record successful payment
    await recordSuccessfulPayment(
      paymentIntentId,
      orderId,
      orderCalculation,
      customerInfo,
      orderCartItems,
      deliveryAddress,
      isGuest,
      actualUserId,
      supabaseService
    );

    const trafficSource = meta?.trafficSource === 'meta_ads' || meta?.trafficSource === 'direct' ? meta.trafficSource : 'unknown';
    const { error: attributionError } = await supabaseService.from('orders').update({
      traffic_source: trafficSource,
      meta_click_id: typeof meta?.metaClickId === 'string' ? meta.metaClickId.slice(0, 500) : null,
      meta_fbc: typeof meta?.fbc === 'string' ? meta.fbc.slice(0, 255) : null,
      meta_fbp: typeof meta?.fbp === 'string' ? meta.fbp.slice(0, 255) : null,
      utm_source: typeof meta?.utmSource === 'string' ? meta.utmSource.slice(0, 255) : null,
      utm_campaign: typeof meta?.utmCampaign === 'string' ? meta.utmCampaign.slice(0, 255) : null,
      utm_content: typeof meta?.utmContent === 'string' ? meta.utmContent.slice(0, 255) : null,
      landing_url: typeof meta?.landingUrl === 'string' ? meta.landingUrl.slice(0, 1000) : null,
    }).eq('id', orderId);
    if (attributionError) console.error('Order attribution was not saved', attributionError);

    const [firstName, ...remainingNames] = customerInfo.customerName.trim().split(/\s+/);
    await sendMetaPurchase({
      orderId,
      value: orderCalculation.totalAmount,
      items: orderCartItems.map((item: any) => {
        const perfume = item.perfume || item;
        return {
          id: perfume.id || item.perfume_id,
          quantity: Number(item.quantity || 1),
          price: Number(perfume.price_value || item.price || 0),
        };
      }),
      email: customerInfo.customerEmail.endsWith('@example.com') ? null : customerInfo.customerEmail,
      phone: customerInfo.customerPhone,
      firstName,
      lastName: remainingNames.join(' '),
      externalId: actualUserId,
      fbp: typeof meta?.fbp === 'string' ? meta.fbp.slice(0, 255) : null,
      fbc: typeof meta?.fbc === 'string' ? meta.fbc.slice(0, 255) : null,
      clientIpAddress: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      clientUserAgent: req.headers.get('user-agent'),
    });

    // Send email confirmation
    await sendOrderConfirmation(orderId, supabaseService);

    console.log('=== VERIFICATION COMPLETE - RETURNING SUCCESS ===');

    return new Response(JSON.stringify({
      success: true,
      orderId: orderId,
      paymentMethod: 'Ziina',
      deliveryMethod: 'Home Delivery',
      deliveryAddress: deliveryAddress,
      message: 'Payment verified and order created successfully',
      emailStatus: 'Email sending attempted - check function logs for details'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Payment verification failed'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
