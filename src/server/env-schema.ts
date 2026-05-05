import { z } from "zod";

// Schema for ENV.json. Most fields are optional strings so a partially-filled
// ENV.json doesn't crash the whole app — instead /admin/settings surfaces the
// list of missing/invalid fields.
export const EnvSchema = z.object({
  panel: z.object({
    panel_name: z.string().min(1, "panel.panel_name is required"),
    panel_tagline: z.string().default(""),
  }),
  admin: z
    .object({
      email: z.string().email().or(z.literal("")).optional(),
      username: z.string().optional(),
      password: z.string().optional(),
    })
    .optional(),
  pterodactyl: z
    .object({
      pterodactyl_url: z.string().url().or(z.literal("")).optional(),
      pterodactyl_api_key: z.string().optional(),
    })
    .optional(),
  stripe: z
    .object({
      stripe_secret_key: z.string().optional(),
      stripe_webhook_secret: z.string().optional(),
    })
    .optional(),
  smtp: z
    .object({
      smtp_host: z.string().optional(),
      smtp_port: z.number().int().positive().default(587),
      smtp_user: z.string().optional(),
      smtp_password: z.string().optional(),
      smtp_from: z.string().email().or(z.literal("")).optional(),
    })
    .optional(),
  defaults: z.object({
    default_ram_mb: z.number().int().positive(),
    default_cpu_pct: z.number().int().positive(),
    default_disk_mb: z.number().int().positive(),
    default_servers: z.number().int().positive(),
  }),
  afk: z.object({
    coins_per_minute: z.number().nonnegative(),
  }),
  shop_costs: z.object({
    cost_ram_per_gb: z.number().nonnegative(),
    cost_cpu_per_core: z.number().nonnegative(),
    cost_disk_per_gb: z.number().nonnegative(),
    cost_server_slot: z.number().nonnegative(),
  }),
}).passthrough();

export type ParsedEnv = z.infer<typeof EnvSchema>;

export type EnvIssue = { path: string; message: string };

export type EnvValidation =
  | { ok: true; issues: []; parseError: null }
  | { ok: false; issues: EnvIssue[]; parseError: string | null };

export function validateEnv(raw: string): EnvValidation {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { ok: false, issues: [], parseError: (e as Error).message };
  }
  const result = EnvSchema.safeParse(parsed);
  if (result.success) return { ok: true, issues: [], parseError: null };
  return {
    ok: false,
    parseError: null,
    issues: result.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    })),
  };
}