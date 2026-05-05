import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  PROTECTED_ADMIN_EMAIL,
  PROTECTED_ADMIN_PASSWORD,
  PROTECTED_ADMIN_USERNAME,
} from "@/server/protected-admin.server";

export const Route = createFileRoute("/api/public/ensure-admin")({
  server: {
    handlers: {
      POST: async () => {
        let userId: string | null = null;
        const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
        const existing = list?.users.find(
          (u) => u.email?.toLowerCase() === PROTECTED_ADMIN_EMAIL.toLowerCase(),
        );
        if (existing) {
          userId = existing.id;
        } else {
          const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
            email: PROTECTED_ADMIN_EMAIL,
            password: PROTECTED_ADMIN_PASSWORD,
            email_confirm: true,
            user_metadata: { username: PROTECTED_ADMIN_USERNAME },
          });
          if (error || !created.user) {
            return Response.json({ ok: false, error: error?.message ?? "Failed" }, { status: 500 });
          }
          userId = created.user.id;
        }
        if (!userId) return Response.json({ ok: false }, { status: 500 });

        await supabaseAdmin.from("profiles").upsert(
          { id: userId, username: PROTECTED_ADMIN_USERNAME, email: PROTECTED_ADMIN_EMAIL },
          { onConflict: "id" },
        );
        await supabaseAdmin.from("user_resources").upsert({ user_id: userId }, { onConflict: "user_id" });
        const { data: roleRow } = await supabaseAdmin
          .from("user_roles")
          .select("id")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        if (!roleRow) {
          await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
        }
        return Response.json({ ok: true });
      },
    },
  },
});