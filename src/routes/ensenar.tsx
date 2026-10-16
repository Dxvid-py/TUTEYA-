import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ShieldCheck, UserPlus, Wallet } from "lucide-react";
import { PublicLayout } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ensenar")({
  head: () => ({
    meta: [
      { title: "Enseña en Tuteya — Hazte tutor" },
      { name: "description", content: "Publica tu perfil, define tu tarifa y horarios, y recibe solicitudes de estudiantes." },
      { property: "og:title", content: "Enseña en Tuteya" },
      { property: "og:description", content: "Hazte tutor en Tuteya." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Comparte lo que sabes</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Crea tu perfil de tutor, publica tu disponibilidad y recibe solicitudes de estudiantes que necesitan tu ayuda.</p>
          <Button asChild size="lg" className="mt-8 rounded-full"><Link to="/registro" search={{ rol: "tutor" }}>Crear cuenta de tutor</Link></Button>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-24 sm:px-6 md:grid-cols-4">
        {[
          { icon: UserPlus, t: "Regístrate", d: "Crea tu cuenta y elige “Quiero enseñar”." },
          { icon: Wallet, t: "Arma tu perfil", d: "Materias, niveles, tarifa y modalidad." },
          { icon: CalendarDays, t: "Publica horarios", d: "Bloques semanales en los que puedes dar clase." },
          { icon: ShieldCheck, t: "Aprobación", d: "Nuestro equipo revisa tu perfil y lo publica." },
        ].map((s) => (
          <div key={s.t} className="rounded-2xl border bg-card p-6">
            <s.icon className="size-6 text-primary" />
            <h2 className="mt-4 font-bold">{s.t}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}
