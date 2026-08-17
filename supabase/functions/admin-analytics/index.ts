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

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const startOfVisitorWindow = new Date(startOfToday);
    startOfVisitorWindow.setUTCDate(startOfVisitorWindow.getUTCDate() - 29);
    const [paymentsRes, logsRes, perfumesRes, visitorTotalRes, visitorTodayRes, visitorRecentRes] = await Promise.all([
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
      supabase.from('site_visitors').select('*', { count: 'exact', head: true }),
      supabase
        .from('site_visitors')
        .select('*', { count: 'exact', head: true })
        .gte('first_seen_at', startOfToday.toISOString()),
      supabase
        .from('site_visitors')
        .select('first_seen_at')
        .gte('first_seen_at', startOfVisitorWindow.toISOString())
        .order('first_seen_at', { ascending: true })
        .limit(10000),
    ]);

    const payments = paymentsRes.data || [];
    const logs = logsRes.data || [];
    const perfumes = perfumesRes.data || [];
    const visitorCounts = new Map<string, number>();
    (visitorRecentRes.data || []).forEach((visit: { first_seen_at: string }) => {
      const day = visit.first_seen_at.slice(0, 10);
      visitorCounts.set(day, (visitorCounts.get(day) || 0) + 1);
    });
    const visitorDaily = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(startOfVisitorWindow);
      date.setUTCDate(date.getUTCDate() + index);
      const day = date.toISOString().slice(0, 10);
      return {
        date: day,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        visitors: visitorCounts.get(day) || 0,
      };
    });

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
      JSON.stringify({
        payments,
        logs,
        perfumes,
        orderItems,
        visitors: {
          total: visitorTotalRes.count || 0,
          today: visitorTodayRes.count || 0,
          daily: visitorDaily,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
