import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getPublicConfig } from "@/server/config.functions";

export const Route = createFileRoute("/free/shop")({ component: Shop });

function Shop() {
  const { user } = useAuth();
  const [s, setS] = useState<{ cost_ram_per_gb: number; cost_cpu_per_core: number; cost_disk_per_gb: number; cost_server_slot: number } | null>(null);
  const [r, setR] = useState<{ coins: number; ram_mb: number; cpu_pct: number; disk_mb: number; server_slots: number } | null>(null);
  const loadCfg = useServerFn(getPublicConfig);

  const load = async () => {
    const cfg = await loadCfg();
    setS(cfg.shop_costs);
    if (user) {
      const { data } = await supabase.from("user_resources").select("coins, ram_mb, cpu_pct, disk_mb, server_slots").eq("user_id", user.id).maybeSingle();
      setR(data);
    }
  };
  useEffect(() => { load(); }, [user]);

  const buy = async (item: "ram" | "cpu" | "disk" | "slot") => {
    if (!user || !s || !r) return;
    const cost = item === "ram" ? s.cost_ram_per_gb : item === "cpu" ? s.cost_cpu_per_core : item === "disk" ? s.cost_disk_per_gb : s.cost_server_slot;
    if (r.coins < cost) return toast.error("Not enough coins");
    const update = { coins: r.coins - cost, ram_mb: r.ram_mb, cpu_pct: r.cpu_pct, disk_mb: r.disk_mb, server_slots: r.server_slots };
    if (item === "ram") update.ram_mb += 1024;
    if (item === "cpu") update.cpu_pct += 100;
    if (item === "disk") update.disk_mb += 1024;
    if (item === "slot") update.server_slots += 1;
    const { error } = await supabase.from("user_resources").update(update).eq("user_id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Purchased!");
    load();
  };

  if (!s || !r) return <div className="text-muted-foreground">Loading…</div>;

  const items = [
    { key: "ram" as const, label: "+1 GB RAM", cost: s.cost_ram_per_gb },
    { key: "cpu" as const, label: "+100% CPU", cost: s.cost_cpu_per_core },
    { key: "disk" as const, label: "+1 GB Disk", cost: s.cost_disk_per_gb },
    { key: "slot" as const, label: "+1 Server slot", cost: s.cost_server_slot },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Shop</h1>
      <p className="text-sm text-muted-foreground">You have <span className="font-semibold text-foreground">{r.coins}</span> coins.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((it) => (
          <div key={it.key} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div><div className="font-medium">{it.label}</div><div className="text-xs text-muted-foreground">{it.cost} coins</div></div>
            <Button onClick={() => buy(it.key)} disabled={r.coins < it.cost}>Buy</Button>
          </div>
        ))}
      </div>
    </div>
  );
}