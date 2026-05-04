import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl, data: { username } },
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    // Try to create a Pterodactyl user (best-effort, ignore errors silently)
    if (data.user) {
      try {
        await fetch("/api/public/pterodactyl/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: data.user.id, email, username, password }),
        });
      } catch {}
    }
    setLoading(false);
    toast.success("Account created! Use the same credentials on the panel.");
    nav({ to: "/free" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Same credentials work on the Pterodactyl panel.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2"><Label htmlFor="u">Username</Label><Input id="u" required value={username} onChange={(e) => setUsername(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="e">Email</Label><Input id="e" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="p">Password</Label><Input id="p" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">Have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}