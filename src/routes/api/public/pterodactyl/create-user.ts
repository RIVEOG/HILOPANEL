import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/pterodactyl/create-user")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json() as { user_id: string; email: string; username: string; password: string };
        const { data: s } = await supabaseAdmin.from("settings").select("pterodactyl_url, pterodactyl_api_key").eq("id", 1).maybeSingle();
        if (!s?.pterodactyl_url || !s?.pterodactyl_api_key) {
          return Response.json({ error: "Pterodactyl not configured" }, { status: 400 });
        }
        try {
          const r = await fetch(`${s.pterodactyl_url.replace(/\/$/, "")}/api/application/users`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${s.pterodactyl_api_key}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: body.email,
              username: body.username,
              first_name: body.username,
              last_name: "User",
              password: body.password,
            }),
          });
          const j = await r.json();
          if (!r.ok) return Response.json({ error: j }, { status: r.status });
          const pteroId = j?.attributes?.id;
          if (pteroId) {
            await supabaseAdmin.from("profiles").update({ pterodactyl_user_id: pteroId }).eq("id", body.user_id);
          }
          return Response.json({ ok: true, pterodactyl_user_id: pteroId });
        } catch (e) {
          return Response.json({ error: String(e) }, { status: 500 });
        }
      },
    },
  },
});