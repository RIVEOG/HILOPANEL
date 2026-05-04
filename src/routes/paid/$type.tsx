import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlanCard } from "./index";

export const Route = createFileRoute("/paid/$type")({ component: Page });

type Plan = { id: string; name: string; type: string; ram_mb: number; cpu_pct: number; disk_mb: number; price_cents: number; payment_method: string; discord_redirect: string | null };

function Page() {
  const { type } = Route.useParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  useEffect(() => {
    supabase.from("paid_plans").select("*").eq("active", true).eq("type", type as "MINECRAFT" | "PYTHON" | "NODEJS" | "VPS" | "OTHER").then(({ data }) => setPlans((data ?? []) as Plan[]));
  }, [type]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{type} plans</h1>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => <PlanCard key={p.id} p={p} />)}
        {plans.length === 0 && <p className="text-sm text-muted-foreground">No {type} plans yet.</p>}
      </div>
    </div>
  );
}