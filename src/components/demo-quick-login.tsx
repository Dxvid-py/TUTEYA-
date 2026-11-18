import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, UserCheck, Video, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { DEMO_CREDENTIALS } from "./site-chrome";

export function DemoQuickLogin() {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState<"student" | "tutor" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loginAs(role: "student" | "tutor") {
    setError(null);
    setLoadingRole(role);
    const creds = DEMO_CREDENTIALS[role];

    try {
      await supabase.auth.signOut();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password,
      });

      if (authError) {
        setError(
          `No se pudo iniciar la cuenta demo (${authError.message}). Ejecuta primero el script SQL en Supabase.`
        );
        return;
      }

      navigate({ to: creds.route as any });
    } catch (err: any) {
      setError(err?.message || "Error al iniciar sesión demo.");
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-600/25 bg-emerald-500/5 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
        Acceso directo de prueba (1 clic)
      </p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          disabled={loadingRole !== null}
          onClick={() => loginAs("student")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground hover:border-emerald-600 hover:text-emerald-700 disabled:opacity-60 transition-colors cursor-pointer"
        >
          {loadingRole === "student" ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
          ) : (
            <UserCheck className="h-4 w-4 text-emerald-700" />
          )}
          Entrar Estudiante
        </button>

        <button
          type="button"
          disabled={loadingRole !== null}
          onClick={() => loginAs("tutor")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors cursor-pointer"
        >
          {loadingRole === "tutor" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BookOpen className="h-4 w-4 text-amber-300" />
          )}
          Entrar Profesor
        </button>
      </div>

      <Link
        to={"/clase-demo" as any}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-900 dark:text-amber-300 hover:bg-amber-500/20 transition-colors"
      >
        <Video className="h-4 w-4" />
        Probar Sala de Clase Virtual en Vivo ahora
      </Link>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
