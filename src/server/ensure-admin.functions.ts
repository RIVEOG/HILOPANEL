import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  PROTECTED_ADMIN_EMAIL,
  PROTECTED_ADMIN_PASSWORD,
  PROTECTED_ADMIN_USERNAME,
} from "./protected-admin.server";

/**
 * Idempotently provisions the hardcoded protected admin account.
 * Safe to call repeatedly — it only creates the user/profile/role rows
 * if they don't already exist.
 */
export const ensureProtectedAdmin = createServerFn({ method: "POST" }).handler(
  async () => {
    // 1) Find or create the auth user.
    let userId: string | null = null;
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
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
        return { ok: false, error: error?.message ?? "Failed to create admin" };
      }
      userId = created.user.id;
    }

    if (!userId) return { ok: false, error: "No user id" };

    // 2) Ensure profile row exists.
    await supabaseAdmin
      .from("profiles")
      .upsert(
        { id: userId, username: PROTECTED_ADMIN_USERNAME, email: PROTECTED_ADMIN_EMAIL },
        { onConflict: "id" },
      );

    // 3) Ensure user_resources row exists.
    await supabaseAdmin
      .from("user_resources")
      .upsert({ user_id: userId }, { onConflict: "user_id" });

    // 4) Ensure admin role.
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
    }

    return { ok: true, user_id: userId };
  },
);