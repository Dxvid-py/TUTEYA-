import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, PageTitle, RoleGate } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { subjectsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/materias")({
  head: () => ({ meta: [{ title: "Materias — Tuteya" }, { name: "description", content: "Gestión del catálogo de materias." }] }),
  component: () => (
    <RoleGate role="admin">
      <Subjects />
    </RoleGate>
  ),
});

function Subjects() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(subjectsQuery);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");

  async function add() {
    if (name.trim().length < 2) { toast.error("Escribe un nombre válido."); return; }
    const { error } = await supabase.from("subjects").insert({ name: name.trim(), area: area.trim() || "General" });
    if (error) { toast.error(error.code === "23505" ? "Esa materia ya existe." : error.message); return; }
    setName("");
    setArea("");
    qc.invalidateQueries({ queryKey: ["subjects"] });
  }
  async function remove(id: string) {
    if (!confirm("¿Eliminar esta materia? Se quitará de los perfiles de tutor.")) return;
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["subjects"] });
  }

  return (
    <>
      <PageTitle title="Materias" text="Catálogo que los tutores pueden elegir y los estudiantes filtrar." />
      <Card className="mb-6 flex flex-wrap items-end gap-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la materia" className="w-60 rounded-xl" aria-label="Nombre" />
        <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Área (opcional)" className="w-48 rounded-xl" aria-label="Área" />
        <Button onClick={add} className="rounded-full"><Plus className="size-4" /> Agregar</Button>
      </Card>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
            <div><p className="font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">{s.area}</p></div>
            <button onClick={() => remove(s.id)} aria-label={`Eliminar ${s.name}`} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
          </li>
        ))}
      </ul>
    </>
  );
}
