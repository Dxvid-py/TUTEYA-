import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, GraduationCap, Search, Star, Video } from "lucide-react";
import { PublicLayout } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Cómo funciona — Tuteya" },
      { name: "description", content: "Busca, reserva y aprende con tutores verificados en cuatro pasos." },
      { property: "og:title", content: "Cómo funciona — Tuteya" },
      { property: "og:description", content: "Reserva tu tutoría en cuatro pasos." },
    ],
  }),
  component: Page,
});

const STEPS = [
  { icon: Search, t: "Busca a tu tutor", d: "Filtra por materia, nivel educativo, modalidad, ciudad, precio y día disponible." },
  { icon: GraduationCap, t: "Revisa su perfil", d: "Experiencia, tarifa, niveles que atiende, disponibilidad semanal y reseñas verificadas." },
  { icon: CalendarCheck, t: "Envía tu solicitud", d: "Elige materia, modalidad, fecha y hora. El tutor la acepta o la rechaza y te avisamos." },
  { icon: Video, t: "Toma tu clase", d: "Conéctate en línea o reúnete en persona, según la modalidad elegida." },
  { icon: Star, t: "Califica", d: "Al completar la sesión puedes dejar una reseña que ayuda a otros estudiantes." },
];

function Page() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-extrabold">Cómo funciona Tuteya</h1>
        <p className="mt-3 text-lg text-muted-foreground">Del “necesito ayuda” a tu primera clase en minutos.</p>
        <ol className="mt-12 space-y-6">
          {STEPS.map((s, i) => (
            <li key={s.t} className="flex gap-5 rounded-2xl border bg-card p-6">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><s.icon className="size-5" /></div>
              <div>
                <p className="text-xs font-bold text-primary">Paso {i + 1}</p>
                <h2 className="text-lg font-bold">{s.t}</h2>
                <p className="mt-1 text-muted-foreground">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <Button asChild size="lg" className="mt-10 rounded-full"><Link to="/tutores">Buscar tutores</Link></Button>
      </section>
    </PublicLayout>
  );
}
