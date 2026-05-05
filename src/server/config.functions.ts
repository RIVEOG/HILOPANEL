import { createServerFn } from "@tanstack/react-start";
import { getEnvConfig } from "./env-config.server";
import envJsonRaw from "../../ENV.json?raw";
import { validateEnv, type EnvValidation } from "./env-schema";

/**
 * Returns ONLY the public, client-safe slice of ENV.json.
 * Never expose secrets (API keys, SMTP passwords, Stripe keys, admin creds).
 */
export const getPublicConfig = createServerFn({ method: "GET" }).handler(async () => {
  const env = getEnvConfig();
  return {
    panel_name: env.panel?.panel_name ?? "Hilos",
    panel_tagline: env.panel?.panel_tagline ?? "",
    coins_per_minute: env.afk?.coins_per_minute ?? 1,
    defaults: {
      ram_mb: env.defaults?.default_ram_mb ?? 1024,
      cpu_pct: env.defaults?.default_cpu_pct ?? 50,
      disk_mb: env.defaults?.default_disk_mb ?? 5120,
      servers: env.defaults?.default_servers ?? 1,
    },
    shop_costs: {
      cost_ram_per_gb: env.shop_costs?.cost_ram_per_gb ?? 100,
      cost_cpu_per_core: env.shop_costs?.cost_cpu_per_core ?? 200,
      cost_disk_per_gb: env.shop_costs?.cost_disk_per_gb ?? 50,
      cost_server_slot: env.shop_costs?.cost_server_slot ?? 500,
    },
    pterodactyl_url: env.pterodactyl?.pterodactyl_url ?? "",
    pterodactyl_configured: Boolean(env.pterodactyl?.pterodactyl_api_key),
    stripe_configured: Boolean(env.stripe?.stripe_secret_key),
    smtp_configured: Boolean(env.smtp?.smtp_host),
  };
});

export type PublicConfig = Awaited<ReturnType<typeof getPublicConfig>>;

/**
 * Returns the validation status of ENV.json. Used by /admin/settings to
 * display clear errors when required fields are missing or invalid.
 */
export const getEnvValidation = createServerFn({ method: "GET" }).handler(
  async (): Promise<EnvValidation> => {
    return validateEnv(envJsonRaw);
  },
);