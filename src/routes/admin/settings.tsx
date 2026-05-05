import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPublicConfig, getEnvValidation, type PublicConfig } from "@/server/config.functions";
import type { EnvValidation } from "@/server/env-schema";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const [cfg, setCfg] = useState<PublicConfig | null>(null);
  const [validation, setValidation] = useState<EnvValidation | null>(null);
  const load = useServerFn(getPublicConfig);
  const loadValidation = useServerFn(getEnvValidation);

  useEffect(() => {
    loadValidation().then(setValidation);
    load().then(setCfg).catch(() => setCfg(null));
  }, [load, loadValidation]);

  if (!validation) return <div className="text-muted-foreground">Loading…</div>;

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
  const Status = ({ ok }: { ok: boolean }) => (
    <span className={ok ? "text-emerald-500" : "text-amber-500"}>
      {ok ? "Configured" : "Not configured"}
    </span>
  );
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div>{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All configuration lives in <code className="rounded bg-muted px-1 py-0.5">ENV.json</code> at the project root.
          Edit that file to change any value — the server reads it on every request.
        </p>
      </div>

      {validation.parseError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
            <div>
              <p className="font-medium text-destructive">ENV.json is not valid JSON</p>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{validation.parseError}</pre>
            </div>
          </div>
        </div>
      )}

      {!validation.parseError && validation.issues.length > 0 && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" />
            <div className="flex-1">
              <p className="font-medium">ENV.json has {validation.issues.length} issue{validation.issues.length === 1 ? "" : "s"}</p>
              <ul className="mt-2 space-y-1 text-xs">
                {validation.issues.map((i, idx) => (
                  <li key={idx} className="font-mono">
                    <span className="text-amber-500">{i.path || "(root)"}</span>{" "}
                    <span className="text-muted-foreground">— {i.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {validation.ok && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>ENV.json is valid.</span>
        </div>
      )}

      {!cfg ? (
        <div className="text-sm text-muted-foreground">Fix ENV.json above to view resolved configuration.</div>
      ) : (
      <>
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
        <p className="font-medium">How placeholders work</p>
        <p className="mt-1 text-muted-foreground">
          Anywhere a value is needed (e.g. an outgoing API call), the server resolves tokens
          like <code className="rounded bg-muted px-1">{"{PTERODACTYL_API_KEY}"}</code>,{" "}
          <code className="rounded bg-muted px-1">{"{PANEL_NAME}"}</code>, or{" "}
          <code className="rounded bg-muted px-1">{"{STRIPE_SECRET_KEY}"}</code> from ENV.json. Secrets are never sent to the browser.
        </p>
      </div>

      <Section title="Branding">
        <Row label="Panel name" value={cfg.panel_name} />
        <Row label="Tagline" value={cfg.panel_tagline || "—"} />
      </Section>

      <Section title="Integrations">
        <Row label="Pterodactyl URL" value={cfg.pterodactyl_url || "—"} />
        <Row label="Pterodactyl API key" value={<Status ok={cfg.pterodactyl_configured} />} />
        <Row label="Stripe" value={<Status ok={cfg.stripe_configured} />} />
        <Row label="SMTP" value={<Status ok={cfg.smtp_configured} />} />
      </Section>

      <Section title="Default user resources">
        <Row label="RAM" value={`${cfg.defaults.ram_mb} MB`} />
        <Row label="CPU" value={`${cfg.defaults.cpu_pct}%`} />
        <Row label="Disk" value={`${cfg.defaults.disk_mb} MB`} />
        <Row label="Server slots" value={cfg.defaults.servers} />
      </Section>

      <Section title="AFK shop economy">
        <Row label="Coins per minute (AFK)" value={cfg.coins_per_minute} />
        <Row label="Cost: +1 GB RAM" value={`${cfg.shop_costs.cost_ram_per_gb} coins`} />
        <Row label="Cost: +100% CPU" value={`${cfg.shop_costs.cost_cpu_per_core} coins`} />
        <Row label="Cost: +1 GB Disk" value={`${cfg.shop_costs.cost_disk_per_gb} coins`} />
        <Row label="Cost: +1 server slot" value={`${cfg.shop_costs.cost_server_slot} coins`} />
      </Section>
      </>
      )}
    </div>
  );
}
