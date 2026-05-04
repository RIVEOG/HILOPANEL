import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";
import { Settings, Gift, CreditCard, LinkIcon, Users } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

const items = [
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/freeplans", label: "Free Plans", icon: Gift },
  { to: "/admin/paidplans", label: "Paid Plans", icon: CreditCard },
  { to: "/admin/links", label: "Links", icon: LinkIcon },
  { to: "/admin/users", label: "Users", icon: Users },
] as const;

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/login" });
    else if (!isAdmin) nav({ to: "/free" });
  }, [user, isAdmin, loading, nav]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-16 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto grid gap-8 px-4 py-8 md:grid-cols-[220px_1fr]">
        <aside className="space-y-1">
          <h2 className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Admin</h2>
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground font-medium" }}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          ))}
        </aside>
        <main><Outlet /></main>
      </div>
    </div>
  );
}