import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
  Tags,
  ClipboardList,
} from "lucide-react";
import { Logo, ThemeToggle } from "@/components/brand";
import { useAuth, type AppRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Bell; search?: Record<string, string> };

const NAV: Record<AppRole, NavItem[]> = {
  student: [
    { to: "/estudiante", label: "Inicio", icon: LayoutDashboard },
    { to: "/tutores", label: "Buscar tutores", icon: Search },
    { to: "/reservas", label: "Mis reservas", icon: CalendarDays },
  ],
  tutor: [
    { to: "/tutor", label: "Inicio", icon: LayoutDashboard },
    { to: "/reservas", label: "Solicitudes y sesiones", icon: ClipboardList },
    { to: "/tutor/perfil", label: "Perfil profesional", icon: GraduationCap },
    { to: "/tutor/agenda", label: "Disponibilidad", icon: CalendarDays },
  ],
  admin: [
    { to: "/admin", label: "Resumen", icon: ShieldCheck },
    { to: "/admin/usuarios", label: "Usuarios y roles", icon: Users },
    { to: "/admin/tutores", label: "Aprobar tutores", icon: GraduationCap },
    { to: "/admin/materias", label: "Materias", icon: Tags },
    { to: "/admin/reservas", label: "Todas las reservas", icon: BookOpen },
  ],
};

const ROLE_LABEL: Record<AppRole, string> = { admin: "Administrador", tutor: "Tutor", student: "Estudiante" };

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, roles, fullName, primaryRole } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: unread = 0 } = useQuery({
    queryKey: ["unread", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
      return count ?? 0;
    },
  });

  const sections = (["admin", "tutor", "student"] as AppRole[]).filter((r) => roles.includes(r));

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo />
        <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú">
          <X className="size-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {sections.map((r) => (
          <div key={r}>
            {sections.length > 1 && (
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {ROLE_LABEL[r]}
              </p>
            )}
            <ul className="space-y-0.5">
              {NAV[r].map((item) => (
                <li key={item.to + r}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: true }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    activeProps={{ className: "!bg-secondary !text-secondary-foreground" }}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <ul className="space-y-0.5 border-t pt-4">
          <li>
            <Link
              to="/notificaciones"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              activeProps={{ className: "!bg-secondary !text-secondary-foreground" }}
            >
              <Bell className="size-4" /> Notificaciones
              {unread > 0 && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                  {unread}
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link
              to="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              activeProps={{ className: "!bg-secondary !text-secondary-foreground" }}
            >
              <Settings className="size-4" /> Mi cuenta
            </Link>
          </li>
        </ul>
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {initials(fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{fullName}</p>
            <p className="text-xs text-muted-foreground">{primaryRole ? ROLE_LABEL[primaryRole] : ""}</p>
          </div>
          <button
            onClick={signOut}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-sidebar md:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-sidebar shadow-xl">{sidebar}</aside>
        </div>
      )}
      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-lg sm:px-8">
          <button
            className="grid size-10 place-items-center rounded-full border md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="size-5" />
          </button>
          <div className="hidden text-sm text-muted-foreground md:block">Tu tutor, a un clic.</div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/notificaciones"
              className="relative grid size-9 place-items-center rounded-full border bg-card"
              aria-label="Notificaciones"
            >
              <Bell className="size-4" />
              {unread > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />}
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {text && <p className="mt-1 text-muted-foreground">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function RoleGate({ role, children }: { role: AppRole; children: React.ReactNode }) {
  const { hasRole, loading } = useAuth();
  if (loading) return <div className="h-40 animate-pulse rounded-2xl bg-muted" />;
  if (!hasRole(role))
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <ShieldCheck className="mx-auto size-8 text-muted-foreground" />
        <h2 className="mt-3 text-lg font-bold">No tienes acceso a esta sección</h2>
        <p className="mt-1 text-sm text-muted-foreground">Esta área es solo para {{ admin: "administradores", tutor: "tutores", student: "estudiantes" }[role]}.</p>
      </div>
    );
  return <>{children}</>;
}

export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border bg-card p-6 shadow-soft", className)} {...p} />;
}

export function Stat({ icon: Icon, label, value }: { icon: typeof Bell; label: string; value: number | string }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="grid size-12 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Icon className="size-5" /></div>
      <div>
        <p className="text-2xl font-extrabold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
