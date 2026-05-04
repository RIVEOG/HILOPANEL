import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/paid")({ component: Layout });

function Layout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [user, loading, nav]);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground">
          <Link to="/paid" className="hover:text-foreground">All</Link>
          {(["MINECRAFT", "PYTHON", "NODEJS", "VPS", "OTHER"] as const).map((t) => (
            <Link key={t} to="/paid/$type" params={{ type: t }} className="hover:text-foreground">{t}</Link>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  );
}