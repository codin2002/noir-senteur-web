-- Send one recovery email three hours after a saved or incomplete checkout.
-- The log makes delivery idempotent and allows the admin dashboard to show it.

create table if not exists public.checkout_recovery_email_log (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('draft', 'checkout')),
  checkout_id uuid not null,
  recipient_email text not null,
  status text not null default 'sending' check (status in ('sending', 'sent', 'failed', 'skipped')),
  resend_email_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, checkout_id)
);

alter table public.checkout_recovery_email_log enable row level security;
revoke all on table public.checkout_recovery_email_log from public, anon, authenticated;
create index if not exists checkout_recovery_email_recent_idx
  on public.checkout_recovery_email_log (recipient_email, sent_at desc)
  where status = 'sent';

create extension if not exists pg_cron with schema extensions;

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'checkout_recovery_cron_secret') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'checkout_recovery_cron_secret');
  end if;
end;
$$;

create or replace function public.verify_checkout_recovery_cron_secret(p_secret text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare expected_secret text;
begin
  if p_secret is null or length(p_secret) < 32 then
    return false;
  end if;
  select decrypted_secret into expected_secret
  from vault.decrypted_secrets
  where name = 'checkout_recovery_cron_secret';
  return expected_secret is not null and p_secret = expected_secret;
end;
$$;

revoke all on function public.verify_checkout_recovery_cron_secret(text) from public, anon, authenticated;
grant execute on function public.verify_checkout_recovery_cron_secret(text) to service_role;

create or replace function public.trigger_checkout_recovery_email_delivery()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  cron_secret text;
begin
  select decrypted_secret into cron_secret
  from vault.decrypted_secrets
  where name = 'checkout_recovery_cron_secret';

  if cron_secret is null then
    raise exception 'Checkout recovery scheduler secret is not configured';
  end if;

  perform net.http_post(
    url := 'https://gzddmdwgzcnikqurtnsy.supabase.co/functions/v1/send-checkout-recovery-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-checkout-recovery-cron-secret', cron_secret
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
end;
$$;

revoke all on function public.trigger_checkout_recovery_email_delivery() from public, anon, authenticated;
grant execute on function public.trigger_checkout_recovery_email_delivery() to service_role;

do $$
declare existing_job_id bigint;
begin
  select jobid into existing_job_id from cron.job where jobname = 'checkout-recovery-emails-every-15-minutes';
  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;
  perform cron.schedule(
    'checkout-recovery-emails-every-15-minutes',
    '*/15 * * * *',
    $schedule$select public.trigger_checkout_recovery_email_delivery();$schedule$
  );
end;
$$;

drop function if exists public.get_admin_checkout_drafts();
create function public.get_admin_checkout_drafts()
returns table(
  id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  expires_at timestamptz,
  amount numeric,
  currency text,
  customer_name text,
  customer_phone text,
  customer_email text,
  delivery_address text,
  offer_name text,
  cart_items jsonb,
  resume_token uuid,
  recovery_email_status text,
  recovery_email_sent_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.has_role((select auth.uid()), 'admin'::public.app_role) then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;

  return query
  select
    draft.id, draft.created_at, draft.updated_at, draft.expires_at, draft.amount, draft.currency,
    coalesce(draft.customer_name, nullif(btrim(substring(draft.delivery_address from 'Contact: ([^|]*)')), '')),
    coalesce(draft.customer_phone, nullif(btrim(substring(draft.delivery_address from 'Phone: ([^|]*)')), '')),
    coalesce(draft.customer_email, nullif(btrim(substring(draft.delivery_address from 'Email: ([^|]*)')), '')),
    nullif(btrim(substring(draft.delivery_address from 'Address: ([^|]*)')), ''),
    nullif(draft.meta_context ->> 'offer_name', ''), draft.cart_items, draft.draft_token,
    email_log.status, email_log.sent_at
  from public.checkout_drafts draft
  left join public.checkout_recovery_email_log email_log
    on email_log.source = 'draft' and email_log.checkout_id = draft.id
  where draft.status = 'draft' and draft.mode = 'live'
  order by draft.updated_at desc
  limit 100;
end;
$$;

revoke all on function public.get_admin_checkout_drafts() from public, anon;
grant execute on function public.get_admin_checkout_drafts() to authenticated;

drop function if exists public.get_admin_checkout_recovery();
create function public.get_admin_checkout_recovery()
returns table(
  id uuid,
  created_at timestamptz,
  amount numeric,
  currency text,
  checkout_status text,
  provider_status text,
  recovery_status text,
  customer_name text,
  customer_phone text,
  customer_email text,
  delivery_address text,
  offer_name text,
  reminder_consent boolean,
  cart_items jsonb,
  resume_token uuid,
  recovery_email_status text,
  recovery_email_sent_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.has_role((select auth.uid()), 'admin'::public.app_role) then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;

  return query
  select
    checkout.id, checkout.created_at, checkout.amount, checkout.currency, checkout.status,
    nullif(checkout.provider_payload ->> 'status', ''), checkout.recovery_status,
    nullif(btrim(substring(checkout.delivery_address from 'Contact: ([^|]*)')), ''),
    nullif(btrim(substring(checkout.delivery_address from 'Phone: ([^|]*)')), ''),
    nullif(btrim(substring(checkout.delivery_address from 'Email: ([^|]*)')), ''),
    nullif(btrim(substring(checkout.delivery_address from 'Address: ([^|]*)')), ''),
    nullif(checkout.meta_context ->> 'offer_name', ''),
    coalesce((checkout.meta_context ->> 'reminder_consent')::boolean, false),
    checkout.cart_items, checkout.lookup_token, email_log.status, email_log.sent_at
  from public.pending_ziina_checkouts checkout
  left join public.checkout_recovery_email_log email_log
    on email_log.source = 'checkout' and email_log.checkout_id = checkout.id
  where checkout.mode = 'live'
    and checkout.order_id is null
    and checkout.status in ('pending', 'failed')
    and checkout.created_at >= now() - interval '30 days'
    and checkout.created_at <= now() - interval '15 minutes'
  order by checkout.created_at desc;
end;
$$;

revoke all on function public.get_admin_checkout_recovery() from public, anon;
grant execute on function public.get_admin_checkout_recovery() to authenticated;
