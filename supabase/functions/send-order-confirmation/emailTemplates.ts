
interface EmailTemplate {
  subject: string;
  html: string;
}

export function createConfirmationEmailTemplate(
  recipientName: string,
  order: any,
  itemsList: string
): EmailTemplate {
  return {
    subject: "Thank you for your order - Senteur Fragrances",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; margin: 0;">Thank You for Your Order!</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${recipientName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for placing an order with Senteur Fragrances! We're excited to prepare your premium fragrances for delivery.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Your order has been confirmed and is being processed. We'll notify you once it's ready for delivery.
          </p>
        </div>

        <div style="background-color: #fff; border: 1px solid #eee; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #D4AF37; margin-top: 0;">📋 Order Summary</h3>
          <p><strong>Order ID:</strong> #${order.id.substring(0, 8)}</p>
          <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
          <p><strong>Order Total:</strong> AED ${order.total.toFixed(2)}</p>
          
          <h4 style="color: #333; margin-bottom: 10px;">Items Ordered:</h4>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <pre style="margin: 0; white-space: pre-wrap; font-family: Arial, sans-serif;">${itemsList}</pre>
          </div>
        </div>

        <div style="background-color: #f0f8ff; border-left: 4px solid #D4AF37; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">🚚 What's Next?</h3>
          <p style="color: #666; line-height: 1.6;">
            • Your order is being carefully prepared<br>
            • We'll process and ship within 1-2 business days<br>
            • You'll receive a delivery confirmation email once shipped<br>
            • Delivery typically takes 1-3 business days in UAE
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px; margin: 5px 0;">
            Senteur Fragrances - Premium Perfumes for Every Occasion
          </p>
          <p style="color: #999; font-size: 14px; margin: 5px 0;">
            Questions? Contact our support team anytime
          </p>
        </div>
      </div>
    `
  };
}

export function createDeliveryEmailTemplate(
  recipientName: string,
  order: any,
  itemsList: string
): EmailTemplate {
  return {
    subject: "🎉 Your Senteur Fragrances Order Has Been Delivered!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; margin: 0;">🎉 Your Order Has Been Delivered!</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${recipientName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Great news! Your Senteur Fragrances order has been successfully delivered to your address.
          </p>
        </div>

        <div style="background-color: #fff; border: 1px solid #eee; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #D4AF37; margin-top: 0;">📦 Order Details</h3>
          <p><strong>Order ID:</strong> #${order.id.substring(0, 8)}</p>
          <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
          <p><strong>Order Total:</strong> AED ${order.total.toFixed(2)}</p>
          
          <h4 style="color: #333; margin-bottom: 10px;">Items Delivered:</h4>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <pre style="margin: 0; white-space: pre-wrap; font-family: Arial, sans-serif;">${itemsList}</pre>
          </div>
        </div>

        <div style="background-color: #f0f8ff; border-left: 4px solid #D4AF37; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-top: 0;">💝 Thank You for Choosing Senteur Fragrances</h3>
          <p style="color: #666; line-height: 1.6;">
            We hope you love your new fragrances! Your order has been carefully prepared and delivered with love.
          </p>
        </div>

        <div style="background-color: #fff; border: 1px solid #eee; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #D4AF37; margin-top: 0;">⭐ How Was Your Experience?</h3>
          <p style="color: #666; line-height: 1.6;">
            We'd love to hear about your experience! Your feedback helps us serve you better.
          </p>
          <p style="color: #666;">
            If you have any questions about your order or need assistance, please don't hesitate to reach out to us.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px; margin: 5px 0;">
            Senteur Fragrances - Premium Perfumes Delivered
          </p>
          <p style="color: #999; font-size: 14px; margin: 5px 0;">
            For support, contact us at your convenience
          </p>
        </div>
      </div>
    `
  };
}
