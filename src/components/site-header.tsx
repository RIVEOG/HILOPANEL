import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Server, LogOut } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getPublicConfig } from "@/server/config.functions";

export function SiteHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const [name, setName] = useState("Hilos");
  const loadCfg = useServerFn(getPublicConfig);

  useEffect(() => {
    loadCfg().then((c) => { if (c?.panel_name) setName(c.panel_name); }).catch(() => {});
  }, [loadCfg]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Server className="h-4 w-4" />
          </span>
          <span className="text-lg">{name}</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {user && (
            <>
              <Link to="/free" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "rounded-md px-3 py-2 text-sm text-foreground font-medium" }}>Free</Link>
              <Link to="/paid" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "rounded-md px-3 py-2 text-sm text-foreground font-medium" }}>Paid</Link>
              {isAdmin && (
                <Link to="/admin/settings" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Admin</Link>
              )}
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/signup"><Button size="sm">Get started</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}