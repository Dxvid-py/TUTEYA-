import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "tutor" | "student";

interface AuthState {
  user: User | null;
  roles: AppRole[];
  fullName: string;
  loading: boolean;
  hasRole: (r: AppRole) => boolean;
  primaryRole: AppRole | null;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function homeForRole(role: AppRole | null): "/admin" | "/tutor" | "/estudiante" {
  if (role === "admin") return "/admin";
  if (role === "tutor") return "/tutor";
  return "/estudiante";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (u: User | null) => {
    setUser(u);
    if (!u) {
      setRoles([]);
      setFullName("");
      setLoading(false);
      return;
    }
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", u.id),
      supabase.from("profiles").select("full_name").eq("id", u.id).maybeSingle(),
    ]);
    setRoles((r ?? []).map((x) => x.role as AppRole));
    setFullName(p?.full_name ?? u.email ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => load(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setTimeout(() => load(session?.user ?? null), 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const hasRole = (r: AppRole) => roles.includes(r);
  const primaryRole: AppRole | null = roles.includes("admin")
    ? "admin"
    : roles.includes("tutor")
      ? "tutor"
      : roles.includes("student")
        ? "student"
        : null;

  return (
    <AuthContext.Provider
      value={{ user, roles, fullName, loading, hasRole, primaryRole, refresh: () => load(user) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
