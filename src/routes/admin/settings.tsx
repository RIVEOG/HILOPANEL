import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

type Settings = {
  panel_name: string; panel_tagline: string | null;
  pterodactyl_url: string | null; pterodactyl_api_key: string | null;
  stripe_secret_key: string | null; stripe_webhook_secret: string | null;
  smtp_host: string | null; smtp_port: number | null; smtp_user: string | null; smtp_password: string | null; smtp_from: string | null;
  default_ram_mb: number; default_cpu_pct: number; default_disk_mb: number; default_servers: number;
  coins_per_minute: number;
  cost_ram_per_gb: number; cost_cpu_per_core: number; cost_disk_per_gb: number; cost_server_slot: number;
};

function SettingsPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => setS(data as Settings));
  }, []);

  if (!s) return <div className="text-muted-foreground">Loading…</div>;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS({ ...s, [k]: v });

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("settings").update(s).eq("id", 1);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
  const F = ({ label, k, type = "text" }: { label: string; k: keyof Settings; type?: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={(s[k] as string | number | null) ?? ""} onChange={(e) => set(k, (type === "number" ? Number(e.target.value) : e.target.value) as Settings[typeof k])} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Panel name, integrations, defaults — all live in the database. No ENV.json to leak.</p>
      </div>
      <Section title="Branding">
        <F label="Panel name" k="panel_name" />
        <F label="Tagline" k="panel_tagline" />
      </Section>
      <Section title="Pterodactyl">
        <F label="Panel URL (https://panel.example.com)" k="pterodactyl_url" />
        <F label="Application API key" k="pterodactyl_api_key" />
      </Section>
      <Section title="Stripe">
        <F label="Secret key (sk_live_… / sk_test_…)" k="stripe_secret_key" />
        <F label="Webhook secret (whsec_…)" k="stripe_webhook_secret" />
      </Section>
      <Section title="SMTP (password reset / mail)">
        <F label="Host" k="smtp_host" />
        <F label="Port" k="smtp_port" type="number" />
        <F label="Username" k="smtp_user" />
        <F label="Password" k="smtp_password" />
        <F label="From address" k="smtp_from" />
      </Section>
      <Section title="Default user resources">
        <F label="RAM (MB)" k="default_ram_mb" type="number" />
        <F label="CPU (%)" k="default_cpu_pct" type="number" />
        <F label="Disk (MB)" k="default_disk_mb" type="number" />
        <F label="Server slots" k="default_servers" type="number" />
      </Section>
      <Section title="AFK shop economy">
        <F label="Coins per minute (AFK)" k="coins_per_minute" type="number" />
        <F label="Cost: RAM per GB" k="cost_ram_per_gb" type="number" />
        <F label="Cost: CPU per 100%" k="cost_cpu_per_core" type="number" />
        <F label="Cost: Disk per GB" k="cost_disk_per_gb" type="number" />
        <F label="Cost: extra server slot" k="cost_server_slot" type="number" />
      </Section>
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </div>
    </div>
  );
}