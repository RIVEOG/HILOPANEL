import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPublicConfig, type PublicConfig } from "@/server/config.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const [cfg, setCfg] = useState<PublicConfig | null>(null);
  const load = useServerFn(getPublicConfig);

  useEffect(() => { load().then(setCfg); }, [load]);

  if (!cfg) return <div className="text-muted-foreground">Loading…</div>;

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
    </div>
  );
}
