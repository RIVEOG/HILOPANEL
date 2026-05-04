import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/links")({ component: Page });

type LinkRow = { id: string; label: string; url: string; icon: string | null; sort_order: number };

function Page() {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [form, setForm] = useState({ label: "", url: "", icon: "" });

  const load = async () => {
    const { data } = await supabase.from("links").select("*").order("sort_order");
    setLinks((data ?? []) as LinkRow[]);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.label || !form.url) return toast.error("Label and URL required");
    const { error } = await supabase.from("links").insert([{ label: form.label, url: form.url, icon: form.icon || null }]);
    if (error) return toast.error(error.message);
    setForm({ label: "", url: "", icon: "" });
    load();
  };

  const del = async (id: string) => {
    await supabase.from("links").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Links</h1>
        <p className="mt-1 text-sm text-muted-foreground">Shown on /free and /paid pages.</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div><Label>Label</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Discord" /></div>
          <div><Label>URL</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
          <div><Label>Icon (lucide name)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="optional" /></div>
        </div>
        <div className="mt-4 flex justify-end"><Button onClick={add}>Add link</Button></div>
      </div>
      <div className="space-y-3">
        {links.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <div className="font-medium">{l.label}</div>
              <div className="text-sm text-muted-foreground">{l.url}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => del(l.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {links.length === 0 && <p className="text-sm text-muted-foreground">No links yet.</p>}
      </div>
    </div>
  );
}