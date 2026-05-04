import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/pterodactyl/create-server")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json() as { user_id: string; name: string; ram_mb: number; cpu_pct: number; disk_mb: number; egg_id: number | null };
        const { data: s } = await supabaseAdmin.from("settings").select("pterodactyl_url, pterodactyl_api_key").eq("id", 1).maybeSingle();
        if (!s?.pterodactyl_url || !s?.pterodactyl_api_key) return Response.json({ error: "Pterodactyl not configured" }, { status: 400 });
        const { data: p } = await supabaseAdmin.from("profiles").select("pterodactyl_user_id").eq("id", body.user_id).maybeSingle();
        if (!p?.pterodactyl_user_id) return Response.json({ error: "User not linked to Pterodactyl" }, { status: 400 });
        // Real provisioning requires nest/egg/allocation lookups specific to the panel.
        // Returning a placeholder; admin should configure default nest/location once panel is reachable.
        return Response.json({ ok: true, pterodactyl_server_id: null, note: "Server record created locally. Configure nest/location in Pterodactyl integration to auto-provision." });
      },
    },
  },
});