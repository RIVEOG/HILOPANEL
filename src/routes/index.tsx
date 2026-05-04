import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Boxes, Coins, Cpu, Gauge, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [name, setName] = useState("Hilos");
  const [tagline, setTagline] = useState("Premium game & app hosting");

  useEffect(() => {
    supabase.from("settings").select("panel_name, panel_tagline").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data?.panel_name) setName(data.panel_name);
      if (data?.panel_tagline) setTagline(data.panel_tagline);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_60%)] opacity-60" />
          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                Better than Hexactyl. Built different.
              </div>
              <h1 className="mt-6 text-5xl font-semibold tracking-tight md:text-7xl">
                {name}
                <span className="block bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
                  {tagline}
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                Spin up Minecraft, Python, Node.js or VPS instances in seconds. Free tier with AFK coin earning, paid tiers with Stripe checkout.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link to="/signup"><Button size="lg" className="gap-2">Get started free <ArrowRight className="h-4 w-4" /></Button></Link>
                <Link to="/login"><Button size="lg" variant="outline">Login</Button></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto grid gap-6 px-4 py-16 md:grid-cols-3">
          {[
            { icon: Boxes, title: "Any egg, any stack", desc: "Pulls eggs straight from your Pterodactyl panel — Minecraft, Python, Node, anything." },
            { icon: Coins, title: "AFK economy", desc: "Users earn coins per minute and trade them for RAM, CPU, disk and server slots." },
            { icon: ShieldCheck, title: "Admin in control", desc: "Full panel: settings, plans, links, users, permissions. No JSON files needed." },
            { icon: Cpu, title: "Live provisioning", desc: "Server creation hits your Pterodactyl API directly. Login on the panel with the same credentials." },
            { icon: Gauge, title: "Auto-suspend", desc: "Free plans expire automatically — by minute, hour, day, week, month." },
            { icon: Sparkles, title: "Stripe & Discord", desc: "Charge through Stripe or redirect to Discord for VPS sales." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-sm">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {name}. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
