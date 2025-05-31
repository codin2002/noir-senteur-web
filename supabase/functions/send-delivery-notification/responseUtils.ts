
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export interface DeliveryNotificationRequest {
  orderId: string;
}

export const createSuccessResponse = (data: any) => {
  const successResponse = {
    success: true,
    message: 'Delivery notification sent successfully',
    ...data,
    timestamp: new Date().toISOString()
  };

  console.log('🎉 === SUCCESS RESPONSE ===');
  console.log(JSON.stringify(successResponse, null, 2));

  return new Response(JSON.stringify(successResponse), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
};

export const createAlreadySentResponse = (orderId: string) => {
  return new Response(JSON.stringify({
    success: true,
    message: 'Delivery notification was already sent for this order',
    orderId: orderId,
    alreadySent: true
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
};

export const createErrorResponse = (error: any) => {
  console.error("💥 === DELIVERY NOTIFICATION ERROR ===");
  console.error("Error type:", typeof error);
  console.error("Error name:", error.name);
  console.error("Error message:", error.message);
  console.error("Error stack:", error.stack);
  console.error("Full error object:", JSON.stringify(error, null, 2));
  
  const errorResponse = {
    success: false,
    error: {
      message: error.message || "Failed to send delivery notification",
      type: error.name || "UnknownError",
      timestamp: new Date().toISOString(),
      stack: error.stack
    }
  };

  console.error("💥 Error response:", JSON.stringify(errorResponse, null, 2));
  
  return new Response(JSON.stringify(errorResponse), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 500,
  });
};
