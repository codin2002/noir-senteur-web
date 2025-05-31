
export const createDeliveryEmailHtml = (
  recipientName: string,
  order: any,
  itemsList: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #D4AF37; margin: 0;">Your Order Has Been Delivered!</h1>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Hello ${recipientName},</h2>
        <p style="color: #666; line-height: 1.6;">
          Your Senteur Fragrances order has been delivered. We hope you enjoy your new fragrance.
        </p>
      </div>

      <div style="background-color: #fff; border: 1px solid #eee; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #D4AF37; margin-top: 0;">Order Details</h3>
        <p><strong>Order ID:</strong> #${order.id.substring(0, 8)}</p>
        <p><strong>Order Total:</strong> AED ${Number(order.total).toFixed(2)}</p>
        
        <h4 style="color: #333; margin-bottom: 10px;">Items Delivered:</h4>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <pre style="margin: 0; white-space: pre-wrap; font-family: Arial, sans-serif;">${itemsList}</pre>
        </div>
      </div>

      <div style="background-color: #f0f8ff; border-left: 4px solid #D4AF37; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Thank You for Choosing Senteur Fragrances</h3>
        <p style="color: #666; line-height: 1.6;">
          Thank you for choosing Senteur Fragrances to be part of your fragrance journey. We value your feedback and would love to hear about your experience.
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 14px; margin: 5px 0;">
          Senteur Fragrances - Premium Perfumes Delivered
        </p>
        <p style="color: #999; font-size: 14px; margin: 5px 0;">
          For support, contact us at senteur.ae@gmail.com
        </p>
      </div>
    </div>
  `;
};
