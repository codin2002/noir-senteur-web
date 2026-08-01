import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: cors });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
  try {
    const { paymentIntentId, checkoutToken } = await request.json();
    if (typeof paymentIntentId !== "string" || paymentIntentId.length < 8) throw new Error("A valid payment ID is required");
    if (typeof checkoutToken !== "string" || !/^[0-9a-f-]{36}$/i.test(checkoutToken)) throw new Error("A valid checkout token is required");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: checkout, error } = await admin.from("pending_ziina_checkouts")
      .select("status,order_id,mode,amount").eq("payment_intent_id", paymentIntentId).eq("lookup_token", checkoutToken).maybeSingle();
    if (error) throw error;
    if (!checkout) return Response.json({ success: false, status: "unknown" }, { status: 404, headers: cors });

    // The isolated test branch intentionally does not receive the merchant's
    // live webhook. For test payments only, securely poll Ziina after the
    // customer returns so we can validate the hosted checkout end to end.
    if (checkout.mode === "test" && checkout.status !== "completed") {
      const apiKey = Deno.env.get("ZIINA_API_KEY");
      if (apiKey) {
        const providerResponse = await fetch(`https://api-v2.ziina.com/api/payment_intent/${encodeURIComponent(paymentIntentId)}`, {
          headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
        });
        if (providerResponse.ok) {
          const providerPayment = await providerResponse.json();
          const confirmed = providerPayment?.id === paymentIntentId
            && providerPayment?.status === "completed"
            && providerPayment?.currency_code === "AED"
            && Number(providerPayment?.amount) === Math.round(Number(checkout.amount) * 100);
          if (confirmed) {
            await admin.from("pending_ziina_checkouts").update({
              status: "completed",
              processed_at: new Date().toISOString(),
              provider_payload: providerPayment,
            }).eq("payment_intent_id", paymentIntentId).eq("lookup_token", checkoutToken);
            checkout.status = "completed";
          }
        }
      }
    }
    if (checkout.mode === "test" && checkout.status === "completed") {
      return Response.json({ success: true, status: "completed", confirmed: true, test: true, total: checkout.amount }, { headers: cors });
    }
    if (checkout.status !== "completed" || !checkout.order_id) {
      return Response.json({ success: true, status: checkout.status, confirmed: false }, { headers: cors });
    }
    const { data: order, error: orderError } = await admin.from("orders").select(`
      id,total,delivery_address,
      items:order_items!order_items_order_id_fkey(
        id,perfume_id,quantity,price,
        perfume:perfumes!fk_order_items_perfume_id(*)
      )
    `).eq("id", checkout.order_id).single();
    if (orderError || !order) throw new Error("Confirmed order was not found");
    return Response.json({
      success: true,
      status: "completed",
      confirmed: true,
      orderId: order.id,
      paymentMethod: "Ziina",
      deliveryMethod: "Home Delivery",
      deliveryAddress: order.delivery_address,
      total: order.total,
      items: order.items,
    }, { headers: cors });
  } catch (error) {
    console.error("Checkout status lookup failed", error);
    return Response.json({ success: false, message: error instanceof Error ? error.message : "Status lookup failed" }, { status: 400, headers: cors });
  }
});
