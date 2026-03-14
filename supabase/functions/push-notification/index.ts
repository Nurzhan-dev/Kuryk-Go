import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const VAPID_PUBLIC_KEY = "BIVIlqUOLuf5OtutgoSh2erD0WDkkLVVBYuF0Zwm5_AvMA_XrdGtR3cBgao6zm6RyYIXpZ49FXM40I-3hGJ0uCk";
const VAPID_PRIVATE_KEY = "6szZpJ7fCeVH_MO6E4fuLWodDnDuTNrRoRB0Rs12Vx0";

serve(async (req) => {
  try {
    const { subscription, title, body } = await req.json();

    const webPush = await import("npm:web-push");
    webPush.setVapidDetails(
      "mailto:admin@kuryk-go.com",
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    await webPush.sendNotification(
      subscription,
      JSON.stringify({ title, body })
    );

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});