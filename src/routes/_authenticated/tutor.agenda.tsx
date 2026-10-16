import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, PageTitle, RoleGate } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { WEEKDAYS } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/tutor/agenda")({
  head: () => ({ meta: [{ title: "Disponibilidad — Tuteya" }, { name: "description", content: "Define tus horarios semanales." }] }),
  component: () => (
    <RoleGate role="tutor">
      <Agenda />
    </RoleGate>
  ),
});

function Agenda() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["availability", user?.id];
  const { data = [] } = useQuery({
    queryKey: key,
    queryFn: async () => (await supabase.from("tutor_availability").select("*").eq("tutor_id", user!.id).order("weekday").order("start_time")).data ?? [],
  });
  const [day, setDay] = useState("1");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("12:00");

  async function add() {
    if (end <= start) { toast.error("La hora final debe ser posterior a la inicial."); return; }
    const overlap = data.some((a) => a.weekday === Number(day) && start < a.end_time.slice(0, 5) && end > a.start_time.slice(0, 5));
    if (overlap) { toast.error("Ese bloque se cruza con otro del mismo día."); return; }
    const { error } = await supabase.from("tutor_availability").insert({ tutor_id: user!.id, weekday: Number(day), start_time: start, end_time: end });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: key });
    toast.success("Bloque agregado");
  }
  async function remove(id: string) {
    await supabase.from("tutor_availability").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: key });
  }

  return (
    <>
      <PageTitle title="Disponibilidad semanal" text="Los estudiantes solo podrán reservar dentro de estos bloques, en sesiones de 1 hora." />
      <Card className="mb-6 flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Día</p>
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{WEEKDAYS.map((d, i) => <SelectItem key={d} value={String(i)}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <label className="space-y-1.5"><span className="block text-sm font-medium">Desde</span><Input type="time" step={3600} value={start} onChange={(e) => setStart(e.target.value)} className="w-32 rounded-xl" /></label>
        <label className="space-y-1.5"><span className="block text-sm font-medium">Hasta</span><Input type="time" step={3600} value={end} onChange={(e) => setEnd(e.target.value)} className="w-32 rounded-xl" /></label>
        <Button onClick={add} className="rounded-full"><Plus className="size-4" /> Agregar bloque</Button>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {WEEKDAYS.map((d, i) => {
          const blocks = data.filter((a) => a.weekday === i);
          return (
            <Card key={d} className="p-5">
              <h3 className="font-bold">{d}</h3>
              {blocks.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Sin horarios</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {blocks.map((b) => (
                    <li key={b.id} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground">
                      {b.start_time.slice(0, 5)} – {b.end_time.slice(0, 5)}
                      <button onClick={() => remove(b.id)} aria-label="Eliminar bloque" className="opacity-70 hover:opacity-100"><Trash2 className="size-4" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
