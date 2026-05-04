import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Coins } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getPublicConfig } from "@/server/config.functions";

export const Route = createFileRoute("/free/afk")({ component: Page });

function Page() {
  const { user } = useAuth();
  const [coins, setCoins] = useState(0);
  const [perMin, setPerMin] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const ref = useRef<number | null>(null);
  const loadCfg = useServerFn(getPublicConfig);

  useEffect(() => {
    if (!user) return;
    loadCfg().then((c) => setPerMin(c?.coins_per_minute ?? 1)).catch(() => {});
    supabase.from("user_resources").select("coins").eq("user_id", user.id).maybeSingle().then(({ data }) => setCoins(data?.coins ?? 0));
  }, [user, loadCfg]);

  useEffect(() => {
    ref.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, []);

  // Every 60 seconds award coins
  useEffect(() => {
    if (!user) return;
    if (seconds > 0 && seconds % 60 === 0) {
      const next = coins + perMin;
      setCoins(next);
      supabase.from("user_resources").update({ coins: next, last_afk_at: new Date().toISOString() }).eq("user_id", user.id).then(({ error }) => {
        if (error) toast.error(error.message);
      });
    }
  }, [seconds, user, coins, perMin]);

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-center">
      <Coins className="mx-auto h-12 w-12 text-primary" />
      <h1 className="mt-4 text-2xl font-semibold">AFK Earn</h1>
      <p className="mt-1 text-sm text-muted-foreground">Keep this tab open. You earn {perMin} coin{perMin === 1 ? "" : "s"} per minute.</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border p-4"><div className="text-xs uppercase text-muted-foreground">Coins</div><div className="mt-1 text-3xl font-semibold">{coins}</div></div>
        <div className="rounded-lg border border-border p-4"><div className="text-xs uppercase text-muted-foreground">Session</div><div className="mt-1 text-3xl font-semibold">{Math.floor(seconds / 60)}m {seconds % 60}s</div></div>
      </div>
    </div>
  );
}