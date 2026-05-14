
-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Trigger function: fire delivery email when status becomes 'delivered'
CREATE OR REPLACE FUNCTION public.trigger_delivery_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  service_key text;
  fn_url text := 'https://gzddmdwgzcnikqurtnsy.supabase.co/functions/v1/send-delivery-notification';
BEGIN
  IF NEW.status = 'delivered'
     AND (OLD.status IS DISTINCT FROM 'delivered')
     AND COALESCE(NEW.delivery_email_sent, false) = false
  THEN
    -- Pull service role key from vault if present, otherwise rely on no-jwt setting
    BEGIN
      SELECT decrypted_secret INTO service_key
      FROM vault.decrypted_secrets
      WHERE name = 'service_role_key'
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      service_key := NULL;
    END;

    PERFORM net.http_post(
      url := fn_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(service_key, current_setting('app.settings.service_role_key', true), '')
      ),
      body := jsonb_build_object('orderId', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_delivered_email_trigger ON public.orders;
CREATE TRIGGER orders_delivered_email_trigger
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.trigger_delivery_notification();
