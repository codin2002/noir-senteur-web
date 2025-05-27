
export async function sendOrderConfirmation(orderId: string, supabaseService: any): Promise<void> {
  console.log('=== STEP 6: TRIGGERING EMAIL CONFIRMATION ===');
  try {
    console.log('Calling send-order-confirmation function with order ID:', orderId);
    const emailResult = await supabaseService.functions.invoke('send-order-confirmation', {
      body: { orderId: orderId }
    });
    
    console.log('Email function response:', emailResult);
    
    if (emailResult.error) {
      console.error('Email sending failed, but continuing with success response:', emailResult.error);
      // Don't throw error - just log it and continue
    } else {
      console.log('Email confirmation triggered successfully:', emailResult.data);
    }
  } catch (emailError) {
    console.error('Error triggering email, but continuing with success response:', emailError);
    // Don't throw error - just log it and continue
  }
}
