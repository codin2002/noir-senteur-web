import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type MetaItem = {
  id: string;
  quantity: number;
  price: number;
};

type MetaPurchase = {
  orderId: string;
  value: number;
  items: MetaItem[];
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  externalId?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  eventSourceUrl?: string | null;
};

const PIXEL_ID = Deno.env.get("META_PIXEL_ID") || "1523641402566185";
const GRAPH_VERSION = Deno.env.get("META_GRAPH_API_VERSION") || "v23.0";

const sha256 = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const normalizedHash = async (value: string | null | undefined, normalize: (value: string) => string) => {
  if (!value) return undefined;
  const normalized = normalize(value);
  return normalized ? [await sha256(normalized)] : undefined;
};

const compact = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null && entry !== ""));

/**
 * Sends a confirmed Purchase to Meta. This deliberately never throws: an
 * analytics outage must not roll back or retry an otherwise valid order.
 */
export async function sendMetaPurchase(purchase: MetaPurchase): Promise<boolean> {
  const accessToken = Deno.env.get("META_ACCESS_TOKEN");
  if (!accessToken) {
    console.warn("Meta CAPI skipped: META_ACCESS_TOKEN is not configured");
    return false;
  }

  try {
    const normalizeText = (value: string) => value.trim().toLowerCase();
    const normalizePhone = (value: string) => value.replace(/[^0-9]/g, "");
    const userData = compact({
      em: await normalizedHash(purchase.email, normalizeText),
      ph: await normalizedHash(purchase.phone, normalizePhone),
      fn: await normalizedHash(purchase.firstName, normalizeText),
      ln: await normalizedHash(purchase.lastName, normalizeText),
      external_id: await normalizedHash(purchase.externalId, normalizeText),
      fbp: purchase.fbp,
      fbc: purchase.fbc,
      client_ip_address: purchase.clientIpAddress,
      client_user_agent: purchase.clientUserAgent,
    });

    const event = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: `purchase.${purchase.orderId}`,
      action_source: "website",
      event_source_url: purchase.eventSourceUrl || "https://senteurfragrances.com/payment-success",
      user_data: userData,
      custom_data: {
        currency: "AED",
        value: Math.round(Number(purchase.value) * 100) / 100,
        order_id: purchase.orderId,
        content_type: "product",
        content_ids: purchase.items.map((item) => item.id),
        contents: purchase.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          item_price: Math.round(Number(item.price) * 100) / 100,
        })),
        num_items: purchase.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    };

    const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event], access_token: accessToken }),
      signal: AbortSignal.timeout(5_000),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.events_received !== 1) {
      console.error("Meta CAPI Purchase was rejected", {
        status: response.status,
        error: result?.error?.message || "Unexpected response",
        orderId: purchase.orderId,
      });
      return false;
    }

    console.log("Meta CAPI Purchase accepted", { orderId: purchase.orderId });
    return true;
  } catch (error) {
    console.error("Meta CAPI Purchase failed", { orderId: purchase.orderId, error });
    return false;
  }
}

/**
 * Claims an order before sending its Purchase event, then persists the result.
 * A failed send releases the claim so a later webhook retry can try again.
 */
export async function sendMetaPurchaseOnce(
  store: SupabaseClient,
  purchase: MetaPurchase,
): Promise<boolean> {
  const { data: claimed, error: claimError } = await store.rpc("claim_meta_purchase", {
    p_order_id: purchase.orderId,
  });

  if (claimError) {
    console.error("Meta CAPI Purchase could not be claimed", {
      orderId: purchase.orderId,
      error: claimError.message || "Unknown database error",
    });
    return false;
  }

  if (claimed !== true) {
    console.log("Meta CAPI Purchase skipped because it was already sent or is being processed", {
      orderId: purchase.orderId,
    });
    return true;
  }

  const sent = await sendMetaPurchase(purchase);
  const status = sent
    ? { meta_purchase_sent: true, meta_purchase_claimed_at: new Date().toISOString() }
    : { meta_purchase_claimed_at: null };
  const { error: statusError } = await store
    .from("orders")
    .update(status)
    .eq("id", purchase.orderId);

  if (statusError) {
    console.error("Meta CAPI Purchase status was not saved", {
      orderId: purchase.orderId,
      sent,
      error: statusError.message || "Unknown database error",
    });
    return false;
  }

  return sent;
}
