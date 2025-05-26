
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
    const { orderId } = await req.json();

    // Create Supabase client using service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseService
      .from('successful_payments')
      .select(`
        *,
        orders!inner(
          *,
          order_items(
            *,
            perfumes(name, price)
          )
        )
      `)
      .eq('order_id', orderId)
      .eq('email_sent', false)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found or email already sent:', paymentError);
      return new Response(JSON.stringify({ error: 'Payment not found or email already sent' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // TODO: Implement email sending logic here
    // For now, we'll just log the email details and mark as sent
    console.log('Sending order confirmation email to:', payment.customer_email);
    console.log('Order details:', {
      orderId: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      items: payment.orders.order_items
    });

    // Mock email sending - in production, you'd integrate with an email service like Resend
    const emailContent = {
      to: payment.customer_email,
      subject: 'Order Confirmation - Senteur Fragrances',
      orderNumber: payment.order_id,
      customerName: payment.customer_name,
      totalAmount: payment.amount,
      currency: payment.currency,
      items: payment.orders.order_items,
      deliveryAddress: payment.delivery_address
    };

    console.log('Email would be sent with content:', emailContent);

    // Mark email as sent
    const { error: updateError } = await supabaseService
      .from('successful_payments')
      .update({ 
        email_sent: true, 
        email_sent_at: new Date().toISOString() 
      })
      .eq('id', payment.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Order confirmation email sent successfully',
      emailContent 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error sending order confirmation email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
