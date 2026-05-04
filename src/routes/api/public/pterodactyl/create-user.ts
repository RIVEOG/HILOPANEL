import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getEnvConfig } from "@/server/env-config.server";

export const Route = createFileRoute("/api/public/pterodactyl/create-user")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { user_id: string; email: string; username: string; password: string };
        const env = getEnvConfig();
        const url = env.pterodactyl?.pterodactyl_url;
        const key = env.pterodactyl?.pterodactyl_api_key;
        if (!url || !key) {
          return Response.json({ error: "Pterodactyl not configured in ENV.json" }, { status: 400 });
        }
        try {
          const r = await fetch(`${url.replace(/\/$/, "")}/api/application/users`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
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
