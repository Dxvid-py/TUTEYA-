import React, { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  GraduationCap,
  Menu,
  X,
  Sparkles,
  LogOut,
  UserCheck,
  BookOpen,
  Zap,
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
  const [currentUser, setCurrentUser] = useState<ActiveDemoUser | null>(null);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    { to: "/", label: "Inicio" },
    { to: "/tutores", label: "Profesores" },
    { to: "/como-funciona", label: "Cómo funciona" },
    { to: "/ensenar", label: "Enseñar" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-header border-b border-slate-200/80 shadow-sm py-2.5"
          : "bg-white/70 backdrop-blur-md border-b border-transparent py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={"/" as any} className="group flex items-center gap-2.5 focus:outline-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Tuteya
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">
              Tutorías en Colombia
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 rounded-full bg-slate-100/90 p-1 border border-slate-200/70">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            to={"/tutores" as any}
            className="flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Tutor YA
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <Link
                to={(currentUser.role === "tutor" ? "/profesor" : "/estudiante") as any}
                className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                {currentUser.role === "tutor" ? (
                  <BookOpen className="h-3.5 w-3.5" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5" />
                )}
                <span>
                  {currentUser.role === "tutor" ? "Panel Profe" : "Panel Estudiante"}:{" "}
                  {currentUser.fullName.split(" ")[0]}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Salir
              </button>
            </div>
          ) : (
            <>
              <Link
                to={"/login" as any}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to={"/login" as any}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:shadow-lg hover:brightness-110 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                Probar Demo
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Abrir menú"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 lg:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden animate-fade-up">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to as any}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-1 border-slate-100" />
            {currentUser ? (
              <>
                <Link
                  to={(currentUser.role === "tutor" ? "/profesor" : "/estudiante") as any}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-700"
                >
                  Ir a mi panel ({currentUser.role === "tutor" ? "Profesor" : "Estudiante"})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-rose-50 px-3 py-2.5 text-left text-sm font-semibold text-rose-600"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                to={"/login" as any}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-blue-600 px-3 py-2.5 text-center text-sm font-bold text-white"
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
    <footer className="border-t border-slate-200 bg-white py-8 text-sm text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="font-medium text-slate-700">
          © {new Date().getFullYear()} Tuteya Colombia · Todos los precios en Pesos Colombianos (COP).
        </p>
        <div className="flex items-center gap-4">
          <Link to={"/tutores" as any} className="hover:text-blue-600 transition-colors">
            Profesores
          </Link>
          <Link to={"/como-funciona" as any} className="hover:text-blue-600 transition-colors">
            Cómo funciona
          </Link>
          <Link to={"/login" as any} className="hover:text-blue-600 transition-colors">
            Acceso Demo
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

// Exportaciones compatibles con el resto de rutas del proyecto
export const PublicLayout = SiteChrome;
export default SiteChrome;