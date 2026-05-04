import envJsonRaw from "../../ENV.json?raw";

/**
 * Server-only ENV.json reader. ENV.json is the single source of truth for
 * all panel configuration. Edit the file in the repo to change config.
 * Never import this file from client code — it's `.server.ts` and Vite's
 * import protection will block client bundles.
 */
export type EnvConfig = {
  panel: { panel_name: string; panel_tagline: string };
  admin: { email: string; username: string; password: string };
  pterodactyl: { pterodactyl_url: string; pterodactyl_api_key: string };
  stripe: { stripe_secret_key: string; stripe_webhook_secret: string };
  smtp: {
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    smtp_password: string;
    smtp_from: string;
  };
  defaults: {
    default_ram_mb: number;
    default_cpu_pct: number;
    default_disk_mb: number;
    default_servers: number;
  };
  afk: { coins_per_minute: number };
  shop_costs: {
    cost_ram_per_gb: number;
    cost_cpu_per_core: number;
    cost_disk_per_gb: number;
    cost_server_slot: number;
  };
};

let cached: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (cached) return cached;
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(envJsonRaw);
  } catch (e) {
    throw new Error("ENV.json is not valid JSON: " + (e as Error).message);
  }
  cached = parsed as unknown as EnvConfig;
  return cached;
}

/**
 * Resolve a string value, replacing `{PLACEHOLDER}` tokens with values from
 * ENV.json. Tokens are matched case-insensitively against the flattened
 * config keys (e.g. `{PTERODACTYL_API_KEY}`, `{PANEL_NAME}`).
 *
 * Example: `resolvePlaceholders("Bearer {PTERODACTYL_API_KEY}")`
 */
export function resolvePlaceholders(input: string): string {
  const env = getEnvConfig();
  const flat: Record<string, string> = {};
  for (const section of Object.values(env) as Array<Record<string, unknown>>) {
    if (!section || typeof section !== "object") continue;
    for (const [k, v] of Object.entries(section)) {
      if (v === null || v === undefined) continue;
      flat[k.toUpperCase()] = String(v);
    }
  }
  return input.replace(/\{([A-Z0-9_]+)\}/gi, (_m, key: string) => {
    const v = flat[key.toUpperCase()];
    return v ?? `{${key}}`;
  });
}