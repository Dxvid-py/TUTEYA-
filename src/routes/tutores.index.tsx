import React, { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Star, SlidersHorizontal, Video } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { TutorAvatar } from "../components/tutor-avatar";
import { formatCOP, normalizeToCOP } from "../lib/format-cop";

export const Route = createFileRoute("/tutores/")({
  component: TutorsCatalogPage,
});

interface TutorItem {
  id: string;
  fullName: string;
  headline: string;
  bio: string;
  hourlyRateCOP: number;
  rating: number;
  avatarUrl: string | null;
  subjects: string[];
  online: boolean;
}

const FALLBACK_TUTORS: TutorItem[] = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    fullName: "Prof. Carlos Mendoza",
    headline: "Ingeniero Electrónico · Matemáticas y Física",
    bio: "Explicaciones paso a paso para parciales universitarios, cálculo diferencial, integral y álgebra lineal.",
    hourlyRateCOP: 45000,
    rating: 4.98,
    avatarUrl:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
    subjects: ["Cálculo", "Álgebra Lineal", "Física"],
    online: true,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    fullName: "Profa. Laura Restrepo",
    headline: "Licenciada en Lenguas · Inglés Conversacional",
    bio: "Clases dinámicas enfocadas en conversación, entrevistas laborales y certificación internacional.",
    hourlyRateCOP: 50000,
    rating: 4.95,
    avatarUrl:
      "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=400",
    subjects: ["Inglés", "TOEFL", "Conversación"],
    online: true,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    fullName: "Prof. Andrés Felipe Quintero",
    headline: "Desarrollador Full-Stack · Python, React y SQL",
    bio: "Te ayudo a construir tus proyectos desde cero, depurar código y dominar bases de datos.",
    hourlyRateCOP: 55000,
    rating: 4.99,
    avatarUrl:
      "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
    subjects: ["Python", "SQL", "Desarrollo Web"],
    online: false,
  },
];

function TutorsCatalogPage() {
  const [tutors, setTutors] = useState<TutorItem[]>(FALLBACK_TUTORS);
  const [search, setSearch] = useState("");
  const [maxPriceCOP, setMaxPriceCOP] = useState<number>(150000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchTutors() {
      try {
        const { data, error } = await supabase
          .from("tutor_profiles")
          .select("id, user_id, headline, bio, hourly_rate, rating, subjects, profiles(full_name, avatar_url)")
          .limit(30);

        if (!active) return;

        if (!error && data && data.length > 0) {
          const mapped: TutorItem[] = data.map((row: any, index: number) => {
            const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
            return {
              id: row.user_id || row.id,
              fullName: profile?.full_name || `Profesor Tuteya #${index + 1}`,
              headline: row.headline || "Tutor Verificado Tuteya",
              bio: row.bio || "Sesiones personalizadas 1 a 1 en vivo.",
              hourlyRateCOP: normalizeToCOP(row.hourly_rate),
              rating: Number(row.rating) || 4.9,
              avatarUrl: profile?.avatar_url || null,
              subjects:
                Array.isArray(row.subjects) && row.subjects.length > 0
                  ? row.subjects
                  : ["Tutoría General"],
              online: index % 2 === 0,
            };
          });
          setTutors(mapped);
        }
      } catch {
        // Conserva FALLBACK_TUTORS si aún no hay registros en Supabase
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchTutors();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tutors.filter((t) => {
      const matchesPrice = t.hourlyRateCOP <= maxPriceCOP;
      const matchesQuery =
        !q ||
        t.fullName.toLowerCase().includes(q) ||
        t.headline.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q));
      return matchesPrice && matchesQuery;
    });
  }, [tutors, search, maxPriceCOP]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-fade-up">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Encuentra tu profesor ideal
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tarifas expresadas exclusivamente en Pesos Colombianos (COP) por hora de clase.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por materia o nombre..."
              className="w-56 text-sm focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-600">Máx:</span>
            <select
              value={maxPriceCOP}
              onChange={(e) => setMaxPriceCOP(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
            >
              <option value={45000}>{formatCOP(45000)}</option>
              <option value={60000}>{formatCOP(60000)}</option>
              <option value={80000}>{formatCOP(80000)}</option>
              <option value={150000}>Todos los precios (COP)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-slate-200/70 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-base font-bold text-slate-800">
            No encontramos profesores con ese filtro.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setMaxPriceCOP(150000);
            }}
            className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white cursor-pointer"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tutor) => (
            <article
              key={tutor.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 card-interactive"
            >
              <div>
                <div className="flex items-start gap-4">
                  <TutorAvatar
                    name={tutor.fullName}
                    src={tutor.avatarUrl}
                    size="lg"
                    online={tutor.online}
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-bold text-slate-900">
                      {tutor.fullName}
                    </h2>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {tutor.headline}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {tutor.rating.toFixed(2)}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-600 line-clamp-3">{tutor.bio}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tutor.subjects.map((sub) => (
                    <span
                      key={sub}
                      className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <span className="block text-[11px] text-slate-400">Valor sesión</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {formatCOP(tutor.hourlyRateCOP, { perHour: true })}
                  </span>
                </div>
                <Link
                  to={"/tutores/$id" as any}
                  params={{ id: tutor.id } as any}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-600 transition-colors"
                >
                  <Video className="h-3.5 w-3.5" />
                  Agendar
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
