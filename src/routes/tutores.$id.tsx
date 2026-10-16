import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, CalendarDays, Clock, Loader2, MapPin, MessageSquareQuote, Video } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/site-chrome";
import { Stars } from "@/components/brand";
import { TutorAvatar } from "@/components/tutor-avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tutorDetailQuery } from "@/lib/queries";
import { MODALITY_LABEL, WEEKDAYS, dateTime, money, slotsForDate } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/tutores/$id")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(tutorDetailQuery(params.id));
    if (!d) throw notFound();
    return { name: d.tutor.name, headline: d.tutor.headline };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Tutor en Tuteya` },
          { name: "description", content: loaderData.headline || `Reserva una tutoría con ${loaderData.name}.` },
          { property: "og:title", content: `${loaderData.name} — Tutor en Tuteya` },
          { property: "og:description", content: loaderData.headline || "Perfil de tutor en Tuteya" },
        ]
      : [{ title: "Tutor no disponible — Tuteya" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <PublicLayout>
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="text-2xl font-bold">Este tutor no está disponible</h1>
        <Button asChild className="mt-6 rounded-full"><Link to="/tutores">Ver todos los tutores</Link></Button>
      </div>
    </PublicLayout>
  ),
  component: TutorPage,
});

function TutorPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(tutorDetailQuery(id));
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const t = data!.tutor;

  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState<Date | null>(null);
  const [subject, setSubject] = useState(t.subjects[0]?.id ?? "");
  const [modality, setModality] = useState<"virtual" | "presencial">(t.modality === "presencial" ? "presencial" : "virtual");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const availDays = new Set(data!.availability.map((a) => a.weekday));
  const slots = date ? slotsForDate(date, data!.availability, []) : [];
  const isOwn = user?.id === t.user_id;

  async function book() {
    if (!user) { navigate({ to: "/login" }); return; }
    if (!slot) return;
    setBusy(true);
    const { error } = await supabase.from("bookings").insert({
      student_id: user.id,
      tutor_id: t.user_id,
      subject_id: subject || null,
      modality,
      starts_at: slot.toISOString(),
      duration_minutes: 60,
      notes: notes.trim() || null,
    });
    setBusy(false);
    if (error) {
      if (error.code === "23505") { toast.error("Ese horario acaba de ser reservado. Elige otro."); return; }
      { toast.error("No se pudo enviar la solicitud: " + error.message); return; }
    }
    qc.invalidateQueries({ queryKey: ["bookings"] });
    toast.success("Solicitud enviada. El tutor debe confirmarla.");
    navigate({ to: "/reservas" });
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link to="/tutores" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Volver al catálogo
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <div className="rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row">
                <TutorAvatar name={t.name} url={t.avatar_url} className="size-28 text-3xl" />
                <div className="flex-1">
                  <h1 className="flex items-center gap-2 text-3xl font-extrabold">{t.name} <BadgeCheck className="size-5 text-primary" /></h1>
                  <p className="mt-1 text-muted-foreground">{t.headline}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                    {t.rating !== null ? (
                      <span className="flex items-center gap-1.5"><Stars value={t.rating} /> <strong>{t.rating.toFixed(1)}</strong> <span className="text-muted-foreground">({t.reviewCount} reseñas)</span></span>
                    ) : <span className="text-muted-foreground">Sin reseñas aún</span>}
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Video className="size-4" /> {MODALITY_LABEL[t.modality]}</span>
                    {t.city && <span className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="size-4" /> {t.city}</span>}
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-3">
                <Fact label="Tarifa" value={`${money(t.hourly_rate)} / hora`} />
                <Fact label="Experiencia" value={`${t.experience_years} años`} />
                <Fact label="Niveles" value={t.levels.join(", ") || "—"} />
              </div>
            </div>
            <section className="rounded-3xl border bg-card p-6 sm:p-8">
              <h2 className="text-lg font-bold">Sobre mí</h2>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{t.bio || "Este tutor aún no escribió su presentación."}</p>
              <h3 className="mt-6 text-sm font-bold">Materias</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {t.subjects.map((s) => <span key={s.id} className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">{s.name}</span>)}
              </div>
            </section>
            <section className="rounded-3xl border bg-card p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-bold"><CalendarDays className="size-5 text-primary" /> Disponibilidad semanal</h2>
              {data!.availability.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">El tutor aún no publicó horarios.</p>
              ) : (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {data!.availability.map((a, i) => (
                    <li key={i} className="flex justify-between rounded-xl bg-muted px-4 py-2.5 text-sm">
                      <span className="font-semibold">{WEEKDAYS[a.weekday]}</span>
                      <span className="text-muted-foreground">{a.start_time.slice(0, 5)} – {a.end_time.slice(0, 5)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-3xl border bg-card p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-lg font-bold"><MessageSquareQuote className="size-5 text-primary" /> Reseñas verificadas</h2>
              {data!.reviews.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Las reseñas aparecen cuando un estudiante completa una tutoría.</p>
              ) : (
                <ul className="mt-4 divide-y">
                  {data!.reviews.map((r) => (
                    <li key={r.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{(r.profiles as { full_name: string } | null)?.full_name ?? "Estudiante"}</span>
                        <Stars value={r.rating} />
                      </div>
                      {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="h-fit rounded-3xl border bg-card p-6 shadow-lift lg:sticky lg:top-24">
            <h2 className="text-lg font-bold">Reservar tutoría</h2>
            <p className="text-sm text-muted-foreground">Sesiones de 60 minutos · {money(t.hourly_rate)}</p>
            {isOwn ? (
              <p className="mt-6 rounded-xl bg-muted p-4 text-sm">Este es tu perfil público.</p>
            ) : user && !hasRole("student") ? (
              <p className="mt-6 rounded-xl bg-muted p-4 text-sm">Solo las cuentas de estudiante pueden reservar.</p>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold uppercase text-muted-foreground">1 · Materia</p>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Elige materia" /></SelectTrigger>
                    <SelectContent>{t.subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {t.modality === "ambas" && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold uppercase text-muted-foreground">2 · Modalidad</p>
                    <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-sm font-semibold">
                      {(["virtual", "presencial"] as const).map((m) => (
                        <button key={m} onClick={() => setModality(m)} className={`rounded-lg py-2 capitalize ${modality === m ? "bg-card shadow-soft" : "text-muted-foreground"}`}>{m}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground">3 · Fecha</p>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { setDate(d); setSlot(null); }}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0)) || !availDays.has(d.getDay())}
                    className="mx-auto"
                  />
                </div>
                {date && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">4 · Horario</p>
                    {slots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No quedan horarios para este día.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((s) => (
                          <button
                            key={s.toISOString()}
                            onClick={() => setSlot(s)}
                            className={`rounded-xl border py-2 text-sm font-semibold transition-colors ${slot?.getTime() === s.getTime() ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}
                          >
                            {s.toTimeString().slice(0, 5)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {slot && (
                  <>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="¿Qué te gustaría repasar? (opcional)" maxLength={500} className="rounded-xl" />
                    <div className="space-y-1 rounded-xl bg-secondary/60 p-4 text-sm">
                      <p className="flex items-center gap-2 font-semibold"><Clock className="size-4" /> {dateTime(slot.toISOString())}</p>
                      <p className="text-muted-foreground">{t.subjects.find((s) => s.id === subject)?.name} · {modality} · 60 min · {money(t.hourly_rate)}</p>
                    </div>
                  </>
                )}
                <Button onClick={book} disabled={!slot || busy} className="h-11 w-full rounded-xl">
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {user ? "Enviar solicitud" : "Inicia sesión para reservar"}
                </Button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
