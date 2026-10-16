import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, GraduationCap, Loader2, MailCheck } from "lucide-react";
import { z } from "zod";
import { AuthLayout, GoogleButton } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ rol: z.enum(["estudiante", "tutor"]).optional() });

export const Route = createFileRoute("/registro")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Crear cuenta — Tuteya" },
      { name: "description", content: "Regístrate en Tuteya como estudiante o como tutor." },
      { property: "og:title", content: "Crear cuenta — Tuteya" },
      { property: "og:description", content: "Únete a Tuteya como estudiante o tutor." },
    ],
  }),
  component: RegisterPage,
});

const formSchema = z.object({
  full_name: z.string().trim().min(3, "Escribe tu nombre completo").max(80),
  email: z.string().trim().email("Correo no válido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
});

function RegisterPage() {
  const { rol } = Route.useSearch();
  const [role, setRole] = useState<"student" | "tutor">(rol === "tutor" ? "tutor" : "student");
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      { setErrors(errs); return; }
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin + "/login",
        data: { full_name: parsed.data.full_name, role },
      },
    });
    setBusy(false);
    if (error) { setServerError(error.message); return; }
    setSent(true);
  }

  if (sent)
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
            <MailCheck className="size-6" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold">Revisa tu correo</h1>
          <p className="mt-2 text-muted-foreground">
            Te enviamos un enlace a <strong>{form.email}</strong> para confirmar tu cuenta.
          </p>
          <Button asChild variant="outline" className="mt-8 rounded-full"><Link to="/login">Ir a iniciar sesión</Link></Button>
        </div>
      </AuthLayout>
    );

  const field = (k: keyof typeof form, label: string, type = "text", ac?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input
        id={k}
        type={type}
        autoComplete={ac}
        value={form[k]}
        aria-invalid={!!errors[k]}
        onChange={(e) => setForm({ ...form, [k]: e.target.value })}
        className="h-11 rounded-xl"
      />
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <AuthLayout>
      <h1 className="text-3xl font-extrabold">Crea tu cuenta</h1>
      <p className="mt-2 text-muted-foreground">¿Cómo quieres usar Tuteya?</p>
      <div role="radiogroup" className="mt-6 grid grid-cols-2 gap-3">
        {[
          { v: "student" as const, icon: BookOpen, t: "Quiero aprender", d: "Cuenta de estudiante" },
          { v: "tutor" as const, icon: GraduationCap, t: "Quiero enseñar", d: "Cuenta de tutor" },
        ].map((o) => (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={role === o.v}
            onClick={() => setRole(o.v)}
            className={cn(
              "rounded-2xl border-2 p-4 text-left transition-all",
              role === o.v ? "border-primary bg-secondary/60" : "border-border hover:border-primary/40",
            )}
          >
            <o.icon className={cn("size-5", role === o.v ? "text-primary" : "text-muted-foreground")} />
            <p className="mt-3 text-sm font-bold">{o.t}</p>
            <p className="text-xs text-muted-foreground">{o.d}</p>
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        {field("full_name", "Nombre completo", "text", "name")}
        {field("email", "Correo electrónico", "email", "email")}
        {field("password", "Contraseña", "password", "new-password")}
        {role === "tutor" && (
          <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
            Después de confirmar tu correo completarás tu perfil profesional (materias, tarifa y modalidad). Un administrador lo revisará antes de publicarlo.
          </p>
        )}
        {serverError && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>}
        <Button type="submit" disabled={busy} className="h-11 w-full rounded-xl">
          {busy && <Loader2 className="size-4 animate-spin" />} Crear cuenta
        </Button>
      </form>
      {role === "student" && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> o <div className="h-px flex-1 bg-border" />
          </div>
          <GoogleButton label="Registrarme con Google" />
        </>
      )}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-primary hover:underline">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
}
