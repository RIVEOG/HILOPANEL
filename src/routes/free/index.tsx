import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/free/")({ component: ServersList });

type Server = { id: string; name: string; type: string; ram_mb: number; cpu_pct: number; disk_mb: number; expires_at: string | null; suspended: boolean; pterodactyl_server_id: number | null };

function ServersList() {
  const { user } = useAuth();
  const [servers, setServers] = useState<Server[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("servers").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setServers((data ?? []) as Server[]);
  };
  useEffect(() => { load(); }, [user]);

  const del = async (s: Server) => {
    if (!confirm(`Delete ${s.name}?`)) return;
    if (s.pterodactyl_server_id) {
      try { await fetch("/api/public/pterodactyl/delete-server", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pterodactyl_server_id: s.pterodactyl_server_id }) }); } catch {}
    }
    await supabase.from("servers").delete().eq("id", s.id);
    toast.success("Server deleted");
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Your servers</h1>
      {servers.length === 0 && <p className="text-sm text-muted-foreground">You don't have any servers yet. Create one from the Create server tab.</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {servers.map((s) => (
          <div key={s.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.type} · {s.ram_mb}MB · {s.cpu_pct}% · {s.disk_mb}MB</div>
                {s.expires_at && <div className="mt-1 text-xs text-muted-foreground">Expires {new Date(s.expires_at).toLocaleString()}</div>}
                {s.suspended && <div className="mt-1 text-xs text-destructive">Suspended</div>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => del(s)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}