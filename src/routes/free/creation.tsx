import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/free/creation")({ component: Page });

type FreePlan = { id: string; name: string; type: string; ram_mb: number; cpu_pct: number; disk_mb: number; time_period_seconds: number; egg_id: number | null };

function Page() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [plans, setPlans] = useState<FreePlan[]>([]);
  const [planId, setPlanId] = useState("");
  const [name, setName] = useState("");
  const [eggId, setEggId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("free_plans").select("*").eq("active", true).then(({ data }) => setPlans((data ?? []) as FreePlan[]));
  }, []);

  const create = async () => {
    if (!user || !planId || !name) return toast.error("Fill all fields");
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    setBusy(true);
    const expires = new Date(Date.now() + plan.time_period_seconds * 1000).toISOString();
    const finalEgg = eggId ? Number(eggId) : plan.egg_id;
    let pteroId: number | null = null;
    try {
      const r = await fetch("/api/public/pterodactyl/create-server", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, name, ram_mb: plan.ram_mb, cpu_pct: plan.cpu_pct, disk_mb: plan.disk_mb, egg_id: finalEgg }),
      });
      const j = await r.json();
      if (j?.pterodactyl_server_id) pteroId = j.pterodactyl_server_id;
    } catch {}
    const { error } = await supabase.from("servers").insert([{
      user_id: user.id, name, type: plan.type as "MINECRAFT" | "PYTHON" | "NODEJS" | "VPS" | "OTHER",
      ram_mb: plan.ram_mb, cpu_pct: plan.cpu_pct, disk_mb: plan.disk_mb,
      pterodactyl_server_id: pteroId, egg_id: finalEgg, is_free: true, expires_at: expires,
    }]);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Server created! Login on the panel with the same credentials.");
    nav({ to: "/free" });
  };

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Create a free server</h1>
      <div className="mt-6 space-y-4">
        <div><Label>Plan</Label>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={planId} onChange={(e) => setPlanId(e.target.value)}>
            <option value="">— select —</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.type}) — {p.ram_mb}MB / {p.cpu_pct}% / {p.disk_mb}MB</option>)}
          </select>
        </div>
        <div><Label>Server name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Egg ID (override)</Label><Input value={eggId} onChange={(e) => setEggId(e.target.value)} placeholder="optional" /></div>
        <Button className="w-full" disabled={busy} onClick={create}>{busy ? "Creating…" : "Create server"}</Button>
      </div>
    </div>
  );
}