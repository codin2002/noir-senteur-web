
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    // Get payment details with user profile for phone number
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

    // Get user profile for phone number
    const { data: profile } = await supabaseService
      .from('profiles')
      .select('phone')
      .eq('id', payment.user_id)
      .single();

    const customerPhone = profile?.phone || 'Not provided';

    // Format order items for email
    const orderItemsHtml = payment.orders.order_items.map((item: any) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; text-align: left;">${item.perfumes.name}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">AED ${item.price}</td>
        <td style="padding: 12px; text-align: right;">AED ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const subtotal = payment.orders.order_items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    const shipping = 1;
    const total = subtotal + shipping;

    // Customer email HTML
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation - Senteur Fragrances</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d4af37; margin-bottom: 10px;">Senteur Fragrances</h1>
            <h2 style="color: #333; margin-top: 0;">Order Confirmation</h2>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #d4af37;">Order Details</h3>
            <p><strong>Order ID:</strong> ${payment.order_id}</p>
            <p><strong>Date:</strong> ${new Date(payment.created_at).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${payment.customer_name}</p>
            <p><strong>Email:</strong> ${payment.customer_email}</p>
            <p><strong>Phone:</strong> ${customerPhone}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #d4af37;">Delivery Address</h3>
            <p style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 0;">
              ${payment.delivery_address}
            </p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #d4af37;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: white; border: 1px solid #ddd;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
                <tr style="border-top: 2px solid #ddd; background-color: #f9f9f9;">
                  <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Subtotal:</td>
                  <td style="padding: 12px; text-align: right; font-weight: bold;">AED ${subtotal.toFixed(2)}</td>
                </tr>
                <tr style="background-color: #f9f9f9;">
                  <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Shipping:</td>
                  <td style="padding: 12px; text-align: right; font-weight: bold;">AED ${shipping.toFixed(2)}</td>
                </tr>
                <tr style="background-color: #f9f9f9;">
                  <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px;">Total:</td>
                  <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px; color: #d4af37;">AED ${total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #333;">Payment Information</h3>
            <p><strong>Payment Method:</strong> ${payment.payment_method.toUpperCase()}</p>
            <p><strong>Payment Status:</strong> ${payment.payment_status.toUpperCase()}</p>
            <p><strong>Amount Paid:</strong> AED ${payment.amount}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #d4af37;">
            <h3 style="margin-top: 0; color: #333;">Important Information</h3>
            <p>Your order will be delivered within 2-3 business days to the address provided above.</p>
            <p><strong>If there are any issues with your order, please contact us:</strong></p>
            <ul style="margin: 10px 0;">
              <li><strong>Phone:</strong> +971 50 963 5636</li>
              <li><strong>Email:</strong> senteur.ae@gmail.com</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="color: #666; margin: 0;">Thank you for choosing Senteur Fragrances!</p>
          </div>
        </body>
      </html>
    `;

    // Delivery team email HTML
    const deliveryEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Delivery Order - Senteur Fragrances</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d4af37; margin-bottom: 10px;">Senteur Fragrances</h1>
            <h2 style="color: #333; margin-top: 0;">New Delivery Order</h2>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #d4af37;">Order Details</h3>
            <p><strong>Order ID:</strong> ${payment.order_id}</p>
            <p><strong>Date:</strong> ${new Date(payment.created_at).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> AED ${payment.amount}</p>
          </div>

          <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #333;">Customer Information</h3>
            <p><strong>Name:</strong> ${payment.customer_name}</p>
            <p><strong>Email:</strong> ${payment.customer_email}</p>
            <p><strong>Phone:</strong> ${customerPhone}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #d4af37;">Delivery Address</h3>
            <p style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 0; font-size: 16px; font-weight: bold;">
              ${payment.delivery_address}
            </p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #d4af37;">Items to Deliver</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: white; border: 1px solid #ddd;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${payment.orders.order_items.map((item: any) => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px; text-align: left;">${item.perfumes.name}</td>
                    <td style="padding: 12px; text-align: center; font-weight: bold;">${item.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #d4af37;">
            <h3 style="margin-top: 0; color: #333;">Delivery Instructions</h3>
            <p>Please deliver this order within 2-3 business days.</p>
            <p><strong>Customer Contact:</strong> ${customerPhone}</p>
            <p><strong>If there are delivery issues, contact customer support:</strong></p>
            <ul style="margin: 10px 0;">
              <li><strong>Phone:</strong> +971 50 963 5636</li>
              <li><strong>Email:</strong> senteur.ae@gmail.com</li>
            </ul>
          </div>
        </body>
      </html>
    `;

    // Send email to customer
    const customerEmailResult = await resend.emails.send({
      from: 'Senteur Fragrances <onboarding@resend.dev>',
      to: [payment.customer_email],
      subject: `Order Confirmation #${payment.order_id} - Senteur Fragrances`,
      html: customerEmailHtml,
    });

    console.log('Customer email sent:', customerEmailResult);

    // Send email to delivery team
    const deliveryTeamEmail = Deno.env.get("DELIVERY_TEAM_EMAIL");
    if (deliveryTeamEmail) {
      const deliveryEmailResult = await resend.emails.send({
        from: 'Senteur Fragrances <onboarding@resend.dev>',
        to: [deliveryTeamEmail],
        subject: `New Delivery Order #${payment.order_id} - Senteur Fragrances`,
        html: deliveryEmailHtml,
      });

      console.log('Delivery team email sent:', deliveryEmailResult);
    }

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
      message: 'Order confirmation emails sent successfully',
      customerEmail: customerEmailResult,
      deliveryTeamNotified: !!deliveryTeamEmail
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error sending order confirmation emails:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
