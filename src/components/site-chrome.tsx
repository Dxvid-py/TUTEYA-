import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo, ThemeToggle } from "@/components/brand";
import { homeForRole, useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { user, primaryRole } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = [
    { to: "/tutores", label: "Encontrar tutor" },
    { to: "/como-funciona", label: "Cómo funciona" },
    { to: "/ensenar", label: "Enseñar en Tuteya" },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <Button onClick={() => navigate({ to: homeForRole(primaryRole) })} className="rounded-full">
              <LayoutDashboard className="size-4" /> Mi panel
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="rounded-full">
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/registro">Crear cuenta</Link>
              </Button>
            </>
          )}
        </div>
        <button
          className="grid size-10 place-items-center rounded-full border md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-background px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-medium hover:bg-muted">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between">
            <ThemeToggle />
            {user ? (
              <Button asChild className="rounded-full">
                <Link to={homeForRole(primaryRole)}>Mi panel</Link>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" asChild className="rounded-full">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link to="/registro">Crear cuenta</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Aprender nos conecta. Tuteya une a estudiantes y tutores para clases virtuales o presenciales.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold">Plataforma</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/tutores" className="hover:text-foreground">Buscar tutores</Link></li>
            <li><Link to="/como-funciona" className="hover:text-foreground">Cómo funciona</Link></li>
            <li><Link to="/ensenar" className="hover:text-foreground">Enseñar en Tuteya</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold">Cuenta</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-foreground">Iniciar sesión</Link></li>
            <li><Link to="/registro" className="hover:text-foreground">Crear cuenta</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Tuteya · Tu tutor, a un clic.
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
