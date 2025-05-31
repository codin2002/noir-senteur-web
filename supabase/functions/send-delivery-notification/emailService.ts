
import { Resend } from "npm:resend@2.0.0";
import { createDeliveryEmailHtml } from "./emailTemplate.ts";

export class EmailService {
  private resend: Resend;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Email service not configured - missing API key');
    }
    this.resend = new Resend(apiKey);
    console.log('✅ Resend client initialized');
  }

  async sendDeliveryNotification(
    recipientEmail: string,
    recipientName: string,
    order: any
  ): Promise<{ id?: string }> {
    console.log('📧 Preparing to send delivery notification to:', recipientEmail);

    // Create items list for email
    const items = order.items || [];
    console.log('📦 Order items:', items.length);
    
    const itemsList = items.map((item: any) => 
      `• ${item.perfume?.name || 'Unknown Item'} (Qty: ${item.quantity}) - AED ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    console.log('📋 Email items list prepared:', itemsList);

    const emailHtml = createDeliveryEmailHtml(recipientName, order, itemsList);

    console.log('📧 Email HTML template prepared');
    console.log('✉️ Sending delivery notification email via Resend...');

    const emailResult = await this.resend.emails.send({
      from: "Senteur Fragrances <orders@senteurfragrances.com>",
      to: [recipientEmail],
      subject: "Your Order Has Been Delivered! - Senteur Fragrances",
      html: emailHtml,
    });

    console.log('📧 Resend API call completed');
    console.log('📧 Resend API response:', JSON.stringify(emailResult, null, 2));

    if (emailResult.error) {
      console.error('❌ Resend API error:', emailResult.error);
      throw new Error(`Email sending failed: ${JSON.stringify(emailResult.error)}`);
    }

    console.log('✅ Delivery notification email sent successfully!');
    console.log('📧 Email ID:', emailResult.data?.id);

    return emailResult.data || {};
  }
}
