import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { PageTitle, RoleGate } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  head: () => ({ meta: [{ title: "Usuarios y roles — Tuteya" }, { name: "description", content: "Gestión de roles." }] }),
  component: () => (
    <RoleGate role="admin">
      <Users />
    </RoleGate>
  ),
});

const ROLES: { v: AppRole; l: string }[] = [
  { v: "student", l: "Estudiante" },
  { v: "tutor", l: "Tutor" },
  { v: "admin", l: "Admin" },
];

function Users() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, city, created_at").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      return (p ?? []).map((x) => ({ ...x, roles: (r ?? []).filter((y) => y.user_id === x.id).map((y) => y.role as AppRole) }));
    },
  });

  async function toggle(uid: string, role: AppRole, has: boolean) {
    if (uid === user?.id && role === "admin" && has) { toast.error("No puedes quitarte tu propio rol de administrador."); return; }
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
      if (error) { toast.error(error.message); return; }
      if (role === "tutor") await supabase.from("tutor_profiles").upsert({ user_id: uid }, { onConflict: "user_id", ignoreDuplicates: true });
    }
    toast.success("Roles actualizados");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  const list = data.filter((u) => u.full_name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageTitle title="Usuarios y roles" text="Activa o desactiva roles por usuario. Los cambios aplican al siguiente inicio de sesión o recarga." />
      <div className="mb-4 flex max-w-sm items-center gap-2 rounded-xl border bg-card px-3">
        <Search className="size-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre" className="border-0 shadow-none focus-visible:ring-0" />
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Nombre</TableHead><TableHead>Alta</TableHead><TableHead>Roles</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={3}>Cargando…</TableCell></TableRow>}
            {list.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-semibold">{u.full_name}{u.id === user?.id && <span className="ml-2 text-xs text-muted-foreground">(tú)</span>}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString("es")}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {ROLES.map((r) => {
                      const has = u.roles.includes(r.v);
                      return (
                        <button
                          key={r.v}
                          aria-pressed={has}
                          onClick={() => toggle(u.id, r.v, has)}
                          className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-colors", has ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:border-primary")}
                        >
                          {r.l}
                        </button>
                      );
                    })}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
