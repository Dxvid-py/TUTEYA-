import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarCheck, CalendarDays, Clock, Search, Sparkles, Video } from "lucide-react";
import { Card, PageTitle, Stat } from "@/components/app-shell";
import { EmptyState, StatusBadge } from "@/components/brand";
import { BookingList } from "@/components/booking-list";
import { AiTutorAssistant } from "@/components/ai-tutor-assistant";
import { ExpressStudentWidget } from "@/components/express-tutor-radar";
import { VideoRoomDialog } from "@/components/video-room-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useBookings } from "@/lib/bookings";
import { dateTime, money } from "@/lib/format";
import { tutorsQuery } from "@/lib/queries";
import { TutorAvatar } from "@/components/tutor-avatar";
import { BookingService } from "@/services/booking.service";

export const Route = createFileRoute("/_authenticated/estudiante")({
  head: () => ({ meta: [{ title: "Mi panel — Tuteya" }, { name: "description", content: "Panel del estudiante." }] }),
  component: StudentDash,
});

function StudentDash() {
  const { user, fullName } = useAuth();
  const { data = [] } = useBookings("mine", user?.id);
  const { data: tutors = [] } = useQuery(tutorsQuery);
  const [room, setRoom] = useState<{ url: string; title: string } | null>(null);

  const mine = data.filter((b) => b.student_id === user?.id);
  const upcoming = mine
    .filter((b) => ["pendiente", "confirmada"].includes(b.status) && new Date(b.starts_at) > new Date())
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
  const next = upcoming[0];
  const completed = mine.filter((b) => b.status === "completada").length;

  return (
    <>
      <PageTitle title={`Hola, ${fullName.split(" ")[0]}`} text="Esto es lo que tienes por delante." />

      <div className="mb-6">
        <ExpressStudentWidget onOpenRoom={(url, title) => setRoom({ url, title })} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl bg-primary-deep p-7 text-primary-foreground lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Próxima tutoría</p>
          {next ? (
            <>
              <h2 className="mt-3 text-2xl font-extrabold">{next.subject?.name ?? "Tutoría"} con {next.tutor?.profiles?.full_name}</h2>
              <p className="mt-2 flex items-center gap-2 opacity-90"><Clock className="size-4" /> {dateTime(next.starts_at)} · <span className="capitalize">{next.modality}</span></p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="inline-block rounded-full bg-primary-foreground px-1"><StatusBadge status={next.status} /></div>
                {next.status === "confirmada" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                    onClick={() =>
                      setRoom({
                        url: BookingService.buildJitsiRoomUrl(next.id),
                        title: `${next.subject?.name ?? "Tutoría"} con ${next.tutor?.profiles?.full_name ?? "Tutor"}`,
                      })
                    }
                  >
                    <Video className="size-4" /> Entrar a la sala virtual
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-2xl font-extrabold">Aún no tienes tutorías programadas</h2>
              <p className="mt-2 opacity-90">Busca un tutor y reserva tu primera sesión.</p>
              <Button asChild variant="secondary" className="mt-5 rounded-full"><Link to="/tutores">Buscar tutor <ArrowRight className="size-4" /></Link></Button>
            </>
          )}
        </div>
        <div className="grid gap-4">
          <Stat icon={CalendarDays} label="Próximas" value={upcoming.length} />
          <Stat icon={CalendarCheck} label="Completadas" value={completed} />
        </div>
      </div>

      <div className="mt-8">
        <AiTutorAssistant />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Actividad reciente</h2>
            <Link to="/reservas" className="text-sm font-semibold text-primary">Ver todo</Link>
          </div>
          {mine.length === 0 ? (
            <EmptyState icon={Search} title="Sin reservas todavía" text="Tus solicitudes y sesiones aparecerán aquí." />
          ) : (
            <BookingList items={mine.slice(0, 4)} viewerId={user?.id} />
          )}
        </section>
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-bold"><Sparkles className="size-4 text-primary" /> Tutores para ti</h2>
          <Card className="space-y-4 p-4">
            {tutors.length === 0 && <p className="text-sm text-muted-foreground">Pronto habrá tutores publicados.</p>}
            {tutors.slice(0, 4).map((t) => (
              <Link key={t.user_id} to="/tutores/$id" params={{ id: t.user_id }} className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted">
                <TutorAvatar name={t.name} url={t.avatar_url} className="size-11 text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.subjects.map((s) => s.name).join(", ")}</p>
                </div>
                <span className="text-sm font-bold text-primary">{money(t.hourly_rate)}</span>
              </Link>
            ))}
          </Card>
        </section>
      </div>

      <VideoRoomDialog
        roomUrl={room?.url ?? null}
        title={room?.title ?? "Sala Virtual TUTEYA"}
        onClose={() => setRoom(null)}
      />
    </>
  );
}
