import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ found: false }, { status: 405, headers: corsHeaders });

  try {
    const { reference, phone } = await request.json();
    const normalizedReference = String(reference ?? "").trim().toUpperCase();
    const normalizedPhone = String(phone ?? "").trim();

    if (!/^SEN-[A-F0-9]{8}$/.test(normalizedReference) || normalizedPhone.length < 8) {
      return Response.json({ found: false }, { headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Order tracking is not configured");

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await admin.rpc("get_order_tracking", {
      p_order_reference: normalizedReference,
      p_phone: normalizedPhone,
    });
    if (error) throw error;

    return Response.json({ found: Boolean(data?.[0]), tracking: data?.[0] ?? null }, { headers: corsHeaders });
  } catch (error) {
    console.error("Order tracking lookup failed", error);
    return Response.json({ found: false }, { status: 500, headers: corsHeaders });
  }
});
