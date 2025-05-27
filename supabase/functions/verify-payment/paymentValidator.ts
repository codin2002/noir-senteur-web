
export interface PaymentValidationResult {
  success: boolean;
  paymentData?: any;
  message?: string;
}

export async function validateZiinaPayment(paymentIntentId: string): Promise<PaymentValidationResult> {
  console.log('=== STEP 1: CHECKING PAYMENT STATUS WITH ZIINA ===');

  // Get Ziina API key
  const ziinaApiKey = Deno.env.get("ZIINA_API_KEY");
  if (!ziinaApiKey) {
    throw new Error("Ziina API key not configured");
  }

  // Check payment status with Ziina
  const ziinaResponse = await fetch(`https://api-v2.ziina.com/api/payment_intent/${paymentIntentId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${ziinaApiKey}`,
      "Accept": "application/json",
    },
  });

  console.log('Ziina API response status:', ziinaResponse.status);

  if (!ziinaResponse.ok) {
    const errorText = await ziinaResponse.text();
    console.error('Ziina API error:', errorText);
    throw new Error(`Failed to verify payment with Ziina: ${ziinaResponse.status}`);
  }

  const paymentData = await ziinaResponse.json();
  console.log('Payment status from Ziina:', paymentData.status);
  console.log('Payment amount:', paymentData.amount);

  if (paymentData.status !== 'completed') {
    console.error('Payment not completed. Status:', paymentData.status);
    return {
      success: false,
      message: `Payment not completed. Status: ${paymentData.status}`
    };
  }

  console.log('=== STEP 2: PAYMENT CONFIRMED AS COMPLETED ===');
  return {
    success: true,
    paymentData
  };
}
