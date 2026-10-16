import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña — Tuteya" },
      { name: "description", content: "Define una nueva contraseña para tu cuenta de Tuteya." },
      { property: "og:title", content: "Nueva contraseña — Tuteya" },
      { property: "og:description", content: "Restablece tu contraseña." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <h1 className="text-3xl font-extrabold">Nueva contraseña</h1>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (pw.length < 8) { toast.error("Usa al menos 8 caracteres."); return; }
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ password: pw });
          setBusy(false);
          if (error) { toast.error(error.message); return; }
          toast.success("Contraseña actualizada");
          navigate({ to: "/login" });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="pw">Contraseña nueva</Label>
          <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="h-11 rounded-xl" />
        </div>
        <Button disabled={busy} className="h-11 w-full rounded-xl">Guardar</Button>
      </form>
    </AuthLayout>
  );
}
