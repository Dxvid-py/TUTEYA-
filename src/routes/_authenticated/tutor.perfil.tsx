import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, PageTitle, RoleGate } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { LEVELS } from "@/lib/format";
import { subjectsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tutor/perfil")({
  head: () => ({ meta: [{ title: "Perfil profesional — Tuteya" }, { name: "description", content: "Edita tu perfil de tutor." }] }),
  component: () => (
    <RoleGate role="tutor">
      <TutorProfile />
    </RoleGate>
  ),
});

type Form = { headline: string; bio: string; experience_years: number; hourly_rate: number; modality: "virtual" | "presencial" | "ambas"; levels: string[]; city: string };

function TutorProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: subjects = [] } = useQuery(subjectsQuery);
  const { data } = useQuery({
    queryKey: ["tutor-edit", user?.id],
    queryFn: async () => {
      const [{ data: tp }, { data: ts }] = await Promise.all([
        supabase.from("tutor_profiles").select("*").eq("user_id", user!.id).maybeSingle(),
        supabase.from("tutor_subjects").select("subject_id").eq("tutor_id", user!.id),
      ]);
      return { tp, subjectIds: (ts ?? []).map((x) => x.subject_id) };
    },
  });
  const [f, setF] = useState<Form | null>(null);
  const [sel, setSel] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data?.tp) {
      setF({ headline: data.tp.headline, bio: data.tp.bio, experience_years: data.tp.experience_years, hourly_rate: Number(data.tp.hourly_rate), modality: data.tp.modality, levels: data.tp.levels, city: data.tp.city ?? "" });
      setSel(data.subjectIds);
    }
  }, [data]);

  if (!f) return <div className="h-64 animate-pulse rounded-2xl bg-muted" />;

  async function save() {
    if (!f || !user) return;
    if (f.headline.trim().length < 5) { toast.error("Escribe un titular de al menos 5 caracteres."); return; }
    if (sel.length === 0) { toast.error("Elige al menos una materia."); return; }
    setBusy(true);
    const { error } = await supabase.from("tutor_profiles").update({ ...f, city: f.city || null, headline: f.headline.trim(), bio: f.bio.trim() }).eq("user_id", user.id);
    if (!error) {
      const prev = data?.subjectIds ?? [];
      const add = sel.filter((s) => !prev.includes(s));
      const del = prev.filter((s) => !sel.includes(s));
      if (add.length) await supabase.from("tutor_subjects").insert(add.map((subject_id) => ({ tutor_id: user.id, subject_id })));
      if (del.length) await supabase.from("tutor_subjects").delete().eq("tutor_id", user.id).in("subject_id", del);
    }
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Perfil guardado");
    qc.invalidateQueries();
  }

  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <>
      <PageTitle title="Perfil profesional" text={data?.tp?.is_approved ? "Tu perfil está publicado." : "Tu perfil se publicará cuando un administrador lo apruebe."} />
      <Card className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="h">Titular</Label>
          <Input id="h" value={f.headline} maxLength={120} onChange={(e) => setF({ ...f, headline: e.target.value })} placeholder="Ej. Ingeniero, tutor de Cálculo y Física" className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="b">Presentación</Label>
          <Textarea id="b" rows={5} maxLength={1500} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} className="rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="r">Tarifa por hora (USD)</Label>
            <Input id="r" type="number" min={0} value={f.hourly_rate} onChange={(e) => setF({ ...f, hourly_rate: Math.max(0, Number(e.target.value)) })} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="x">Años de experiencia</Label>
            <Input id="x" type="number" min={0} value={f.experience_years} onChange={(e) => setF({ ...f, experience_years: Math.max(0, Number(e.target.value)) })} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>Modalidad</Label>
            <Select value={f.modality} onValueChange={(v) => setF({ ...f, modality: v as Form["modality"] })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="ambas">Virtual y presencial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {f.modality !== "virtual" && (
          <div className="space-y-1.5">
            <Label htmlFor="c">Ciudad / zona para clases presenciales</Label>
            <Input id="c" value={f.city} maxLength={80} onChange={(e) => setF({ ...f, city: e.target.value })} className="rounded-xl" />
          </div>
        )}
        <Chips label="Niveles que atiendes" options={LEVELS.map((l) => ({ id: l, name: l }))} value={f.levels} onToggle={(v) => setF({ ...f, levels: toggle(f.levels, v) })} />
        <Chips label="Materias" options={subjects} value={sel} onToggle={(v) => setSel(toggle(sel, v))} />
        <Button onClick={save} disabled={busy} className="rounded-full">{busy && <Loader2 className="size-4 animate-spin" />} Guardar cambios</Button>
      </Card>
    </>
  );
}

function Chips({ label, options, value, onToggle }: { label: string; options: { id: string; name: string }[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value.includes(o.id)}
            onClick={() => onToggle(o.id)}
            className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors", value.includes(o.id) ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary")}
          >
            {o.name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
