
import { Resend } from "npm:resend@2.0.0";
import { createConfirmationEmailTemplate, createDeliveryEmailTemplate } from "./emailTemplates.ts";

export async function sendEmail(
  userEmail: string,
  userName: string,
  order: any,
  itemsList: string,
  emailType: 'confirmation' | 'delivery'
) {
  console.log('Sending email to:', userEmail);

  const resend = new Resend(Deno.env.get("RESEND_API_KEY_REAL"));

  let emailTemplate;
  if (emailType === 'delivery') {
    emailTemplate = createDeliveryEmailTemplate(userName, order, itemsList);
  } else {
    emailTemplate = createConfirmationEmailTemplate(userName, order, itemsList);
  }

  const emailResult = await resend.emails.send({
    from: "Senteur Fragrances <orders@senteurfragrances.com>",
    to: [userEmail],
    subject: emailTemplate.subject,
    html: emailTemplate.html,
  });

  console.log('Email sent successfully:', emailResult);
  return emailResult;
}
