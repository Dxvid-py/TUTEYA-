import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  GraduationCap,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  Star,
  Video,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/site-chrome";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import hero from "@/assets/hero-tutoria.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tuteya — El tutor que necesitas está a un clic" },
      {
        name: "description",
        content: "Encuentra tutores por materia, nivel y modalidad. Reserva tutorías virtuales o presenciales en Tuteya.",
      },
      { property: "og:title", content: "Tuteya — El tutor que necesitas está a un clic" },
      { property: "og:description", content: "Reserva tutorías virtuales o presenciales con tutores verificados." },
    ],
  }),
  component: Index,
});

const SUBJECTS = ["Matemáticas", "Física", "Química", "Programación", "Inglés", "Historia", "Contabilidad", "Estadística"];

function Index() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-secondary-foreground">
              <span className="size-1.5 rounded-full bg-primary" /> Tutorías virtuales y presenciales
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              El tutor que necesitas está <span className="text-primary">a un clic</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Encuentra personas que te ayuden a aprender, reserva tu próxima tutoría y conéctate desde donde estés.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/tutores", search: { q } });
              }}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border bg-card p-2 shadow-soft"
              role="search"
            >
              <Search className="ml-2 size-5 text-muted-foreground" />
              <label htmlFor="hero-q" className="sr-only">Buscar materia o tutor</label>
              <input
                id="hero-q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="¿Qué quieres aprender? Ej. Cálculo, Inglés…"
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button type="submit" className="h-11 rounded-xl px-5">Buscar</Button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/tutores">Encontrar un tutor <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/registro" search={{ rol: "tutor" }}>Quiero enseñar</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border shadow-lift">
              <img src={hero} alt="Una estudiante y su tutor estudiando juntos" className="aspect-[5/4] w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-4 hidden w-64 rounded-2xl border bg-card p-4 shadow-lift sm:block">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                  <CalendarCheck className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Reserva en minutos</p>
                  <p className="text-xs text-muted-foreground">Elige día, hora y modalidad</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-3 top-6 hidden rounded-2xl border bg-card px-4 py-3 shadow-lift sm:block">
              <p className="flex items-center gap-2 text-sm font-bold"><Video className="size-4 text-primary" /> Aula virtual</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <p className="text-center text-sm font-semibold text-muted-foreground">Explora por materia</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SUBJECTS.map((s) => (
              <Link
                key={s}
                to="/tutores"
                search={{ q: s }}
                className="rounded-full border bg-background px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-card p-8 shadow-soft sm:p-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Para estudiantes</span>
            <h2 className="mt-3 text-3xl font-extrabold">Aprende a tu ritmo, con quien mejor te explica.</h2>
            <ul className="mt-8 space-y-5">
              {[
                { icon: Search, t: "Busca con filtros reales", d: "Materia, nivel educativo, modalidad, ciudad y precio." },
                { icon: Star, t: "Reputación transparente", d: "Reseñas solo de estudiantes con tutorías completadas." },
                { icon: CalendarCheck, t: "Reserva según su agenda", d: "Solo ves horarios que el tutor tiene disponibles." },
              ].map((b) => (
                <li key={b.t} className="flex gap-4">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground"><b.icon className="size-5" /></div>
                  <div><p className="font-bold">{b.t}</p><p className="text-sm text-muted-foreground">{b.d}</p></div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-primary-deep p-8 text-primary-foreground sm:p-10">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Para tutores</span>
            <h2 className="mt-3 text-3xl font-extrabold">Comparte lo que sabes y organiza tus clases.</h2>
            <ul className="mt-8 space-y-5">
              {[
                { icon: Wallet, t: "Define tu tarifa", d: "Tú decides el precio por hora y tus materias." },
                { icon: CalendarCheck, t: "Controla tu disponibilidad", d: "Publica tus bloques semanales y acepta o rechaza solicitudes." },
                { icon: ShieldCheck, t: "Perfil verificado", d: "El equipo de Tuteya revisa cada perfil antes de publicarlo." },
              ].map((b) => (
                <li key={b.t} className="flex gap-4">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-foreground/15"><b.icon className="size-5" /></div>
                  <div><p className="font-bold">{b.t}</p><p className="text-sm opacity-80">{b.d}</p></div>
                </li>
              ))}
            </ul>
            <Button asChild variant="secondary" className="mt-8 rounded-full">
              <Link to="/registro" search={{ rol: "tutor" }}>Postularme como tutor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-extrabold">Cómo funciona Tuteya</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              { icon: Search, t: "Busca", d: "Filtra por materia, nivel y modalidad." },
              { icon: GraduationCap, t: "Elige", d: "Revisa perfil, tarifa y reseñas." },
              { icon: CalendarCheck, t: "Reserva", d: "Selecciona un horario disponible." },
              { icon: Video, t: "Aprende", d: "Conéctate en línea o en persona." },
            ].map((s, i) => (
              <div key={s.t} className="rounded-2xl border bg-background p-6">
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><s.icon className="size-5" /></div>
                  <span className="text-4xl font-extrabold text-border">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modalities */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border p-8">
            <Video className="size-7 text-primary" />
            <h3 className="mt-4 text-2xl font-extrabold">Virtual</h3>
            <p className="mt-2 text-muted-foreground">Clases en línea desde cualquier dispositivo, con chat y control de cámara y micrófono.</p>
          </div>
          <div className="rounded-3xl border p-8">
            <MapPin className="size-7 text-indigo" />
            <h3 className="mt-4 text-2xl font-extrabold">Presencial</h3>
            <p className="mt-2 text-muted-foreground">Encuentra tutores en tu ciudad y acuerda el lugar de encuentro.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <h2 className="text-center text-3xl font-extrabold">Preguntas frecuentes</h2>
        <Accordion type="single" collapsible className="mt-8">
          {[
            ["¿Cómo reservo una tutoría?", "Busca un tutor, abre su perfil, elige materia, modalidad y un horario disponible, y envía la solicitud. El tutor la confirmará o rechazará."],
            ["¿Quién puede dejar reseñas?", "Solo los estudiantes que completaron una tutoría con ese tutor."],
            ["¿Cómo me convierto en tutor?", "Crea una cuenta como tutor, completa tu perfil profesional y el equipo de Tuteya lo aprobará para publicarlo."],
            ["¿Puedo cancelar una reserva?", "Sí, puedes cancelar reservas pendientes o confirmadas desde “Mis reservas”."],
          ].map(([q, a = ""]) => (
            <AccordionItem key={q} value={q ?? ""}>
              <AccordionTrigger className="text-left font-semibold">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-14 rounded-3xl bg-secondary p-8 text-center">
          <MessageSquare className="mx-auto size-7 text-secondary-foreground" />
          <h3 className="mt-3 text-2xl font-extrabold">Aprender nos conecta</h3>
          <Button asChild className="mt-5 rounded-full"><Link to="/registro">Crear mi cuenta gratis</Link></Button>
        </div>
      </section>
    </PublicLayout>
  );
}
