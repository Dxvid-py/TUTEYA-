import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Star,
  ShieldCheck,
  Video,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { TutorAvatar } from "../components/tutor-avatar";
import { formatCOP } from "../lib/format-cop";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const FEATURED_TUTORS = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Prof. Carlos Mendoza",
    subject: "Cálculo, Álgebra Lineal y Física",
    university: "Universidad del Norte",
    rating: 4.98,
    reviews: 64,
    hourlyRateCOP: 45000,
    online: true,
    avatarUrl:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Ingeniero electrónico con 6 años preparando estudiantes universitarios y de bachillerato.",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Profa. Laura Restrepo",
    subject: "Inglés Conversacional y TOEFL",
    university: "Universidad de los Andes",
    rating: 4.95,
    reviews: 51,
    hourlyRateCOP: 50000,
    online: true,
    avatarUrl:
      "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Licenciada en lenguas modernas, sesiones 100% prácticas enfocadas en fluidez real.",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Prof. Andrés Felipe Quintero",
    subject: "Programación Python, SQL y Web",
    university: "Universidad Nacional",
    rating: 4.99,
    reviews: 82,
    hourlyRateCOP: 55000,
    online: false,
    avatarUrl:
      "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
    bio: "Desarrollador Full-Stack; mentoría en proyectos reales, bases de datos y algoritmos.",
  },
];

const SUBJECT_TICKER = [
  "Cálculo Diferencial",
  "Álgebra Lineal",
  "Programación en Python",
  "Inglés B1 - C1",
  "Química Orgánica",
  "Física Mecánica",
  "Estadística Aplicada",
  "Preparación ICFES Saber 11",
  "Bases de Datos SQL",
  "Contabilidad y Finanzas",
];

function HomePage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({
      to: "/tutores" as any,
      search: (query.trim() ? { q: query.trim() } : {}) as any,
    });
  }

  return (
    <div className="overflow-x-hidden">
      {/* HERO DINÁMICO */}
      <section className="relative bg-gradient-to-b from-blue-50/90 via-white to-slate-50 pt-14 pb-20 sm:pt-20 sm:pb-24">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-400/15 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7 animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-bold text-blue-700 shadow-sm mb-6">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Clases personalizadas en vivo · Tarifas claras en COP
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.1]">
                Domina cualquier materia con{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  profesores verificados
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-lg text-slate-600 leading-relaxed">
                Reserva tutorías 1 a 1 en minutos, con videollamada integrada y precios transparentes en pesos colombianos desde{" "}
                <strong className="font-bold text-slate-900">{formatCOP(35000)}</strong> por hora.
              </p>

              <form
                onSubmit={handleSearch}
                className="mt-8 flex flex-col sm:flex-row gap-2.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/5 max-w-xl"
              >
                <div className="flex flex-1 items-center gap-2.5 px-3">
                  <Search className="h-5 w-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="¿Qué materia necesitas? Ej: Álgebra, Inglés, Python..."
                    className="w-full bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all cursor-pointer"
                >
                  Buscar profesor
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">¿Quieres probar la plataforma?</span>
                <Link
                  to={"/login" as any}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 font-bold text-blue-700 shadow-xs hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  Entrar como Estudiante o Profesor Demo →
                </Link>
              </div>
            </div>

            {/* Tarjeta flotante interactiva */}
            <div className="lg:col-span-5 animate-fade-up animate-delay-200">
              <div className="animate-float-slow rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl shadow-blue-950/10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <TutorAvatar
                      name="Prof. Carlos Mendoza"
                      src={FEATURED_TUTORS[0].avatarUrl}
                      size="md"
                      online
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Prof. Carlos Mendoza</p>
                      <p className="text-xs text-slate-500">Cálculo & Álgebra Lineal</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    En línea ahora
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5">
                    <span className="text-xs font-medium text-slate-500">Tarifa por sesión (60 min)</span>
                    <span className="text-base font-extrabold text-blue-600">
                      {formatCOP(45000)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 p-2.5 text-slate-700">
                      <Video className="h-4 w-4 text-blue-600" />
                      Sala virtual HD
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 p-2.5 text-slate-700">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Pago protegido
                    </div>
                  </div>
                </div>

                <Link
                  to={"/tutores" as any}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-blue-600 transition-colors"
                >
                  Ver disponibilidad inmediata
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANDA ANIMADA DE MATERIAS */}
      <div className="border-y border-slate-200/80 bg-white py-3.5 overflow-hidden">
        <div className="animate-marquee gap-4">
          {[...SUBJECT_TICKER, ...SUBJECT_TICKER].map((subject, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold text-slate-700 whitespace-nowrap"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
              {subject}
            </span>
          ))}
        </div>
      </div>

      {/* PROFESORES DESTACADOS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Profesores destacados esta semana
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Todos los valores corresponden a sesiones individuales de 1 hora en Pesos Colombianos (COP).
            </p>
          </div>
          <Link
            to={"/tutores" as any}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            Ver catálogo completo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {FEATURED_TUTORS.map((tutor, idx) => (
            <article
              key={tutor.id}
              className={`group rounded-3xl border border-slate-200 bg-white p-6 card-interactive animate-fade-up animate-delay-${
                (idx + 1) * 100
              }`}
            >
              <div className="flex items-start gap-4">
                <TutorAvatar
                  name={tutor.name}
                  src={tutor.avatarUrl}
                  size="lg"
                  online={tutor.online}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {tutor.name}
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">
                    {tutor.subject}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{tutor.university}</p>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {tutor.rating} ({tutor.reviews} reseñas)
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-600 line-clamp-2">{tutor.bio}</p>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <span className="block text-[11px] font-medium text-slate-400">
                    Tarifa por hora
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {formatCOP(tutor.hourlyRateCOP)}
                  </span>
                </div>
                <Link
                  to={"/tutores" as any}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Reservar
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
