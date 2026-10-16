import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { dateTime, STATUS_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notificaciones")({
  head: () => ({ meta: [{ title: "Notificaciones — Tuteya" }, { name: "description", content: "Centro de notificaciones." }] }),
  component: Notifs,
});

function Notifs() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => (await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100)).data ?? [],
  });
  async function markAll() {
    await supabase.from("notifications").update({ read: true }).eq("user_id", user!.id).eq("read", false);
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["unread"] });
  }
  const pretty = (b: string | null) => (b ? b.replace(/Estado actual: (\w+)/, (_, s) => `Estado actual: ${STATUS_LABEL[s] ?? s}`) : "");
  return (
    <>
      <PageTitle
        title="Notificaciones"
        text="Solicitudes, confirmaciones y cambios de estado dentro de Tuteya."
        action={data.some((n) => !n.read) ? <Button variant="outline" className="rounded-full" onClick={markAll}><CheckCheck className="size-4" /> Marcar todo como leído</Button> : undefined}
      />
      {data.length === 0 ? (
        <EmptyState icon={Bell} title="Sin notificaciones" text="Te avisaremos aquí cuando haya novedades en tus reservas." />
      ) : (
        <ul className="divide-y rounded-2xl border bg-card">
          {data.map((n) => (
            <li key={n.id} className={cn("flex gap-4 p-4", !n.read && "bg-secondary/40")}>
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-border" : "bg-primary")} />
              <div className="flex-1">
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-muted-foreground">{pretty(n.body)}</p>
              </div>
              <time className="text-xs text-muted-foreground">{dateTime(n.created_at)}</time>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
