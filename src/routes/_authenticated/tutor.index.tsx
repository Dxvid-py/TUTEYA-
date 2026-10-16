import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CalendarCheck, ClipboardList, Inbox, Star } from "lucide-react";
import { PageTitle, RoleGate, Stat } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { BookingList } from "@/components/booking-list";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useBookings } from "@/lib/bookings";

export const Route = createFileRoute("/_authenticated/tutor/")({
  head: () => ({ meta: [{ title: "Panel del tutor — Tuteya" }, { name: "description", content: "Gestiona solicitudes y sesiones." }] }),
  component: () => (
    <RoleGate role="tutor">
      <TutorDash />
    </RoleGate>
  ),
});

function TutorDash() {
  const { user, fullName } = useAuth();
  const { data = [] } = useBookings("mine", user?.id);
  const { data: tp } = useQuery({
    queryKey: ["my-tutor-profile", user?.id],
    queryFn: async () => (await supabase.from("tutor_profiles").select("is_approved, headline, reviews(rating)").eq("user_id", user!.id).maybeSingle()).data,
  });
  const mine = data.filter((b) => b.tutor_id === user?.id);
  const pending = mine.filter((b) => b.status === "pendiente");
  const upcoming = mine.filter((b) => b.status === "confirmada" && new Date(b.starts_at) > new Date());
  const ratings = (tp?.reviews ?? []).map((r) => r.rating);
  const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—";

  return (
    <>
      <PageTitle title={`Hola, ${fullName.split(" ")[0]}`} text="Resumen de tu actividad como tutor." />
      {tp && !tp.is_approved && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-warning/40 bg-warning/10 p-5">
          <AlertCircle className="size-5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Tu perfil está pendiente de aprobación</p>
            <p className="text-sm text-muted-foreground">Completa tu perfil profesional y disponibilidad. Un administrador lo revisará antes de publicarlo.</p>
          </div>
          <Button asChild className="rounded-full"><Link to="/tutor/perfil">Completar perfil</Link></Button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Inbox} label="Solicitudes pendientes" value={pending.length} />
        <Stat icon={CalendarCheck} label="Próximas sesiones" value={upcoming.length} />
        <Stat icon={Star} label={`Calificación (${ratings.length} reseñas)`} value={avg} />
      </div>
      <section className="mt-8">
        <h2 className="mb-3 font-bold">Solicitudes por responder</h2>
        {pending.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Todo al día" text="No tienes solicitudes pendientes." />
        ) : (
          <BookingList items={pending} viewerId={user?.id} />
        )}
      </section>
      <section className="mt-8">
        <h2 className="mb-3 font-bold">Próximas tutorías</h2>
        {upcoming.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="Sin sesiones confirmadas" text="Las tutorías que aceptes aparecerán aquí." />
        ) : (
          <BookingList items={upcoming} viewerId={user?.id} />
        )}
      </section>
    </>
  );
}
