import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

type RecoverySource = "draft" | "checkout";

interface RecoveryCandidate {
  source: RecoverySource;
  id: string;
  token: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  offerId: string | null;
  cartItems: Array<{ perfume_id: string; quantity: number }>;
  occurredAt: string;
}

const cors = {
  "Access-Control-Allow-Origin": "https://senteurfragrances.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Vary": "Origin",
};

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const valueFromAddress = (deliveryAddress: string, label: string) => {
  const match = deliveryAddress.match(new RegExp(`(?:^|\\|\\s*)${label}:\\s*([^|]*)`, "i"));
  return match?.[1]?.trim() || "";
};

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const productName = (candidate: RecoveryCandidate) => {
  if (candidate.offerId === "signature-duo-313-424") return "The Senteur Signature Duo";
  const ids = candidate.cartItems.flatMap((item) => Array(item.quantity).fill(item.perfume_id));
  if (ids.length === 1 && ids[0] === "890882bb-0dba-4712-a5a9-380cf9e7ff58") return "Senteur 313";
  if (ids.length === 1 && ids[0] === "37b4d1ef-6589-4852-a74d-c4a10bc04302") return "Senteur 424";
  return "Your Senteur selection";
};

const createEmail = (candidate: RecoveryCandidate, resumeUrl: string) => {
  const name = escapeHtml(candidate.customerName.split(/\s+/)[0] || "there");
  const product = escapeHtml(productName(candidate));
  const amount = Number(candidate.amount).toFixed(2);
  return {
    subject: `${productName(candidate)} is still waiting`,
    html: `<!doctype html>
      <html><body style="margin:0;background:#f7f4ee;font-family:Arial,sans-serif;color:#17130f">
        <div style="max-width:600px;margin:0 auto;padding:32px 18px">
          <div style="background:#11100f;color:#f0cf98;padding:28px 24px;text-align:center;letter-spacing:4px;font-family:Georgia,serif;font-size:28px">SENTEUR</div>
          <div style="background:#ffffff;padding:34px 28px">
            <p style="margin:0 0 20px;font-size:17px">Hi ${name},</p>
            <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:27px;font-weight:normal">Your selection is still waiting.</h1>
            <p style="margin:0 0 25px;color:#625b54;font-size:16px;line-height:1.55">It looks like your checkout was not completed. We have kept your details ready so you can return without filling them in again.</p>
            <div style="border:1px solid #e3d3b4;background:#fcfaf6;padding:18px 20px;margin:0 0 24px">
              <div style="font-size:17px;font-weight:600">${product}</div>
              <div style="margin-top:6px;color:#765c36">AED ${amount} &nbsp;·&nbsp; Free delivery across the UAE</div>
            </div>
            <div style="text-align:center;margin:30px 0">
              <a href="${resumeUrl}" style="display:inline-block;background:#d5b27d;color:#17130f;padding:15px 25px;text-decoration:none;font-weight:700;border-radius:4px">Return to secure checkout</a>
            </div>
            <p style="margin:0;color:#625b54;font-size:13px;line-height:1.5">If you no longer wish to continue, you can simply ignore this email. For help with checkout, reply to this message.</p>
          </div>
          <div style="padding:18px;text-align:center;color:#72695f;font-size:12px">Senteur Fragrances · Premium fragrance, delivered across the UAE</div>
        </div>
      </body></html>`,
  };
};

const isAdministrator = async (request: Request, admin: ReturnType<typeof createClient>) => {
  const cronSecret = request.headers.get("x-checkout-recovery-cron-secret");
  if (cronSecret) {
    const { data: cronAuthorised } = await admin.rpc("verify_checkout_recovery_cron_secret", { p_secret: cronSecret });
    if (cronAuthorised) return true;
  }

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const { data: authData } = await admin.auth.getUser(token);
  if (!authData.user) return false;
  const { data: hasAdminRole } = await admin.rpc("has_role", {
    _user_id: authData.user.id,
    _role: "admin",
  });
  return Boolean(hasAdminRole);
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: cors });
  if (request.method !== "POST") return json({ success: false, message: "Method not allowed" }, 405);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  if (!await isAdministrator(request, admin)) return json({ success: false, message: "Administrator access is required." }, 401);

  try {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: drafts, error: draftsError } = await admin
      .from("checkout_drafts")
      .select("id, draft_token, customer_name, customer_email, delivery_address, amount, offer_id, cart_items, updated_at")
      .eq("mode", "live")
      .eq("status", "draft")
      .lte("updated_at", threeHoursAgo);
    if (draftsError) throw draftsError;

    const { data: checkouts, error: checkoutError } = await admin
      .from("pending_ziina_checkouts")
      .select("id, lookup_token, delivery_address, amount, meta_context, cart_items, created_at")
      .eq("mode", "live")
      .is("order_id", null)
      .in("status", ["pending", "failed"])
      .eq("recovery_status", "new")
      .lte("created_at", threeHoursAgo)
      .gte("created_at", thirtyDaysAgo);
    if (checkoutError) throw checkoutError;

    const candidates: RecoveryCandidate[] = [
      ...(drafts || []).map((draft) => ({
        source: "draft" as const,
        id: draft.id,
        token: draft.draft_token,
        customerName: draft.customer_name || valueFromAddress(draft.delivery_address || "", "Contact"),
        customerEmail: (draft.customer_email || valueFromAddress(draft.delivery_address || "", "Email")).trim().toLowerCase(),
        amount: Number(draft.amount),
        offerId: draft.offer_id,
        cartItems: Array.isArray(draft.cart_items) ? draft.cart_items : [],
        occurredAt: draft.updated_at,
      })),
      ...(checkouts || []).map((checkout) => ({
        source: "checkout" as const,
        id: checkout.id,
        token: checkout.lookup_token,
        customerName: valueFromAddress(checkout.delivery_address || "", "Contact"),
        customerEmail: valueFromAddress(checkout.delivery_address || "", "Email").toLowerCase(),
        amount: Number(checkout.amount),
        offerId: typeof checkout.meta_context?.offer_id === "string" ? checkout.meta_context.offer_id : null,
        cartItems: Array.isArray(checkout.cart_items) ? checkout.cart_items : [],
        occurredAt: checkout.created_at,
      })),
    ]
      .filter((candidate) => emailPattern.test(candidate.customerEmail) && candidate.token)
      .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));

    const selected: RecoveryCandidate[] = [];
    const selectedEmails = new Set<string>();
    for (const candidate of candidates) {
      if (selectedEmails.has(candidate.customerEmail)) continue;
      selectedEmails.add(candidate.customerEmail);
      selected.push(candidate);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY_REAL");
    if (!resendKey) throw new Error("Recovery email service is not configured.");
    const resend = new Resend(resendKey);
    const siteUrl = (Deno.env.get("CHECKOUT_SITE_URL") || "https://senteurfragrances.com").replace(/\/$/, "");
    const results = { sent: 0, skipped: 0, failed: 0 };

    for (const candidate of selected.slice(0, 25)) {
      const { data: priorRecord } = await admin
        .from("checkout_recovery_email_log")
        .select("status")
        .eq("source", candidate.source)
        .eq("checkout_id", candidate.id)
        .maybeSingle();
      if (priorRecord?.status === "sent" || priorRecord?.status === "sending" || priorRecord?.status === "skipped") {
        results.skipped += 1;
        continue;
      }

      const { data: recentSend } = await admin
        .from("checkout_recovery_email_log")
        .select("id")
        .eq("recipient_email", candidate.customerEmail)
        .eq("status", "sent")
        .gte("sent_at", sevenDaysAgo)
        .limit(1);
      if (recentSend && recentSend.length > 0) {
        await admin.from("checkout_recovery_email_log").upsert({
          source: candidate.source,
          checkout_id: candidate.id,
          recipient_email: candidate.customerEmail,
          status: "skipped",
          updated_at: new Date().toISOString(),
        }, { onConflict: "source,checkout_id" });
        results.skipped += 1;
        continue;
      }

      const claim = await admin.from("checkout_recovery_email_log").upsert({
        source: candidate.source,
        checkout_id: candidate.id,
        recipient_email: candidate.customerEmail,
        status: "sending",
        error_message: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "source,checkout_id" }).select("id").maybeSingle();
      if (claim.error || !claim.data) {
        results.skipped += 1;
        continue;
      }

      try {
        const resumeUrl = `${siteUrl}/resume-checkout?source=${candidate.source === "draft" ? "draft" : "checkout"}&token=${candidate.token}`;
        const email = createEmail(candidate, resumeUrl);
        const response = await resend.emails.send({
          from: "Senteur Fragrances <orders@senteurfragrances.com>",
          to: [candidate.customerEmail],
          subject: email.subject,
          html: email.html,
        });
        if (response.error) throw new Error(response.error.message || "Email provider rejected the message.");
        await admin.from("checkout_recovery_email_log").update({
          status: "sent",
          resend_email_id: response.data?.id || null,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", claim.data.id);
        if (candidate.source === "checkout") {
          await admin.from("pending_ziina_checkouts").update({ recovery_status: "contacted" }).eq("id", candidate.id).eq("recovery_status", "new");
        }
        results.sent += 1;
      } catch (error) {
        await admin.from("checkout_recovery_email_log").update({
          status: "failed",
          error_message: error instanceof Error ? error.message.slice(0, 500) : "Email send failed",
          updated_at: new Date().toISOString(),
        }).eq("id", claim.data.id);
        results.failed += 1;
      }
    }

    return json({ success: true, ...results });
  } catch (error) {
    console.error("Checkout recovery email batch failed", error);
    return json({ success: false, message: "Could not process checkout recovery emails." }, 500);
  }
});
