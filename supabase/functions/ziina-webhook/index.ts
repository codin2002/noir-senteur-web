import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendMetaPurchase } from "../_shared/metaConversions.ts";

const textEncoder = new TextEncoder();

const hexToBytes = (hex: string): Uint8Array | null => {
  if (!/^[a-fA-F0-9]{64}$/.test(hex)) return null;
  const bytes = new Uint8Array(32);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
};

const verifySignature = async (body: string, signature: string, secret: string) => {
  const signatureBytes = hexToBytes(signature);
  if (!signatureBytes) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  return crypto.subtle.verify("HMAC", key, signatureBytes, textEncoder.encode(body));
};

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = Deno.env.get("ZIINA_WEBHOOK_SECRET");
  if (!secret) {
    console.error("ZIINA_WEBHOOK_SECRET is not configured");
    return new Response("Webhook is not configured", { status: 503 });
  }

  const signature = request.headers.get("X-Hmac-Signature");
  if (!signature) {
    return new Response("Missing webhook signature", { status: 401 });
  }

  const rawBody = await request.text();
  if (!(await verifySignature(rawBody, signature, secret))) {
    console.warn("Rejected Ziina webhook with an invalid signature");
    return new Response("Invalid webhook signature", { status: 401 });
  }

  let payload: { event?: string; data?: { id?: string; status?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  const paymentIntentId = payload.data?.id;
  console.log("Verified Ziina webhook", {
    event: payload.event,
    paymentIntentId: payload.data?.id,
    status: payload.data?.status,
  });

  try {
    // The legacy checkout does not create a pending row, so this can only ever
    // process the new staged flow. It cannot alter current orders or payments.
    if (payload.event === "payment_intent.status.updated" && payload.data?.status === "completed" && paymentIntentId) {
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
      const { data: checkout, error } = await admin.from("pending_ziina_checkouts").select("*").eq("payment_intent_id", paymentIntentId).maybeSingle();
      if (error) throw error;
      if (!checkout) return Response.json({ received: true, ignored: true });

      let providerPayment: Record<string, unknown> = payload.data as Record<string, unknown>;
      if (Deno.env.get("ZIINA_SKIP_PROVIDER_VERIFICATION") !== "true") {
        const apiKey = Deno.env.get("ZIINA_API_KEY");
        if (!apiKey) throw new Error("ZIINA_API_KEY is not configured");
        const providerResponse = await fetch(`https://api-v2.ziina.com/api/payment_intent/${encodeURIComponent(paymentIntentId)}`, {
          headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
        });
        if (!providerResponse.ok) throw new Error(`Ziina verification failed (${providerResponse.status})`);
        providerPayment = await providerResponse.json();
        if (providerPayment.id !== paymentIntentId || providerPayment.status !== "completed") throw new Error("Ziina payment is not completed");
        if (providerPayment.currency_code !== "AED") throw new Error("Ziina payment currency mismatch");
        if (Number(providerPayment.amount) !== Math.round(Number(checkout.amount) * 100)) throw new Error("Ziina payment amount mismatch");
      }

      // Ziina's test mode is useful for validating the real hosted payment
      // page and signed webhook. It must never create an order, reserve stock,
      // send emails, or report a purchase against the live business records.
      if (checkout.mode === "test") {
        await admin.from("pending_ziina_checkouts").update({
          provider_payload: providerPayment,
          status: "completed",
          processed_at: new Date().toISOString(),
        }).eq("id", checkout.id);
        return Response.json({ received: true, test: true });
      }

      await admin.from("pending_ziina_checkouts").update({ provider_payload: providerPayment }).eq("id", checkout.id);
      const parts = checkout.delivery_address.split("|").map((part: string) => part.trim());
      const value = (prefix: string, fallback = "") => parts.find((part: string) => part.startsWith(prefix))?.slice(prefix.length).trim() || fallback;
      let orderId = checkout.order_id as string | null;
      if (checkout.status !== "completed") {
        const { data: createdOrderId, error: orderError } = await admin.rpc("create_order_from_ziina_checkout", {
          p_payment_intent_id: paymentIntentId,
          p_cart_items: checkout.cart_items,
          p_amount: checkout.amount,
          p_user_id: checkout.user_id,
          p_is_guest: checkout.is_guest,
          p_customer_name: value("Contact:", "Guest Customer"),
          p_customer_email: value("Email:"),
          p_customer_phone: value("Phone:", "Not provided"),
          p_delivery_address: checkout.delivery_address,
        });
        if (orderError) throw orderError;
        orderId = createdOrderId as string;
      }

      // Make the payment record immediately usable as a packing list in the
      // Supabase dashboard. The order items remain the source of truth.
      if (orderId) {
        const { data: orderItems, error: itemsError } = await admin
          .from("order_items")
          .select("quantity,price,perfume_id,perfume:perfumes(name)")
          .eq("order_id", orderId);
        if (itemsError) throw itemsError;
        const productDetails = (orderItems ?? [])
          .map((item: { quantity: number; perfume: { name?: string } | null }) => `${item.perfume?.name || "Perfume"} (Qty: ${item.quantity})`)
          .join(" · ");
        if (productDetails) {
          const { error: paymentUpdateError } = await admin
            .from("successful_payments")
            .update({ product_details: productDetails })
            .eq("order_id", orderId);
          if (paymentUpdateError) throw paymentUpdateError;
        }

        const customerName = value("Contact:", "Guest Customer").trim();
        const [firstName, ...remainingNames] = customerName.split(/\s+/);
        const meta = (checkout.meta_context || {}) as Record<string, string | null>;
        await sendMetaPurchase({
          orderId,
          value: Number(checkout.amount),
          items: (orderItems ?? []).map((item: { quantity: number; price: number; perfume_id: string }) => ({
            id: item.perfume_id,
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
          email: value("Email:"),
          phone: value("Phone:"),
          firstName,
          lastName: remainingNames.join(" "),
          externalId: checkout.user_id,
          fbp: meta.fbp,
          fbc: meta.fbc,
          clientIpAddress: meta.client_ip_address,
          clientUserAgent: meta.client_user_agent,
        });
      }

      // Email is optional for guests. The email function atomically claims the
      // notification so concurrent provider retries cannot send it twice.
      if (orderId && (checkout.user_id || value("Email:"))) {
        const { error: emailError } = await admin.functions.invoke("send-order-confirmation", {
          body: { orderId, orderStatus: "processing" },
        });
        if (emailError) console.error("Order confirmation email was not sent", emailError);
      }
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error("Ziina webhook processing failed", error);
    return Response.json({ received: false }, { status: 500 });
  }
});
