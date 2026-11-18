import React, { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  X,
  LogOut,
  UserCheck,
  BookOpen,
  Video,
  Sun,
  Moon,
  Loader2,
} from "lucide-react";
import { supabase } from "../integrations/supabase/client";

interface ActiveDemoUser {
  email: string;
  role: "student" | "tutor";
  fullName: string;
}

export const DEMO_CREDENTIALS = {
  student: {
    email: "estudiante.demo@tuteya.co",
    password: "TuteyaDemo2026!",
    route: "/estudiante",
    fullName: "Valeria Gómez",
  },
  tutor: {
    email: "profe.demo@tuteya.co",
    password: "TuteyaDemo2026!",
    route: "/tutor",
    fullName: "Prof. Carlos Mendoza",
  },
} as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<ActiveDemoUser | null>(null);
  const [switchingRole, setSwitchingRole] = useState<"student" | "tutor" | null>(null);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
  }

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!mounted) return;
      if (user) {
        const metaRole =
          (user.user_metadata?.role as "student" | "tutor") ||
          (user.email?.includes("profe") ? "tutor" : "student");
        setCurrentUser({
          email: user.email || "",
          role: metaRole,
          fullName:
            user.user_metadata?.full_name ||
            (metaRole === "tutor" ? "Prof. Carlos Mendoza" : "Valeria Gómez"),
        });
      } else {
        setCurrentUser(null);
      }
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user) {
        const metaRole =
          (user.user_metadata?.role as "student" | "tutor") ||
          (user.email?.includes("profe") ? "tutor" : "student");
        setCurrentUser({
          email: user.email || "",
          role: metaRole,
          fullName:
            user.user_metadata?.full_name ||
            (metaRole === "tutor" ? "Prof. Carlos Mendoza" : "Valeria Gómez"),
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleDirectProfileAccess(role: "student" | "tutor") {
    setSwitchingRole(role);
    setMobileOpen(false);
    const target = DEMO_CREDENTIALS[role];

    try {
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signInWithPassword({
        email: target.email,
        password: target.password,
      });

      if (error) {
        navigate({ to: "/login" as any });
        return;
      }

      navigate({ to: target.route as any });
    } catch {
      navigate({ to: "/login" as any });
    } finally {
      setSwitchingRole(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setMobileOpen(false);
    navigate({ to: "/" as any });
  }

  const navItems = [
    { to: "/tutores", label: "Buscar tutores" },
    { to: "/como-funciona", label: "Cómo funciona" },
    { to: "/ensenar", label: "Enseñar" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-lg border-b border-border/80 shadow-sm py-2.5"
          : "bg-background/70 backdrop-blur-md border-b border-border/40 py-3.5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo original Tuteya */}
        <Link
          to={"/" as any}
          className="group flex items-center gap-2.5 shrink-0 focus:outline-none"
        >
          <img
            src="/tuteya-mark.svg"
            alt="Tuteya"
            className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
            Tuteya
          </span>
        </Link>

        {/* Navegación central */}
        <nav className="hidden xl:flex items-center gap-1 rounded-full border border-border/70 bg-muted/60 p-1">
          {navItems.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-background text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            to={"/clase-demo" as any}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all ${
              pathname === "/clase-demo"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            Clase en Vivo
          </Link>
        </nav>

        {/* Acceso Directo a Perfiles + Sesión */}
        <div className="hidden md:flex items-center gap-2">
          {/* Botón directo Clase Demo */}
          <Link
            to={"/clase-demo" as any}
            className="xl:hidden inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            <Video className="h-3.5 w-3.5" />
            Clase Demo
          </Link>

          {/* Acceso directo 1 clic Estudiante */}
          <button
            type="button"
            disabled={switchingRole !== null}
            onClick={() => handleDirectProfileAccess("student")}
            title="Entrar directo al perfil de Estudiante Demo"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              currentUser?.role === "student"
                ? "border-emerald-600 bg-emerald-600/15 text-emerald-800 dark:text-emerald-300"
                : "border-border bg-background text-foreground hover:border-emerald-600/50 hover:text-emerald-700"
            }`}
          >
            {switchingRole === "student" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" />
            ) : (
              <UserCheck className="h-3.5 w-3.5 text-emerald-700" />
            )}
            <span>Estudiante</span>
          </button>

          {/* Acceso directo 1 clic Profesor */}
          <button
            type="button"
            disabled={switchingRole !== null}
            onClick={() => handleDirectProfileAccess("tutor")}
            title="Entrar directo al perfil de Profesor Demo"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              currentUser?.role === "tutor"
                ? "bg-emerald-800 text-white ring-2 ring-amber-400/60"
                : "bg-emerald-700 text-white hover:bg-emerald-800"
            }`}
          >
            {switchingRole === "tutor" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <BookOpen className="h-3.5 w-3.5 text-amber-300" />
            )}
            <span>Profesor</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {currentUser ? (
            <button
              type="button"
              onClick={handleLogout}
              title={`Cerrar sesión (${currentUser.fullName})`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link
              to={"/login" as any}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ingresar
            </Link>
          )}
        </div>

        {/* Botón móvil */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Abrir menú"
          className="inline-flex items-center justify-center rounded-xl border border-border bg-background p-2 text-foreground md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menú móvil */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 shadow-md md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to as any}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={"/clase-demo" as any}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-xl bg-amber-500/15 px-3 py-2 text-sm font-semibold text-amber-800 dark:text-amber-300"
            >
              <Video className="h-4 w-4" />
              Entrar a Clase Virtual Demo en Vivo
            </Link>
            <hr className="my-1 border-border" />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDirectProfileAccess("student")}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600/40 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
              >
                <UserCheck className="h-4 w-4" />
                Perfil Estudiante
              </button>
              <button
                type="button"
                onClick={() => handleDirectProfileAccess("tutor")}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-semibold text-white"
              >
                <BookOpen className="h-4 w-4 text-amber-300" />
                Perfil Profesor
              </button>
            </div>
            {currentUser && (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 rounded-xl px-3 py-2 text-left text-xs font-medium text-destructive"
              >
                Cerrar sesión ({currentUser.fullName})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background py-8 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <img src="/tuteya-mark.svg" alt="Tuteya" className="h-6 w-6 object-contain" />
          <span className="font-medium text-foreground">
            © {new Date().getFullYear()} Tuteya Colombia · Precios en COP
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link to={"/tutores" as any} className="hover:text-foreground transition-colors">
            Tutores
          </Link>
          <Link to={"/clase-demo" as any} className="hover:text-foreground transition-colors">
            Clase Virtual Demo
          </Link>
          <Link to={"/como-funciona" as any} className="hover:text-foreground transition-colors">
            Cómo funciona
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export const SiteChrome = PublicLayout;
export default PublicLayout;
