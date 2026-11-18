import React, { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  X,
  LogOut,
  UserCheck,
  BookOpen,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { supabase } from "../integrations/supabase/client";

interface ActiveDemoUser {
  email: string;
  role: "student" | "tutor";
  fullName: string;
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<ActiveDemoUser | null>(null);
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
          : "bg-background/65 backdrop-blur-md border-b border-border/40 py-3.5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo original Tuteya */}
        <Link
          to={"/" as any}
          className="group flex items-center gap-2.5 focus:outline-none"
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

        {/* Navegación Desktop dinámica */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/70 bg-muted/60 p-1">
          {navItems.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-background text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Controles derecha */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                to={(currentUser.role === "tutor" ? "/profesor" : "/estudiante") as any}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              >
                {currentUser.role === "tutor" ? (
                  <BookOpen className="h-3.5 w-3.5" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5" />
                )}
                <span>
                  {currentUser.role === "tutor" ? "Panel Profe" : "Panel Estudiante"} ·{" "}
                  {currentUser.fullName.split(" ")[0]}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Salir
              </button>
            </div>
          ) : (
            <>
              <Link
                to={"/login" as any}
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Ingresar
              </Link>
              <Link
                to={"/login" as any}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-800 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Demo Profe / Estudiante
              </Link>
            </>
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
            <hr className="my-1 border-border" />
            {currentUser ? (
              <>
                <Link
                  to={(currentUser.role === "tutor" ? "/profesor" : "/estudiante") as any}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
                >
                  Mi panel ({currentUser.role === "tutor" ? "Profesor" : "Estudiante"})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl px-3 py-2 text-left text-sm font-medium text-destructive"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                to={"/login" as any}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-emerald-700 px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Acceso Rápido Demo (Profe / Estudiante)
              </Link>
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
            © {new Date().getFullYear()} Tuteya Colombia · Tarifas en COP
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link to={"/tutores" as any} className="hover:text-foreground transition-colors">
            Tutores
          </Link>
          <Link to={"/como-funciona" as any} className="hover:text-foreground transition-colors">
            Cómo funciona
          </Link>
          <Link to={"/ensenar" as any} className="hover:text-foreground transition-colors">
            Enseñar
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
