import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import envJsonRaw from "../../ENV.json?raw";

/**
 * Reads ENV.json (bundled at build time) and writes its non-empty values
 * into the settings row. Admin only. Runs at most once — after success it
 * stamps settings.env_imported_at so the UI hides the prompt forever.
 */
export const importEnvJson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // Verify admin
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!roles?.some((r) => r.role === "admin")) {
      throw new Error("Admin only");
    }

    // Already imported?
    const { data: existing } = await supabaseAdmin
      .from("settings")
      .select("env_imported_at")
      .eq("id", 1)
      .single();
    if (existing?.env_imported_at) {
      return { skipped: true as const, reason: "already-imported" };
    }

    let env: Record<string, any> = {};
    try {
      env = JSON.parse(envJsonRaw);
    } catch {
      throw new Error("ENV.json is not valid JSON");
    }
    const flat: Record<string, unknown> = {
      ...(env.panel ?? {}),
      ...(env.pterodactyl ?? {}),
      ...(env.stripe ?? {}),
      ...(env.smtp ?? {}),
      ...(env.defaults ?? {}),
      ...(env.afk ?? {}),
      ...(env.shop_costs ?? {}),
    };

    // Whitelist of columns we allow ENV.json to populate
    const allowed = new Set([
      "panel_name", "panel_tagline",
      "pterodactyl_url", "pterodactyl_api_key",
      "stripe_secret_key", "stripe_webhook_secret",
      "smtp_host", "smtp_port", "smtp_user", "smtp_password", "smtp_from",
      "default_ram_mb", "default_cpu_pct", "default_disk_mb", "default_servers",
      "coins_per_minute",
      "cost_ram_per_gb", "cost_cpu_per_core", "cost_disk_per_gb", "cost_server_slot",
    ]);

    const update: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(flat)) {
      if (!allowed.has(k)) continue;
      if (v === "" || v === null || v === undefined) continue;
      update[k] = v;
    }
    update.env_imported_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("settings")
      .update(update as never)
      .eq("id", 1);
    if (error) throw new Error(error.message);

    return { skipped: false as const, fieldsImported: Object.keys(update).length - 1 };
  });