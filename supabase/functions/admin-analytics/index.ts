import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-password',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const adminPassword = req.headers.get('x-admin-password');
    if (!adminPassword || adminPassword !== Deno.env.get('ADMIN_PASSWORD')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const [paymentsRes, logsRes, perfumesRes] = await Promise.all([
      supabase
        .from('successful_payments')
        .select('id, amount, created_at, order_id')
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: true }),
      supabase
        .from('inventory_logs')
        .select('id, perfume_id, change_type, quantity_change, created_at')
        .order('created_at', { ascending: true })
        .limit(5000),
      supabase.from('perfumes').select('id, name, price_value'),
    ]);

    const payments = paymentsRes.data || [];
    const logs = logsRes.data || [];
    const perfumes = perfumesRes.data || [];

    const orderIds = Array.from(new Set(payments.map((p: any) => p.order_id).filter(Boolean)));
    let orderItems: any[] = [];
    if (orderIds.length) {
      const { data } = await supabase
        .from('order_items')
        .select('perfume_id, quantity, price, order_id')
        .in('order_id', orderIds);
      orderItems = data || [];
    }

    return new Response(
      JSON.stringify({ payments, logs, perfumes, orderItems }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
