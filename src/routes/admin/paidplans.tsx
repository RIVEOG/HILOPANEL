import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/paidplans")({ component: Page });

const TYPES = ["MINECRAFT", "PYTHON", "NODEJS", "VPS", "OTHER"] as const;

type Plan = { id: string; name: string; type: string; ram_mb: number; cpu_pct: number; disk_mb: number; price_cents: number; payment_method: "stripe" | "discord"; discord_redirect: string | null; egg_id: number | null };

function Page() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({ name: "", type: "MINECRAFT", ram: "2048", cpu: "100", disk: "10240", price: "5", egg: "", method: "stripe", discord: "" });

  const isVps = form.type === "VPS";
  // Force discord on VPS
  useEffect(() => { if (isVps && form.method !== "discord") setForm((f) => ({ ...f, method: "discord" })); }, [isVps, form.method]);

  const load = async () => {
    const { data } = await supabase.from("paid_plans").select("*").order("created_at", { ascending: false });
    setPlans((data ?? []) as Plan[]);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (form.method === "discord" && !form.discord) return toast.error("Discord redirect URL required");
    const { error } = await supabase.from("paid_plans").insert([{
      name: form.name,
      type: form.type as "MINECRAFT" | "PYTHON" | "NODEJS" | "VPS" | "OTHER",
      ram_mb: Number(form.ram), cpu_pct: Number(form.cpu), disk_mb: Number(form.disk),
      price_cents: Math.round(Number(form.price) * 100),
      payment_method: form.method as "stripe" | "discord",
      discord_redirect: form.method === "discord" ? form.discord : null,
      egg_id: form.egg ? Number(form.egg) : null,
    }]);
    if (error) return toast.error(error.message);
    toast.success("Paid plan added");
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("paid_plans").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Paid Plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">Stripe or Discord redirect. VPS plans are Discord-only.</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Add new paid plan</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Type</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><Label>Egg ID</Label><Input value={form.egg} onChange={(e) => setForm({ ...form, egg: e.target.value })} placeholder="optional" /></div>
          <div><Label>RAM (MB)</Label><Input type="number" value={form.ram} onChange={(e) => setForm({ ...form, ram: e.target.value })} /></div>
          <div><Label>CPU (%)</Label><Input type="number" value={form.cpu} onChange={(e) => setForm({ ...form, cpu: e.target.value })} /></div>
          <div><Label>Disk (MB)</Label><Input type="number" value={form.disk} onChange={(e) => setForm({ ...form, disk: e.target.value })} /></div>
          <div><Label>Price (USD)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          <div><Label>Payment method</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60" value={form.method} disabled={isVps} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              <option value="stripe">Stripe</option>
              <option value="discord">Discord</option>
            </select>
            {isVps && <p className="mt-1 text-xs text-muted-foreground">VPS only supports Discord.</p>}
          </div>
          {form.method === "discord" && (
            <div className="md:col-span-3"><Label>Discord redirect URL</Label><Input value={form.discord} onChange={(e) => setForm({ ...form, discord: e.target.value })} placeholder="https://discord.gg/..." /></div>
          )}
        </div>
        <div className="mt-4 flex justify-end"><Button onClick={add}>Add plan</Button></div>
      </div>
      <div className="space-y-3">
        {plans.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <div className="font-medium">{p.name} <span className="ml-2 text-xs text-muted-foreground">{p.type} · {p.payment_method}</span></div>
              <div className="text-sm text-muted-foreground">{p.ram_mb}MB · {p.cpu_pct}% · {p.disk_mb}MB · ${(p.price_cents / 100).toFixed(2)}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {plans.length === 0 && <p className="text-sm text-muted-foreground">No paid plans yet.</p>}
      </div>
    </div>
  );
}