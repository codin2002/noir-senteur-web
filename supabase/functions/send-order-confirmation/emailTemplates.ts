
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
        <!-- Header Banner -->
        <div style="background-color: #412300; color: white; text-align: center; padding: 30px 20px;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">SENTEUR</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; letter-spacing: 1px;">FRAGRANCES</p>
        </div>
        
        <!-- Thank You Section -->
        <div style="background-color: white; padding: 30px 20px; text-align: center;">
          <h2 style="color: #E53E3E; font-size: 24px; margin: 0 0 15px 0;">Thank You for Shopping with Us!</h2>
          <p style="color: #666; font-size: 16px; margin: 0;">Your order has been confirmed and will be processed shortly.</p>
        </div>

        <!-- Order Details -->
        <div style="background-color: white; padding: 20px; margin-top: 2px;">
          <h3 style="color: #E53E3E; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #E53E3E; padding-bottom: 5px;">Order Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">Order ID:</td>
              <td style="padding: 8px 0; color: #666;">#${order.id.substring(0, 8)}</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0; color: #666;">${order.user_id ? 'Account email' : order.guest_email || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">Date:</td>
              <td style="padding: 8px 0; color: #666;">${new Date(order.created_at).toLocaleDateString()}</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0; color: #666;">+971 ${order.guest_phone || 'On file'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">Customer:</td>
              <td style="padding: 8px 0; color: #666;">${recipientName}</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">Items:</td>
              <td style="padding: 8px 0; color: #666;">${order.items.length} item(s)</td>
            </tr>
            <tr>
              <td colspan="2"></td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">Total:</td>
              <td style="padding: 8px 0; color: #E53E3E; font-weight: bold;">AED ${order.total.toFixed(2)} (includes shipping)</td>
            </tr>
          </table>
        </div>

        <!-- Delivery Address -->
        <div style="background-color: white; padding: 20px; margin-top: 2px;">
          <h3 style="color: #E53E3E; font-size: 18px; margin: 0 0 15px 0;">Delivery Address</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #E53E3E;">
            <p style="margin: 0; color: #333; line-height: 1.5;">${order.delivery_address}</p>
          </div>
        </div>

        <!-- Your Order -->
        <div style="background-color: white; padding: 20px; margin-top: 2px;">
          <h3 style="color: #E53E3E; font-size: 18px; margin: 0 0 15px 0;">Your Order</h3>
          
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #E53E3E; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Item</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Price</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item: any) => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${item.perfume.name}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #ddd; color: #333;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #ddd; color: #333;">AED ${item.price.toFixed(2)}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #ddd; color: #333;">AED ${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold; color: #333;">Subtotal:</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; color: #333;">AED ${(order.total - 1).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right; border: 1px solid #ddd; color: #333;">Shipping:</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ddd; color: #333;">AED 1.00</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold; color: #333;">Total (includes shipping):</td>
                <td style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; color: #E53E3E;">AED ${order.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- What's Next -->
        <div style="background-color: #FFF8DC; padding: 20px; margin-top: 2px;">
          <h3 style="color: #333; font-size: 18px; margin: 0 0 15px 0;">What's Next?</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.8;">
            <li>Your order will be delivered within 2-5 business days</li>
            <li>You'll receive a confirmation call before delivery</li>
            <li>Have your confirmation email ready</li>
            <li>Ensure someone is available at the delivery address</li>
          </ul>
          
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
            <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">For further inquiries, contact:</p>
            <p style="margin: 5px 0; color: #E53E3E;">📞 Phone: +971 50 963 5636</p>
            <p style="margin: 5px 0; color: #E53E3E;">📧 Email: team@senteurfragrances.com</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #412300; color: white; text-align: center; padding: 20px;">
          <p style="margin: 0; font-size: 14px;">Senteur Fragrances - Premium Perfumes for Every Occasion</p>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
        <!-- Header Banner -->
        <div style="background-color: #412300; color: white; text-align: center; padding: 30px 20px;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">SENTEUR</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; letter-spacing: 1px;">FRAGRANCES</p>
        </div>
        
        <!-- Delivery Confirmation -->
        <div style="background-color: white; padding: 30px 20px; text-align: center;">
          <h2 style="color: #E53E3E; font-size: 24px; margin: 0 0 15px 0;">🎉 Your Order Has Been Delivered!</h2>
          <p style="color: #666; font-size: 16px; margin: 0;">Great news! Your Senteur Fragrances order has been successfully delivered to your address.</p>
        </div>

        <!-- Order Details -->
        <div style="background-color: white; padding: 20px; margin-top: 2px;">
          <h3 style="color: #E53E3E; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #E53E3E; padding-bottom: 5px;">📦 Order Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">Order ID:</td>
              <td style="padding: 8px 0; color: #666;">#${order.id.substring(0, 8)}</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">Delivery Address:</td>
              <td style="padding: 8px 0; color: #666;">${order.delivery_address}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">Order Total:</td>
              <td style="padding: 8px 0; color: #E53E3E; font-weight: bold;">AED ${order.total.toFixed(2)}</td>
              <td colspan="2"></td>
            </tr>
          </table>
          
          <h4 style="color: #333; margin: 20px 0 10px 0;">Items Delivered:</h4>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #E53E3E; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Item</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Price</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item: any) => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd; color: #333;">${item.perfume.name}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #ddd; color: #333;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #ddd; color: #333;">AED ${item.price.toFixed(2)}</td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #ddd; color: #333;">AED ${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Thank You -->
        <div style="background-color: #f0f8ff; border-left: 4px solid #412300; padding: 20px; margin-top: 2px;">
          <h3 style="color: #333; margin-top: 0;">💝 Thank You for Choosing Senteur Fragrances</h3>
          <p style="color: #666; line-height: 1.6;">
            We hope you love your new fragrances! Your order has been carefully prepared and delivered with love.
          </p>
        </div>

        <!-- Contact Section -->
        <div style="background-color: #FFF8DC; padding: 20px; margin-top: 2px;">
          <h3 style="color: #333; font-size: 18px; margin: 0 0 15px 0;">⭐ How Was Your Experience?</h3>
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            We'd love to hear about your experience! Your feedback helps us serve you better.
          </p>
          
          <div style="padding-top: 15px; border-top: 1px solid #ddd;">
            <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">For further inquiries, contact:</p>
            <p style="margin: 5px 0; color: #E53E3E;">📞 Phone: +971 50 963 5636</p>
            <p style="margin: 5px 0; color: #E53E3E;">📧 Email: team@senteurfragrances.com</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #412300; color: white; text-align: center; padding: 20px;">
          <p style="margin: 0; font-size: 14px;">Senteur Fragrances - Premium Perfumes Delivered</p>
        </div>
      </div>
    `
  };
}
