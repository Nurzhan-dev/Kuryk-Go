import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webpush from "npm:web-push@3.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

webpush.setVapidDetails(
  "mailto:admin@kuryk-go.com",
  "BIVIlqUOLuf5OtutgoSh2erD0WDkkLVVBYuF0Zwm5_AvMA_XrdGtR3cBgao6zm6RyYIXpZ49FXM40I-3hGJ0uCk",
  "6szZpJ7fCeVH_MO6E4fuLWodDnDuTNrRoRB0Rs12Vx0"
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { subscription, title, body } = await req.json();
    await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Ошибка:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});