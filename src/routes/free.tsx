import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";
import { Coins, Cpu, HardDrive, MemoryStick, Plus, ShoppingBag, Server } from "lucide-react";

export const Route = createFileRoute("/free")({ component: FreeLayout });

function FreeLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [res, setRes] = useState<{ coins: number; ram_mb: number; cpu_pct: number; disk_mb: number; server_slots: number } | null>(null);
  const [links, setLinks] = useState<{ id: string; label: string; url: string }[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) { nav({ to: "/login" }); return; }
    supabase.from("user_resources").select("coins, ram_mb, cpu_pct, disk_mb, server_slots").eq("user_id", user.id).maybeSingle().then(({ data }) => setRes(data));
    supabase.from("links").select("id, label, url").order("sort_order").then(({ data }) => setLinks(data ?? []));
  }, [user, loading, nav]);

  if (loading || !user) return <div className="min-h-screen bg-background"><SiteHeader /><div className="container mx-auto px-4 py-16 text-muted-foreground">Loading…</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        {res && (
          <div className="grid gap-3 md:grid-cols-5">
            <Stat icon={Coins} label="Coins" value={res.coins} />
            <Stat icon={MemoryStick} label="RAM" value={`${res.ram_mb} MB`} />
            <Stat icon={Cpu} label="CPU" value={`${res.cpu_pct}%`} />
            <Stat icon={HardDrive} label="Disk" value={`${res.disk_mb} MB`} />
            <Stat icon={Server} label="Slots" value={res.server_slots} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <NavBtn to="/free" icon={Server}>Servers</NavBtn>
          <NavBtn to="/free/creation" icon={Plus}>Create server</NavBtn>
          <NavBtn to="/free/shop" icon={ShoppingBag}>Shop</NavBtn>
          <NavBtn to="/free/afk" icon={Coins}>AFK earn</NavBtn>
        </div>

        <div className="mt-6"><Outlet /></div>

        {links.length > 0 && (
          <div className="mt-12 border-t border-border pt-6">
            <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Community</p>
            <div className="flex flex-wrap gap-3">
              {links.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-card px-4 py-1.5 text-sm hover:border-primary/40">{l.label}</a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between text-muted-foreground"><span className="text-xs uppercase tracking-wider">{label}</span><Icon className="h-4 w-4" /></div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function NavBtn({ to, icon: Icon, children }: { to: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:border-primary/40" activeOptions={{ exact: true }} activeProps={{ className: "inline-flex items-center gap-2 rounded-md border border-primary/40 bg-accent px-3 py-2 text-sm" }}>
      <Icon className="h-4 w-4" />{children}
    </Link>
  );
}