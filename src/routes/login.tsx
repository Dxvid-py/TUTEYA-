import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { homeForRole, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Tuteya" },
      { name: "description", content: "Accede a tu panel de estudiante, tutor o administrador en Tuteya." },
      { property: "og:title", content: "Iniciar sesión — Tuteya" },
      { property: "og:description", content: "Accede a tu cuenta de Tuteya." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, primaryRole, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resetMode, setResetMode] = useState(false);

  useEffect(() => {
    if (!loading && user && primaryRole) navigate({ to: homeForRole(primaryRole), replace: true });
  }, [user, primaryRole, loading, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    if (resetMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setBusy(false);
      if (error) { setError(error.message); return; }
      toast.success("Si el correo existe, te enviamos un enlace para restablecer tu contraseña.");
      { setResetMode(false); return; }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error.message);
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl font-extrabold">{resetMode ? "Recuperar contraseña" : "Bienvenido de nuevo"}</h1>
      <p className="mt-2 text-muted-foreground">
        {resetMode ? "Te enviaremos un enlace a tu correo." : "Entra a tu cuenta para continuar aprendiendo."}
      </p>
      <form onSubmit={submit} className={resetMode ? "mt-8 space-y-4" : "space-y-4"} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" />
        </div>
        {!resetMode && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <button type="button" onClick={() => setResetMode(true)} className="text-xs font-semibold text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl" />
          </div>
        )}
        {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy || !email || (!resetMode && !password)} className="h-11 w-full rounded-xl">
          {busy && <Loader2 className="size-4 animate-spin" />}
          {resetMode ? "Enviar enlace" : "Iniciar sesión"}
        </Button>
        {resetMode && (
          <button type="button" onClick={() => setResetMode(false)} className="w-full text-sm text-muted-foreground hover:text-foreground">
            Volver
          </button>
        )}
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta? <Link to="/registro" className="font-semibold text-primary hover:underline">Crear cuenta</Link>
      </p>
    </AuthLayout>
  );
}
