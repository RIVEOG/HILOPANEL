import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/paid/")({ component: Page });

type Plan = { id: string; name: string; type: string; ram_mb: number; cpu_pct: number; disk_mb: number; price_cents: number; payment_method: string; discord_redirect: string | null };

function Page() {
  const [plans, setPlans] = useState<Plan[]>([]);
  useEffect(() => { supabase.from("paid_plans").select("*").eq("active", true).then(({ data }) => setPlans((data ?? []) as Plan[])); }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Paid plans</h1>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => <PlanCard key={p.id} p={p} />)}
        {plans.length === 0 && <p className="text-sm text-muted-foreground">No paid plans yet.</p>}
      </div>
    </div>
  );
}

export function PlanCard({ p }: { p: Plan }) {
  const buy = async () => {
    if (p.payment_method === "discord" && p.discord_redirect) { window.location.href = p.discord_redirect; return; }
    const r = await fetch("/api/public/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paid_plan_id: p.id }) });
    const j = await r.json();
    if (j.url) window.location.href = j.url;
  };
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.type}</div>
      <div className="mt-1 text-lg font-semibold">{p.name}</div>
      <div className="mt-2 text-3xl font-bold">${(p.price_cents / 100).toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
      <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
        <li>{p.ram_mb} MB RAM</li><li>{p.cpu_pct}% CPU</li><li>{p.disk_mb} MB Disk</li>
      </ul>
      <button onClick={buy} className="mt-6 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Buy with {p.payment_method}</button>
    </div>
  );
}