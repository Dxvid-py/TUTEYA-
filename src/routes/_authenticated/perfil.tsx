import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, PageTitle } from "@/components/app-shell";
import { ThemeToggle } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { LEVELS } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Mi cuenta — Tuteya" }, { name: "description", content: "Perfil y preferencias." }] }),
  component: Profile,
});

function Profile() {
  const { user, refresh } = useAuth();
  const { data } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).single()).data,
  });
  const [f, setF] = useState({ full_name: "", phone: "", city: "", education_level: "" });
  useEffect(() => {
    if (data) setF({ full_name: data.full_name, phone: data.phone ?? "", city: data.city ?? "", education_level: data.education_level ?? "" });
  }, [data]);

  async function save() {
    if (f.full_name.trim().length < 3) { toast.error("El nombre es demasiado corto."); return; }
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: f.full_name.trim(), phone: f.phone.trim() || null, city: f.city.trim() || null, education_level: f.education_level || null })
      .eq("id", user!.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Perfil actualizado");
    refresh();
  }

  return (
    <>
      <PageTitle title="Mi cuenta" text={user?.email ?? ""} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 lg:col-span-2">
          <h2 className="font-bold">Datos personales</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="n">Nombre completo</Label><Input id="n" value={f.full_name} maxLength={80} onChange={(e) => setF({ ...f, full_name: e.target.value })} className="rounded-xl" /></div>
            <div className="space-y-1.5"><Label htmlFor="p">Teléfono</Label><Input id="p" value={f.phone} maxLength={20} onChange={(e) => setF({ ...f, phone: e.target.value })} className="rounded-xl" /></div>
            <div className="space-y-1.5"><Label htmlFor="c">Ciudad</Label><Input id="c" value={f.city} maxLength={80} onChange={(e) => setF({ ...f, city: e.target.value })} className="rounded-xl" /></div>
            <div className="space-y-1.5">
              <Label>Nivel educativo</Label>
              <Select value={f.education_level || "none"} onValueChange={(v) => setF({ ...f, education_level: v === "none" ? "" : v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="none">Sin especificar</SelectItem>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={save} className="rounded-full">Guardar</Button>
        </Card>
        <Card className="space-y-3">
          <h2 className="font-bold">Apariencia</h2>
          <p className="text-sm text-muted-foreground">Claro, oscuro o según tu sistema.</p>
          <ThemeToggle />
        </Card>
      </div>
    </>
  );
}
