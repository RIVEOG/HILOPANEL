import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin/users")({ component: Page });

type Profile = { id: string; username: string; email: string };
type Role = { user_id: string; role: "admin" | "user" };

function Page() {
  const { user } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, boolean>>({});

  const load = async () => {
    const { data: profs } = await supabase.from("profiles").select("id, username, email").order("created_at", { ascending: false });
    const { data: rs } = await supabase.from("user_roles").select("user_id, role");
    setUsers((profs ?? []) as Profile[]);
    const map: Record<string, boolean> = {};
    (rs as Role[] | null ?? []).forEach((r) => { if (r.role === "admin") map[r.user_id] = true; });
    setRoles(map);
  };
  useEffect(() => { load(); }, []);

  const toggleAdmin = async (uid: string, isAdminNow: boolean) => {
    if (uid === user?.id) return toast.error("You can't change your own role here");
    if (isAdminNow) {
      await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
    } else {
      await supabase.from("user_roles").insert([{ user_id: uid, role: "admin" }]);
    }
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Promote or demote admins.</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Username</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isA = !!roles[u.id];
              return (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-3 font-medium">{u.username}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3">{isA ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">admin</span> : <span className="text-muted-foreground">user</span>}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant={isA ? "outline" : "default"} onClick={() => toggleAdmin(u.id, isA)} disabled={u.id === user?.id}>
                      {isA ? "Revoke admin" : "Make admin"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}