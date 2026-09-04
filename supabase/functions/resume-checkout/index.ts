import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const allowedOrigins = new Set([
  "https://senteurfragrances.com",
  "https://www.senteurfragrances.com",
  "https://senteur-fragrances-live.pages.dev",
  "http://127.0.0.1:8080",
  "http://localhost:8080",
]);

const corsHeaders = (request: Request) => {
  const origin = request.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://senteurfragrances.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
};

const json = (request: Request, body: unknown, status = 200) =>
  Response.json(body, { status, headers: corsHeaders(request) });

const isUuid = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);

const valueFromAddress = (deliveryAddress: string, label: string) => {
  const match = deliveryAddress.match(new RegExp(`(?:^|\\|\\s*)${label}:\\s*([^|]*)`, "i"));
  return match?.[1]?.trim() || "";
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(request) });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders(request) });

  try {
    const { source, token } = await request.json();
    if ((source !== "draft" && source !== "checkout") || !isUuid(token)) {
      return json(request, { success: false, message: "This secure checkout link is unavailable." }, 404);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    let cartItems: Array<{ perfume_id: string; quantity: number }> = [];
    let deliveryAddress = "";
    let offerId: string | null = null;
    let reminderConsent = false;

    if (source === "draft") {
      const { data } = await admin
        .from("checkout_drafts")
        .select("cart_items, delivery_address, offer_id")
        .eq("draft_token", token)
        .eq("mode", "live")
        .eq("status", "draft")
        .maybeSingle();
      if (!data) return json(request, { success: false, message: "This secure checkout link is unavailable." }, 404);
      cartItems = data.cart_items;
      deliveryAddress = data.delivery_address;
      offerId = data.offer_id;
    } else {
      const { data } = await admin
        .from("pending_ziina_checkouts")
        .select("cart_items, delivery_address, meta_context")
        .eq("lookup_token", token)
        .eq("mode", "live")
        .in("status", ["pending", "failed"])
        .is("order_id", null)
        .maybeSingle();
      if (!data) return json(request, { success: false, message: "This secure checkout link is unavailable." }, 404);
      cartItems = data.cart_items;
      deliveryAddress = data.delivery_address;
      offerId = typeof data.meta_context?.offer_id === "string" ? data.meta_context.offer_id : null;
      reminderConsent = data.meta_context?.reminder_consent === true;
    }

    if (!Array.isArray(cartItems) || !deliveryAddress) {
      return json(request, { success: false, message: "This secure checkout link is unavailable." }, 404);
    }

    const quantities = new Map<string, number>();
    for (const item of cartItems) {
      const perfumeId = item?.perfume_id;
      const quantity = Number(item?.quantity);
      if (typeof perfumeId !== "string" || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return json(request, { success: false, message: "This secure checkout link is unavailable." }, 404);
      }
      quantities.set(perfumeId, (quantities.get(perfumeId) || 0) + quantity);
    }

    const ids = [...quantities.keys()];
    const { data: perfumes } = await admin
      .from("perfumes")
      .select("id, name, price, price_value, image, notes")
      .in("id", ids);
    if (!perfumes || perfumes.length !== ids.length) {
      return json(request, { success: false, message: "This secure checkout link is unavailable." }, 404);
    }

    const perfumeById = new Map(perfumes.map((perfume) => [perfume.id, perfume]));
    return json(request, {
      success: true,
      cartItems: ids.map((perfumeId) => ({
        id: perfumeId,
        quantity: quantities.get(perfumeId)!,
        perfume: perfumeById.get(perfumeId),
      })),
      offerId,
      details: {
        name: valueFromAddress(deliveryAddress, "Contact"),
        phoneNumber: valueFromAddress(deliveryAddress, "Phone"),
        emirate: valueFromAddress(deliveryAddress, "Emirate"),
        deliveryAddress: valueFromAddress(deliveryAddress, "Address"),
        email: valueFromAddress(deliveryAddress, "Email"),
        reminderConsent,
      },
    });
  } catch (error) {
    console.error("Resume checkout lookup failed", error);
    return json(request, { success: false, message: "This secure checkout link is unavailable." }, 404);
  }
});
