
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

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
    console.log('=== STARTING EMAIL CONFIRMATION PROCESS ===');
    console.log('Processing order confirmation for order ID:', orderId);

    // Initialize Resend with the correct API key name
    const resendApiKey = Deno.env.get("RESEND_API_KEY_REAL");
    console.log('Resend API key configured:', !!resendApiKey);
    console.log('Resend API key value (first 10 chars):', resendApiKey?.substring(0, 10));
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY_REAL not found in environment variables');
      console.log('Available env vars:', Object.keys(Deno.env.toObject()));
      throw new Error('RESEND_API_KEY_REAL not configured');
    }
    
    const resend = new Resend(resendApiKey);

    // Create Supabase client using service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log('=== STEP 1: FETCHING PAYMENT DETAILS ===');
    // Get payment details first
    const { data: payment, error: paymentError } = await supabaseService
      .from('successful_payments')
      .select('*')
      .eq('order_id', orderId)
      .eq('email_sent', false)
      .single();

    if (paymentError) {
      console.error('Payment query error:', paymentError);
      throw new Error(`Payment not found: ${paymentError.message}`);
    }

    if (!payment) {
      console.error('No payment found or email already sent for order:', orderId);
      return new Response(JSON.stringify({ error: 'Payment not found or email already sent' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    console.log('Payment found:', {
      id: payment.id,
      order_id: payment.order_id,
      customer_email: payment.customer_email,
      amount: payment.amount
    });

    console.log('=== STEP 2: FETCHING ORDER DETAILS ===');
    // Get order details
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Order query error:', orderError);
      throw new Error(`Order not found: ${orderError.message}`);
    }

    console.log('Order found:', {
      id: order.id,
      total: order.total,
      status: order.status,
      guest_name: order.guest_name
    });

    console.log('=== STEP 3: FETCHING ORDER ITEMS WITH PERFUMES ===');
    // Get order items with perfume details
    const { data: orderItems, error: itemsError } = await supabaseService
      .from('order_items')
      .select(`
        id,
        quantity,
        price,
        perfume_id,
        perfumes!inner(
          id,
          name,
          price_value,
          image
        )
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Order items query error:', itemsError);
      throw new Error(`Failed to fetch order items: ${itemsError.message}`);
    }

    console.log('Order items found:', orderItems?.length || 0);
    console.log('Order items details:', orderItems?.map(item => ({
      perfume_name: item.perfumes?.name,
      quantity: item.quantity,
      price: item.price
    })));

    if (!orderItems || orderItems.length === 0) {
      console.error('No order items found for order:', orderId);
      throw new Error('No order items found');
    }

    console.log('=== STEP 4: GETTING CUSTOMER DETAILS ===');
    // Get customer details
    let customerPhone = 'Not provided';
    let customerName = payment.customer_name || order.guest_name || 'Guest Customer';
    let customerEmail = payment.customer_email;

    if (payment.user_id) {
      console.log('Fetching user profile for user_id:', payment.user_id);
      const { data: profile, error: profileError } = await supabaseService
        .from('profiles')
        .select('full_name, phone')
        .eq('id', payment.user_id)
        .single();
      
      if (!profileError && profile) {
        customerName = profile.full_name || customerName;
        customerPhone = profile.phone || customerPhone;
        console.log('Profile found:', { full_name: profile.full_name, phone: profile.phone });
      } else {
        console.log('No profile found or error:', profileError);
      }

      // Get user email from auth if not in payment
      if (!customerEmail) {
        const { data: { user }, error: userError } = await supabaseService.auth.admin.getUserById(payment.user_id);
        if (!userError && user) {
          customerEmail = user.email || 'user@example.com';
        }
      }
    } else {
      // For guest orders, try to extract phone from delivery address
      console.log('Processing guest order, extracting details from delivery address');
      const addressParts = payment.delivery_address?.split('|') || [];
      for (const part of addressParts) {
        if (part.includes('Phone:')) {
          customerPhone = part.replace('Phone:', '').trim();
          break;
        }
      }
    }

    console.log('Customer details:', { customerName, customerEmail, customerPhone });

    console.log('=== STEP 5: CALCULATING TOTALS AND FORMATTING PRODUCT DETAILS ===');
    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    const shipping = 1;
    const total = subtotal + shipping;

    console.log('Order totals:', { subtotal, shipping, total });

    // Create product details string for database - FIXED FORMAT
    const productDetails = orderItems.map((item) => {
      const perfumeName = item.perfumes?.name || 'Unknown Product';
      return `${perfumeName} (Qty: ${item.quantity})`;
    }).join(', ');

    console.log('Product details for database:', productDetails);

    // Format order items for email HTML
    const orderItemsHtml = orderItems.map((item) => {
      const perfumeName = item.perfumes?.name || 'Unknown Product';
      const imageUrl = item.perfumes?.image || '/placeholder.svg';
      
      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; text-align: left;">
            <div style="display: flex; align-items: center;">
              <img src="${imageUrl}" alt="${perfumeName}" 
                   style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 12px;">
              <span>${perfumeName}</span>
            </div>
          </td>
          <td style="padding: 12px; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; text-align: right;">AED ${item.price.toFixed(2)}</td>
          <td style="padding: 12px; text-align: right;">AED ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    console.log('=== STEP 6: PREPARING EMAIL TEMPLATES ===');
    // Customer thank you email
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
                  <p style="margin: 5px 0;"><strong>Order ID:</strong> #${payment.order_id.substring(0, 8)}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(payment.created_at).toLocaleDateString()}</p>
                  <p style="margin: 5px 0;"><strong>Customer:</strong> ${customerName}</p>
                </div>
                <div>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${customerEmail}</p>
                  <p style="margin: 5px 0;"><strong>Phone:</strong> ${customerPhone}</p>
                  <p style="margin: 5px 0;"><strong>Total:</strong> <span style="color: #d4af37; font-weight: bold;">AED ${total.toFixed(2)}</span></p>
                </div>
              </div>
            </div>

            <!-- Delivery Address -->
            <div style="padding: 25px 20px; background-color: white;">
              <h3 style="color: #d4af37; margin-top: 0; font-size: 18px;">Delivery Address</h3>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #d4af37;">
                <p style="margin: 0; font-size: 15px; line-height: 1.5;">
                  ${payment.delivery_address || 'Address not provided'}
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

            <!-- What's Next -->
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

    // Delivery team email with simplified item formatting
    const deliveryItemsHtml = orderItems.map((item) => {
      const perfumeName = item.perfumes?.name || 'Unknown Product';
      const imageUrl = item.perfumes?.image || '/placeholder.svg';
      
      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 15px; text-align: left;">
            <div style="display: flex; align-items: center;">
              <img src="${imageUrl}" alt="${perfumeName}" 
                   style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; margin-right: 10px;">
              <span style="font-weight: 500;">${perfumeName}</span>
            </div>
          </td>
          <td style="padding: 15px; text-align: center; font-weight: bold; color: #dc3545; font-size: 16px;">${item.quantity}</td>
          <td style="padding: 15px; text-align: right; font-weight: 500;">AED ${item.price.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

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
                  <p style="margin: 5px 0;"><strong>Order ID:</strong> #${payment.order_id.substring(0, 8)}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(payment.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p style="margin: 5px 0;"><strong>Total Amount:</strong> <span style="color: #dc3545; font-weight: bold;">AED ${total.toFixed(2)}</span></p>
                  <p style="margin: 5px 0;"><strong>Payment:</strong> <span style="color: #28a745;">CONFIRMED</span></p>
                </div>
              </div>
            </div>

            <!-- Customer Information -->
            <div style="background-color: #e8f4fd; padding: 25px 20px;">
              <h3 style="margin-top: 0; color: #333; font-size: 18px;">Customer Information</h3>
              <div style="background-color: white; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
                <p style="margin: 5px 0;"><strong>Name:</strong> ${customerName}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${customerPhone}" style="color: #007bff; text-decoration: none;">${customerPhone}</a></p>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #007bff; text-decoration: none;">${customerEmail}</a></p>
              </div>
            </div>

            <!-- Delivery Address -->
            <div style="padding: 25px 20px; background-color: white;">
              <h3 style="color: #dc3545; margin-top: 0; font-size: 18px;">🎯 Delivery Address</h3>
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border: 2px solid #ffc107; font-size: 16px; font-weight: bold; line-height: 1.6;">
                ${payment.delivery_address || 'Address not provided'}
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
                    <th style="padding: 12px; text-align: right; color: white; font-weight: bold;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${deliveryItemsHtml}
                  <tr style="background-color: #f9f9f9; border-top: 2px solid #dc3545;">
                    <td style="padding: 15px; text-align: right; font-weight: bold;" colspan="2">Total Amount:</td>
                    <td style="padding: 15px; text-align: right; font-weight: bold; color: #dc3545; font-size: 18px;">AED ${total.toFixed(2)}</td>
                  </tr>
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

    console.log('=== STEP 7: SENDING CUSTOMER EMAIL ===');
    console.log('Sending customer email to:', customerEmail);

    // Send email to customer
    const customerEmailResult = await resend.emails.send({
      from: 'Senteur Fragrances <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `Thank You for Your Order #${payment.order_id.substring(0, 8)} - Senteur Fragrances`,
      html: customerEmailHtml,
    });

    console.log('Customer email result:', customerEmailResult);

    if (customerEmailResult.error) {
      console.error('Customer email failed:', customerEmailResult.error);
      throw new Error(`Customer email failed: ${customerEmailResult.error.message}`);
    }

    console.log('=== STEP 8: SENDING DELIVERY TEAM EMAIL ===');
    // Send email to delivery team
    const deliveryTeamEmail = "ashrafshamma09@gmail.com";
    console.log('Sending delivery email to:', deliveryTeamEmail);

    const deliveryEmailResult = await resend.emails.send({
      from: 'Senteur Fragrances <onboarding@resend.dev>',
      to: [deliveryTeamEmail],
      subject: `🚚 New Delivery Order #${payment.order_id.substring(0, 8)} - Senteur Fragrances`,
      html: deliveryEmailHtml,
    });

    console.log('Delivery email result:', deliveryEmailResult);

    if (deliveryEmailResult.error) {
      console.error('Delivery email failed:', deliveryEmailResult.error);
      throw new Error(`Delivery email failed: ${deliveryEmailResult.error.message}`);
    }

    console.log('=== STEP 9: UPDATING PAYMENT RECORD ===');
    // Update the payment record with product details and mark email as sent
    const { error: updateError } = await supabaseService
      .from('successful_payments')
      .update({ 
        email_sent: true, 
        email_sent_at: new Date().toISOString(),
        product_details: productDetails
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment record:', updateError);
      throw updateError;
    }

    console.log('Payment record updated successfully');
    console.log('Product details saved:', productDetails);
    console.log('=== EMAIL CONFIRMATION PROCESS COMPLETED SUCCESSFULLY ===');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Order confirmation emails sent successfully',
      customerEmail: customerEmailResult,
      deliveryEmail: deliveryEmailResult,
      productDetails: productDetails,
      orderTotal: total,
      itemCount: orderItems.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('=== EMAIL CONFIRMATION ERROR ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
