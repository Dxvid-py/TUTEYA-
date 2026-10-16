import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap, Hourglass, Tags, Users } from "lucide-react";
import { Card, PageTitle, RoleGate, Stat } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Administración — Tuteya" }, { name: "description", content: "Panel de administración de Tuteya." }] }),
  component: () => (
    <RoleGate role="admin">
      <AdminHome />
    </RoleGate>
  ),
});

function AdminHome() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const c = async (t: "profiles" | "tutor_profiles" | "bookings" | "subjects", f?: (q: any) => any) => {
        let q = supabase.from(t).select("*", { count: "exact", head: true });
        if (f) q = f(q);
        return (await q).count ?? 0;
      };
      const [users, tutors, pending, bookings, subjects] = await Promise.all([
        c("profiles"),
        c("tutor_profiles", (q) => q.eq("is_approved", true)),
        c("tutor_profiles", (q) => q.eq("is_approved", false)),
        c("bookings"),
        c("subjects"),
      ]);
      return { users, tutors, pending, bookings, subjects };
    },
  });
  const links = [
    { to: "/admin/usuarios", icon: Users, t: "Usuarios y roles", d: "Asigna roles de administrador, tutor o estudiante." },
    { to: "/admin/tutores", icon: GraduationCap, t: "Aprobar tutores", d: "Revisa y publica perfiles profesionales." },
    { to: "/admin/materias", icon: Tags, t: "Materias", d: "Crea, renombra o elimina materias del catálogo." },
    { to: "/admin/reservas", icon: BookOpen, t: "Reservas", d: "Supervisa todas las tutorías de la plataforma." },
  ] as const;
  return (
    <>
      <PageTitle title="Administración" text="Control general de la plataforma Tuteya." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Usuarios" value={data?.users ?? "…"} />
        <Stat icon={GraduationCap} label="Tutores publicados" value={data?.tutors ?? "…"} />
        <Stat icon={Hourglass} label="Tutores por aprobar" value={data?.pending ?? "…"} />
        <Stat icon={BookOpen} label="Reservas totales" value={data?.bookings ?? "…"} />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {links.map((l) => (
          <Link key={l.to} to={l.to}>
            <Card className="flex h-full items-start gap-4 transition-shadow hover:shadow-lift">
              <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><l.icon className="size-5" /></div>
              <div><p className="font-bold">{l.t}</p><p className="text-sm text-muted-foreground">{l.d}</p></div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
