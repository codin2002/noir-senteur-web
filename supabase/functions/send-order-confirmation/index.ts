import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { fetchOrderById, createItemsList } from "./orderService.ts";
import { getUserInfo } from "./userService.ts";
import { sendEmail } from "./emailService.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let orderId = "";
  let orderStatus = "";
  let supabaseClient: ReturnType<typeof createClient> | null = null;
  let claimed = false;
  try {
    ({ orderId, orderStatus = "" } = await request.json());
    if (!orderId) throw new Error("Order ID is required");
    if (orderStatus !== "processing" && orderStatus !== "delivered") {
      return Response.json({ success: true, orderId, emailSent: false }, { headers: corsHeaders });
    }

    supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const order = await fetchOrderById(orderId, supabaseClient);
    const { data: didClaim, error: claimError } = await supabaseClient.rpc("claim_order_email", {
      p_order_id: orderId,
      p_email_type: orderStatus,
    });
    if (claimError) throw new Error("Failed to claim email notification");
    claimed = Boolean(didClaim);
    if (!claimed) {
      return Response.json({ success: true, orderId, alreadySent: true }, { headers: corsHeaders });
    }

    const userInfo = await getUserInfo(order, supabaseClient);
    const emailType = orderStatus === "delivered" ? "delivery" : "confirmation";
    const emailResult = await sendEmail(userInfo.email, userInfo.name, order, createItemsList(order), emailType);
    const update = orderStatus === "delivered"
      ? { delivery_email_sent: true, delivery_email_claimed_at: null }
      : { processing_email_sent: true, processing_email_claimed_at: null };
    const { error: updateError } = await supabaseClient.from("orders").update(update).eq("id", orderId);
    if (updateError) console.error("Email sent but delivery flag could not be updated", updateError);

    return Response.json({
      success: true,
      emailId: emailResult.data?.id,
      orderId,
      recipientEmail: userInfo.email,
      emailType,
    }, { headers: corsHeaders });
  } catch (error) {
    if (claimed && supabaseClient && orderId) {
      const release = orderStatus === "delivered"
        ? { delivery_email_claimed_at: null }
        : { processing_email_claimed_at: null };
      await supabaseClient.from("orders").update(release).eq("id", orderId);
    }
    console.error("Email sending failed", error);
    return Response.json({ success: false, message: error instanceof Error ? error.message : "Failed to send email" }, { status: 500, headers: corsHeaders });
  }
});
