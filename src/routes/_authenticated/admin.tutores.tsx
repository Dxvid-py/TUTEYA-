import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Card, PageTitle, RoleGate } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { TutorAvatar } from "@/components/tutor-avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MODALITY_LABEL, money } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/tutores")({
  head: () => ({ meta: [{ title: "Aprobar tutores — Tuteya" }, { name: "description", content: "Revisión de perfiles de tutor." }] }),
  component: () => (
    <RoleGate role="admin">
      <Tutors />
    </RoleGate>
  ),
});

function Tutors() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const { data = [] } = useQuery({
    queryKey: ["admin-tutors"],
    queryFn: async () =>
      (await supabase.from("tutor_profiles").select("*, profiles(full_name, avatar_url), tutor_subjects(subjects(name))").order("created_at", { ascending: false })).data ?? [],
  });
  const list = data.filter((t) => (tab === "pending" ? !t.is_approved : t.is_approved));

  async function setApproved(id: string, v: boolean) {
    const { error } = await supabase.from("tutor_profiles").update({ is_approved: v }).eq("user_id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(v ? "Tutor publicado" : "Tutor ocultado del catálogo");
    qc.invalidateQueries();
  }

  return (
    <>
      <PageTitle title="Aprobar tutores" text="Solo los perfiles aprobados aparecen en el catálogo público." />
      <div className="mb-5 inline-flex rounded-full border bg-card p-1 text-sm font-semibold">
        {(["pending", "approved"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            {t === "pending" ? `Pendientes (${data.filter((x) => !x.is_approved).length})` : "Publicados"}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Nada por aquí" text={tab === "pending" ? "No hay perfiles esperando revisión." : "Aún no hay tutores publicados."} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((t) => {
            const name = t.profiles?.full_name ?? "Tutor";
            const subs = (t.tutor_subjects ?? []).map((s: { subjects: { name: string } | null }) => s.subjects?.name).filter(Boolean);
            const incomplete = !t.headline || subs.length === 0;
            return (
              <Card key={t.user_id} className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <TutorAvatar name={name} url={t.profiles?.avatar_url} className="size-14 text-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{name}</p>
                    <p className="truncate text-sm text-muted-foreground">{t.headline || "Sin titular"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{money(t.hourly_rate)}/h · {t.experience_years} años · {MODALITY_LABEL[t.modality]}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{subs.join(", ") || "Sin materias"}</p>
                {incomplete && <p className="rounded-lg bg-warning/10 px-3 py-1.5 text-xs">Perfil incompleto: falta titular o materias.</p>}
                <div className="mt-auto flex gap-2">
                  {t.is_approved ? (
                    <>
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => setApproved(t.user_id, false)}>Ocultar</Button>
                      <Button variant="ghost" size="sm" asChild className="rounded-full"><Link to="/tutores/$id" params={{ id: t.user_id }}>Ver perfil</Link></Button>
                    </>
                  ) : (
                    <Button size="sm" className="rounded-full" disabled={incomplete} onClick={() => setApproved(t.user_id, true)}>Aprobar y publicar</Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
