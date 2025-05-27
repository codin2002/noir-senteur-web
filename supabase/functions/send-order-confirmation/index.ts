
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

    // Enhanced customer email HTML with better styling
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Thank You for Your Order - Senteur Fragrances</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: bold;">SENTEUR</h1>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">F R A G R A N C E S</p>
            </div>
            
            <!-- Thank You Message -->
            <div style="padding: 30px 20px; text-align: center; background-color: #fff;">
              <h2 style="color: #d4af37; margin: 0 0 15px 0; font-size: 24px;">Thank You for Shopping with Us!</h2>
              <p style="color: #666; margin: 0; font-size: 16px;">Your order has been confirmed and will be processed shortly.</p>
            </div>
            
            <!-- Order Details -->
            <div style="background-color: #f9f9f9; padding: 25px 20px; margin: 0;">
              <h3 style="margin-top: 0; color: #d4af37; font-size: 18px; border-bottom: 2px solid #d4af37; padding-bottom: 8px;">Order Details</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                <div>
                  <p style="margin: 5px 0;"><strong>Order ID:</strong> ${payment.order_id}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(payment.created_at).toLocaleDateString()}</p>
                  <p style="margin: 5px 0;"><strong>Customer:</strong> ${payment.customer_name}</p>
                </div>
                <div>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${payment.customer_email}</p>
                  <p style="margin: 5px 0;"><strong>Phone:</strong> ${customerPhone}</p>
                  <p style="margin: 5px 0;"><strong>Total:</strong> <span style="color: #d4af37; font-weight: bold;">AED ${payment.amount}</span></p>
                </div>
              </div>
            </div>

            <!-- Delivery Address -->
            <div style="padding: 25px 20px; background-color: white;">
              <h3 style="color: #d4af37; margin-top: 0; font-size: 18px;">Delivery Address</h3>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #d4af37;">
                <p style="margin: 0; font-size: 15px; line-height: 1.5;">
                  ${payment.delivery_address}
                </p>
              </div>
            </div>

            <!-- Order Items -->
            <div style="padding: 25px 20px; background-color: white;">
              <h3 style="color: #d4af37; margin-top: 0; font-size: 18px;">Your Order</h3>
              <table style="width: 100%; border-collapse: collapse; background-color: white; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%);">
                    <th style="padding: 12px; text-align: left; color: #333; font-weight: bold;">Item</th>
                    <th style="padding: 12px; text-align: center; color: #333; font-weight: bold;">Qty</th>
                    <th style="padding: 12px; text-align: right; color: #333; font-weight: bold;">Price</th>
                    <th style="padding: 12px; text-align: right; color: #333; font-weight: bold;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                  <tr style="border-top: 2px solid #d4af37; background-color: #f9f9f9;">
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

            <!-- Payment Info -->
            <div style="background-color: #e8f4fd; padding: 25px 20px;">
              <h3 style="margin-top: 0; color: #333; font-size: 18px;">Payment Information</h3>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${payment.payment_method.toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">${payment.payment_status.toUpperCase()}</span></p>
              <p style="margin: 5px 0;"><strong>Amount Paid:</strong> <span style="color: #d4af37; font-weight: bold;">AED ${payment.amount}</span></p>
            </div>

            <!-- Important Information -->
            <div style="background-color: #fff3cd; padding: 25px 20px; border-left: 4px solid #d4af37;">
              <h3 style="margin-top: 0; color: #333; font-size: 18px;">What's Next?</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
                <li>Your order will be delivered within 2-3 business days</li>
                <li>You'll receive a confirmation call before delivery</li>
                <li>Have your payment confirmation ready</li>
                <li>Ensure someone is available at the delivery address</li>
              </ul>
              <p style="margin-top: 20px;"><strong>Questions? Contact us:</strong></p>
              <p style="margin: 5px 0; color: #666;">📞 <strong>Phone:</strong> +971 50 963 5636</p>
              <p style="margin: 5px 0; color: #666;">✉️ <strong>Email:</strong> senteur.ae@gmail.com</p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 25px 20px; background-color: #333; color: white;">
              <p style="margin: 0; font-size: 16px; font-weight: bold;">Thank you for choosing Senteur Fragrances!</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #ccc;">We appreciate your business and look forward to serving you again.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enhanced delivery team email HTML
    const deliveryEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Delivery Order - Senteur Fragrances</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🚚 NEW DELIVERY ORDER</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Senteur Fragrances</p>
            </div>
            
            <!-- Order Summary -->
            <div style="background-color: #f9f9f9; padding: 25px 20px;">
              <h3 style="margin-top: 0; color: #dc3545; font-size: 18px; border-bottom: 2px solid #dc3545; padding-bottom: 8px;">Order Summary</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                <div>
                  <p style="margin: 5px 0;"><strong>Order ID:</strong> ${payment.order_id}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(payment.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p style="margin: 5px 0;"><strong>Total Amount:</strong> <span style="color: #dc3545; font-weight: bold;">AED ${payment.amount}</span></p>
                  <p style="margin: 5px 0;"><strong>Payment:</strong> <span style="color: #28a745;">CONFIRMED</span></p>
                </div>
              </div>
            </div>

            <!-- Customer Information -->
            <div style="background-color: #e8f4fd; padding: 25px 20px;">
              <h3 style="margin-top: 0; color: #333; font-size: 18px;">Customer Information</h3>
              <div style="background-color: white; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
                <p style="margin: 5px 0;"><strong>Name:</strong> ${payment.customer_name}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${customerPhone}" style="color: #007bff; text-decoration: none;">${customerPhone}</a></p>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${payment.customer_email}" style="color: #007bff; text-decoration: none;">${payment.customer_email}</a></p>
              </div>
            </div>

            <!-- Delivery Address -->
            <div style="padding: 25px 20px; background-color: white;">
              <h3 style="color: #dc3545; margin-top: 0; font-size: 18px;">🎯 Delivery Address</h3>
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border: 2px solid #ffc107; font-size: 16px; font-weight: bold; line-height: 1.6;">
                ${payment.delivery_address}
              </div>
            </div>

            <!-- Items to Deliver -->
            <div style="padding: 25px 20px; background-color: white;">
              <h3 style="color: #dc3545; margin-top: 0; font-size: 18px;">📦 Items to Deliver</h3>
              <table style="width: 100%; border-collapse: collapse; background-color: white; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%);">
                    <th style="padding: 12px; text-align: left; color: white; font-weight: bold;">Perfume</th>
                    <th style="padding: 12px; text-align: center; color: white; font-weight: bold;">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  ${payment.orders.order_items.map((item: any) => `
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 15px; text-align: left; font-weight: 500;">${item.perfumes.name}</td>
                      <td style="padding: 15px; text-align: center; font-weight: bold; color: #dc3545; font-size: 16px;">${item.quantity}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Delivery Instructions -->
            <div style="background-color: #d4edda; padding: 25px 20px; border-left: 4px solid #28a745;">
              <h3 style="margin-top: 0; color: #155724; font-size: 18px;">📋 Delivery Instructions</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #155724;">
                <li><strong>Delivery Window:</strong> 2-3 business days</li>
                <li><strong>Contact customer before delivery</strong></li>
                <li><strong>Verify order details with customer</strong></li>
                <li><strong>Collect payment confirmation if needed</strong></li>
                <li><strong>Get delivery confirmation signature</strong></li>
              </ul>
              
              <div style="background-color: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <p style="margin: 0; color: #333;"><strong>Support Contact:</strong></p>
                <p style="margin: 5px 0; color: #333;">📞 +971 50 963 5636</p>
                <p style="margin: 5px 0; color: #333;">✉️ senteur.ae@gmail.com</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 20px; background-color: #333; color: white;">
              <p style="margin: 0; font-size: 14px;">Senteur Fragrances Delivery Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to customer
    const customerEmailResult = await resend.emails.send({
      from: 'Senteur Fragrances <onboarding@resend.dev>',
      to: [payment.customer_email],
      subject: `Thank You for Your Order #${payment.order_id} - Senteur Fragrances`,
      html: customerEmailHtml,
    });

    console.log('Customer email sent:', customerEmailResult);

    // Send email to delivery team using the specific Gmail address
    const deliveryTeamEmail = "ashrafshamma09@gmail.com";
    const deliveryEmailResult = await resend.emails.send({
      from: 'Senteur Fragrances <onboarding@resend.dev>',
      to: [deliveryTeamEmail],
      subject: `🚚 New Delivery Order #${payment.order_id} - Senteur Fragrances`,
      html: deliveryEmailHtml,
    });

    console.log('Delivery team email sent:', deliveryEmailResult);

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
      deliveryTeamNotified: true
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
