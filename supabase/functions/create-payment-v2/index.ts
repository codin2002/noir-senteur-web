import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });

const offers = {
  "signature-duo-313-424": {
    name: "The Senteur Signature Duo",
    amount: 220,
    saving: 30,
    productIds: [
      "890882bb-0dba-4712-a5a9-380cf9e7ff58",
      "37b4d1ef-6589-4852-a74d-c4a10bc04302",
    ],
  },
} as const;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: cors });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  let pendingId: string | null = null;
  try {
    const { cartItems, deliveryAddress, meta, offerId } = await request.json();
    // The server controls whether this is a test or real payment. Never let a
    // browser request decide the payment mode.
    const isTest = Deno.env.get("CHECKOUT_MODE") !== "live";
    if (!deliveryAddress?.trim() || !Array.isArray(cartItems) || cartItems.length === 0) throw new Error("A delivery address and cart items are required.");

    const authHeader = request.headers.get("Authorization");
    const { data: authData } = authHeader ? await admin.auth.getUser(authHeader.replace(/^Bearer\s+/i, "")) : { data: { user: null } };
    const user = authData.user;
    const quantities = new Map<string, number>();
    for (const item of cartItems) {
      const id = item?.perfume?.id ?? item?.perfume_id;
      const quantity = Number(item?.quantity);
      if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error("The cart contains an invalid item quantity.");
      quantities.set(id, (quantities.get(id) ?? 0) + quantity);
    }

    const ids = [...quantities.keys()];
    const { data: products, error: productsError } = await admin.from("perfumes").select("id,price_value").in("id", ids);
    if (productsError || !products || products.length !== ids.length) throw new Error("Unable to price the cart.");
    const prices = new Map(products.map((product) => [product.id, Number(product.price_value)]));
    const offer = typeof offerId === "string" ? offers[offerId as keyof typeof offers] : undefined;
    if (offerId && !offer) throw new Error("This offer is not available.");

    let items: Array<{ perfume_id: string; quantity: number; price: number }>;
    let amount: number;
    if (offer) {
      const bundleQuantity = Math.min(...offer.productIds.map((productId) => quantities.get(productId) ?? 0));
      if (bundleQuantity < 1) throw new Error("The bundle must contain one 313 and one 424.");

      const regularAmount = ids.reduce((sum, perfumeId) => sum + prices.get(perfumeId)! * quantities.get(perfumeId)!, 0);
      amount = regularAmount - (offer.saving * bundleQuantity);
      items = ids.map((perfume_id) => {
        const quantity = quantities.get(perfume_id)!;
        const discountedUnits = offer.productIds.includes(perfume_id as typeof offer.productIds[number]) ? bundleQuantity : 0;
        const lineTotal = prices.get(perfume_id)! * quantity - (offer.saving / 2) * discountedUnits;
        return { perfume_id, quantity, price: lineTotal / quantity };
      });
    } else {
      items = ids.map((perfume_id) => ({ perfume_id, quantity: quantities.get(perfume_id)!, price: prices.get(perfume_id)! }));
      amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    if (items.some((item) => !Number.isFinite(item.price) || item.price <= 0)) throw new Error("The cart contains an invalid product price.");

    const operationId = crypto.randomUUID();
    const { data: pending, error: pendingError } = await admin.from("pending_ziina_checkouts").insert({
      operation_id: operationId,
      user_id: user?.id ?? null,
      is_guest: !user,
      cart_items: items,
      delivery_address: deliveryAddress.trim(),
      amount,
      currency: "AED",
      mode: isTest ? "test" : "live",
      meta_context: {
        offer_id: offerId || null,
        offer_name: offer?.name || null,
        fbp: typeof meta?.fbp === "string" ? meta.fbp.slice(0, 255) : null,
        fbc: typeof meta?.fbc === "string" ? meta.fbc.slice(0, 255) : null,
        client_user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
        client_ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      },
    }).select("id,lookup_token").single();
    if (pendingError) throw new Error("Could not prepare the checkout safely.");
    pendingId = pending.id;

    const key = Deno.env.get("ZIINA_API_KEY");
    if (!key) throw new Error("Payment service is not configured.");
    const siteUrl = (Deno.env.get("CHECKOUT_SITE_URL") || "http://localhost:8080").replace(/\/$/, "");
    const paymentIntentUrl = Deno.env.get("ZIINA_PAYMENT_INTENT_URL") || "https://api-v2.ziina.com/api/payment_intent";
    const response = await fetch(paymentIntentUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        id: operationId,
        amount: Math.round(amount * 100),
        currency_code: "AED",
        message: isTest ? (offer ? `${offer.name} test` : "Senteur checkout test") : (offer?.name || "Senteur checkout"),
        success_url: `${siteUrl}/payment-success?payment_intent_id={PAYMENT_INTENT_ID}&checkout_token=${pending.lookup_token}`,
        cancel_url: `${siteUrl}/cart?payment=cancelled`,
        failure_url: `${siteUrl}/payment-failed`,
        expiry: String(Date.now() + 1_800_000),
        test: isTest,
        transaction_source: "directApi",
        allow_tips: false,
      }),
    });
    if (!response.ok) throw new Error(`Ziina could not create the payment (${response.status}).`);
    const payment = await response.json();
    if (!payment?.id || !payment?.redirect_url) throw new Error("Ziina returned an incomplete payment response.");

    const { error: saveError } = await admin.from("pending_ziina_checkouts").update({ payment_intent_id: payment.id, provider_payload: payment }).eq("id", pendingId);
    if (saveError) throw new Error("Could not save the payment session safely.");
    return json({ success: true, payment_url: payment.redirect_url, payment_intent_id: payment.id, mode: isTest ? "test" : "live" });
  } catch (error) {
    console.error("Staged payment creation failed", error);
    if (pendingId) await admin.from("pending_ziina_checkouts").update({ status: "failed" }).eq("id", pendingId);
    return json({ success: false, message: error instanceof Error ? error.message : "Checkout failed" }, 400);
  }
});
