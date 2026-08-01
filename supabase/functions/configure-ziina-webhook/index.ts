import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// This one-time setup function is intentionally disabled after successfully
// registering the Ziina webhook. It remains deployed only to avoid leaving a
// reusable configuration surface behind.
Deno.serve(() => new Response("Webhook setup endpoint is disabled", { status: 410 }));
