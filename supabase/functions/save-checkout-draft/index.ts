import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const offers = {
  "signature-duo-313-424": {
    name: "The Senteur Signature Duo",
    saving: 30,
    productIds: [
      "890882bb-0dba-4712-a5a9-380cf9e7ff58",
      "37b4d1ef-6589-4852-a74d-c4a10bc04302",
    ],
  },
} as const;

const isUuid = (value: unknown) => typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: cors });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { cartItems, deliveryAddress, offerId, draftToken, meta } = await request.json();
    if (!Array.isArray(cartItems) || cartItems.length === 0 || typeof deliveryAddress !== "string" || !deliveryAddress.trim() || deliveryAddress.length > 2_000) {
      throw new Error("A valid cart and delivery address are required.");
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
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

    const regularAmount = ids.reduce((sum, id) => sum + prices.get(id)! * quantities.get(id)!, 0);
    const bundleQuantity = offer ? Math.min(...offer.productIds.map((id) => quantities.get(id) ?? 0)) : 0;
    if (offer && bundleQuantity < 1) throw new Error("The bundle must contain one 313 and one 424.");
    const amount = regularAmount - (offer ? offer.saving * bundleQuantity : 0);
    const cart = ids.map((perfume_id) => ({ perfume_id, quantity: quantities.get(perfume_id)! }));
    const isTest = Deno.env.get("CHECKOUT_MODE") !== "live";

    // Opportunistically purge expired drafts. The admin queue never exposes an expired draft.
    await admin.from("checkout_drafts").delete().lt("expires_at", new Date().toISOString());

    const values = {
      user_id: user?.id ?? null,
      is_guest: !user,
      cart_items: cart,
      delivery_address: deliveryAddress.trim(),
      amount,
      currency: "AED",
      offer_id: offerId || null,
      mode: isTest ? "test" : "live",
      status: "draft",
      meta_context: { offer_name: offer?.name || null, traffic_source: meta?.trafficSource === "meta_ads" ? "meta_ads" : "unknown" },
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 72 * 60 * 60 * 1_000).toISOString(),
    };

    const existingToken = isUuid(draftToken) ? draftToken : null;
    let saved;
    if (existingToken) {
      const { data, error } = await admin.from("checkout_drafts").update(values).eq("draft_token", existingToken).eq("status", "draft").select("draft_token").maybeSingle();
      if (error) throw error;
      saved = data;
    }
    if (!saved) {
      const { data, error } = await admin.from("checkout_drafts").insert({ ...values, ...(existingToken ? { draft_token: existingToken } : {}) }).select("draft_token").single();
      if (error) throw error;
      saved = data;
    }

    return Response.json({ success: true, draftToken: saved.draft_token }, { headers: cors });
  } catch (error) {
    console.error("Checkout draft save failed", error);
    return Response.json({ success: false, message: error instanceof Error ? error.message : "Could not save checkout draft" }, { status: 400, headers: cors });
  }
});
