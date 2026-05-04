import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/freeplans")({ component: Page });

const TYPES = ["MINECRAFT", "PYTHON", "NODEJS", "VPS", "OTHER"] as const;

function parsePeriod(v: string): number {
  const m = v.trim().toLowerCase().match(/^(\d+)\s*(sec|min|h|d|wk|mo)$/);
  if (!m) return 0;
  const n = Number(m[1]);
  const u = m[2];
  return n * ({ sec: 1, min: 60, h: 3600, d: 86400, wk: 604800, mo: 2592000 } as Record<string, number>)[u];
}

type Plan = { id: string; name: string; type: string; ram_mb: number; cpu_pct: number; disk_mb: number; time_period_seconds: number; egg_id: number | null; description: string | null; active: boolean };

function Page() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({ name: "", type: "MINECRAFT", ram: "1024", cpu: "50", disk: "5120", period: "1d", egg: "", description: "" });

  const load = async () => {
    const { data } = await supabase.from("free_plans").select("*").order("created_at", { ascending: false });
    setPlans((data ?? []) as Plan[]);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const seconds = parsePeriod(form.period);
    if (!seconds) return toast.error("Time period: use e.g. 1mo, 1wk, 1d, 1h, 1min, 1sec");
    const { error } = await supabase.from("free_plans").insert([{
      name: form.name,
      type: form.type as "MINECRAFT" | "PYTHON" | "NODEJS" | "VPS" | "OTHER",
      ram_mb: Number(form.ram),
      cpu_pct: Number(form.cpu),
      disk_mb: Number(form.disk),
      time_period_seconds: seconds,
      egg_id: form.egg ? Number(form.egg) : null,
      description: form.description || null,
    }]);
    if (error) return toast.error(error.message);
    toast.success("Free plan added");
    setForm({ name: "", type: "MINECRAFT", ram: "1024", cpu: "50", disk: "5120", period: "1d", egg: "", description: "" });
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    await supabase.from("free_plans").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Free Plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">Plans expire automatically when the time period ends.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Add new free plan</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Type</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><Label>Egg ID (Pterodactyl)</Label><Input value={form.egg} onChange={(e) => setForm({ ...form, egg: e.target.value })} placeholder="optional" /></div>
          <div><Label>RAM (MB)</Label><Input type="number" value={form.ram} onChange={(e) => setForm({ ...form, ram: e.target.value })} /></div>
          <div><Label>CPU (%)</Label><Input type="number" value={form.cpu} onChange={(e) => setForm({ ...form, cpu: e.target.value })} /></div>
          <div><Label>Disk (MB)</Label><Input type="number" value={form.disk} onChange={(e) => setForm({ ...form, disk: e.target.value })} /></div>
          <div><Label>Time period</Label><Input value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="1mo, 1wk, 1d, 1h, 1min, 1sec" /></div>
          <div className="md:col-span-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
        <div className="mt-4 flex justify-end"><Button onClick={add}>Add plan</Button></div>
      </div>

      <div className="space-y-3">
        {plans.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <div className="font-medium">{p.name} <span className="ml-2 text-xs text-muted-foreground">{p.type}</span></div>
              <div className="text-sm text-muted-foreground">{p.ram_mb}MB RAM · {p.cpu_pct}% CPU · {p.disk_mb}MB disk · {p.time_period_seconds}s</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {plans.length === 0 && <p className="text-sm text-muted-foreground">No free plans yet.</p>}
      </div>
    </div>
  );
}