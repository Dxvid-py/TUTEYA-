import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  GraduationCap,
  BookOpen,
  UserCheck,
  Loader2,
  AlertCircle,
  Lock,
  Mail,
} from "lucide-react";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const DEMO_ACCOUNTS = {
  student: {
    email: "estudiante.demo@tuteya.co",
    password: "TuteyaDemo2026!",
    redirect: "/estudiante",
    label: "Estudiante Demo (Valeria Gómez)",
  },
  tutor: {
    email: "profe.demo@tuteya.co",
    password: "TuteyaDemo2026!",
    redirect: "/profesor",
    label: "Profesor Demo (Prof. Carlos Mendoza)",
  },
} as const;

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingRole, setLoadingRole] = useState<"student" | "tutor" | "form" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleDemoLogin(role: "student" | "tutor") {
    setErrorMsg(null);
    setLoadingRole(role);
    const account = DEMO_ACCOUNTS[role];

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) {
        setErrorMsg(
          `No se pudo iniciar la cuenta demo (${error.message}). Ejecuta primero el archivo SQL en Supabase.`
        );
        return;
      }

      navigate({ to: account.redirect as any });
    } catch (err: any) {
      setErrorMsg(err?.message || "Error inesperado al iniciar sesión demo.");
    } finally {
      setLoadingRole(null);
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoadingRole("form");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      const metaRole =
        data.user?.user_metadata?.role ||
        (data.user?.email?.includes("profe") ? "tutor" : "student");

      navigate({ to: (metaRole === "tutor" ? "/profesor" : "/estudiante") as any });
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo iniciar sesión.");
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 animate-fade-up">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">
            Bienvenido a Tuteya
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Usa el acceso directo para probar ambos perfiles al instante
          </p>
        </div>

        {/* PANEL ACCESO DIRECTO DEMO */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3">
            Acceso Directo Demo (1 clic)
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleDemoLogin("student")}
              className="flex items-center justify-center gap-2 rounded-xl bg-white border border-blue-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-xs hover:border-blue-500 hover:text-blue-700 disabled:opacity-60 transition-all cursor-pointer"
            >
              {loadingRole === "student" ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <UserCheck className="h-4 w-4 text-blue-600" />
              )}
              Entrar Estudiante
            </button>

            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleDemoLogin("tutor")}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-all cursor-pointer"
            >
              {loadingRole === "tutor" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BookOpen className="h-4 w-4" />
              )}
              Entrar Profesor
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* LOGIN TRADICIONAL */}
        <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Correo electrónico
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-blue-500">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-blue-500">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingRole !== null}
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {loadingRole === "form" ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
