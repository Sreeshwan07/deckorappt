import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const { query, slideId } = await req.json();
    if (!query || typeof query !== "string" || !slideId || typeof slideId !== "string")
      return json({ error: "Invalid request" }, 400);

    // Ownership check via RLS
    const { data: owned } = await userClient.from("slides").select("id").eq("id", slideId).maybeSingle();
    if (!owned) return json({ error: "Forbidden" }, 403);

    const PEXELS = Deno.env.get("PEXELS_API_KEY");
    if (!PEXELS) return json({ error: "Pexels API key not configured. Please add PEXELS_API_KEY." }, 503);

    const url = `https://api.pexels.com/v1/search?per_page=5&orientation=landscape&query=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { Authorization: PEXELS } });
    if (!res.ok) {
      console.error("Pexels error", res.status, await res.text());
      return json({ error: "Image search failed" }, 502);
    }
    const data = await res.json();
    const photo = data?.photos?.[0];
    const image_url: string | null = photo?.src?.large2x || photo?.src?.large || photo?.src?.medium || null;
    if (!image_url) return json({ error: "No image found" }, 404);

    // Persist with service role (we already verified ownership)
    const admin = createClient(supabaseUrl, serviceKey);
    await admin.from("slides").update({ image_url }).eq("id", slideId);

    return json({ image_url });
  } catch (e) {
    console.error("fetch-slide-image error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
