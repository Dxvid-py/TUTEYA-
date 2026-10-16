import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { BadgeCheck, MapPin, Search, SearchX, SlidersHorizontal, Video, X } from "lucide-react";
import { PublicLayout } from "@/components/site-chrome";
import { EmptyState, Stars } from "@/components/brand";
import { TutorAvatar } from "@/components/tutor-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subjectsQuery, tutorsQuery } from "@/lib/queries";
import { LEVELS, MODALITY_LABEL, WEEKDAYS, money } from "@/lib/format";

const search = z.object({
  q: z.string().optional(),
  materia: z.string().optional(),
  nivel: z.string().optional(),
  modalidad: z.enum(["virtual", "presencial"]).optional(),
  ciudad: z.string().optional(),
  max: z.number().optional(),
  dia: z.number().optional(),
  orden: z.enum(["rating", "precio_asc", "precio_desc", "experiencia"]).optional(),
});

export const Route = createFileRoute("/tutores/")({
  validateSearch: search,
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(tutorsQuery), context.queryClient.ensureQueryData(subjectsQuery)]),
  head: () => ({
    meta: [
      { title: "Buscar tutores — Tuteya" },
      { name: "description", content: "Filtra tutores por materia, nivel educativo, modalidad, ciudad, precio y disponibilidad." },
      { property: "og:title", content: "Buscar tutores — Tuteya" },
      { property: "og:description", content: "Encuentra al tutor ideal en Tuteya." },
    ],
  }),
  component: TutorsPage,
});

function TutorsPage() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/tutores/" });
  const { data: tutors } = useSuspenseQuery(tutorsQuery);
  const { data: subjects } = useSuspenseQuery(subjectsQuery);
  const set = (patch: Partial<z.infer<typeof search>>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const results = useMemo(() => {
    const q = (s.q ?? "").toLowerCase().trim();
    let r = tutors.filter((t) => {
      if (q && !(t.name.toLowerCase().includes(q) || t.headline.toLowerCase().includes(q) || t.subjects.some((x) => x.name.toLowerCase().includes(q)))) return false;
      if (s.materia && !t.subjects.some((x) => x.id === s.materia)) return false;
      if (s.nivel && !t.levels.includes(s.nivel)) return false;
      if (s.modalidad && !(t.modality === s.modalidad || t.modality === "ambas")) return false;
      if (s.ciudad && !(t.city ?? "").toLowerCase().includes(s.ciudad.toLowerCase())) return false;
      if (s.max && t.hourly_rate > s.max) return false;
      if (s.dia !== undefined && !t.availabilityDays.includes(s.dia)) return false;
      return true;
    });
    const o = s.orden ?? "rating";
    r = [...r].sort((a, b) =>
      o === "precio_asc" ? a.hourly_rate - b.hourly_rate
      : o === "precio_desc" ? b.hourly_rate - a.hourly_rate
      : o === "experiencia" ? b.experience_years - a.experience_years
      : (b.rating ?? 0) - (a.rating ?? 0),
    );
    return r;
  }, [tutors, s]);

  const hasFilters = Object.keys(s).some((k) => k !== "orden" && s[k as keyof typeof s] !== undefined);

  return (
    <PublicLayout>
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Encuentra a tu tutor</h1>
          <p className="mt-2 text-muted-foreground">Busca por nombre o materia y ajusta los filtros a lo que necesitas.</p>
          <div className="mt-6 flex max-w-2xl items-center gap-2 rounded-2xl border bg-background p-2">
            <Search className="ml-2 size-5 text-muted-foreground" />
            <label htmlFor="q" className="sr-only">Buscar</label>
            <input
              id="q"
              defaultValue={s.q}
              onChange={(e) => set({ q: e.target.value || undefined })}
              placeholder="Nombre del tutor o materia"
              className="h-10 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit space-y-5 rounded-2xl border bg-card p-5 lg:sticky lg:top-24" aria-label="Filtros">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold"><SlidersHorizontal className="size-4" /> Filtros</h2>
            {hasFilters && (
              <button onClick={() => navigate({ search: {} })} className="flex items-center gap-1 text-xs font-semibold text-primary">
                <X className="size-3" /> Limpiar
              </button>
            )}
          </div>
          <Filter label="Materia">
            <Select value={s.materia ?? "all"} onValueChange={(v) => set({ materia: v === "all" ? undefined : v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {subjects.map((x) => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Filter>
          <Filter label="Nivel educativo">
            <Select value={s.nivel ?? "all"} onValueChange={(v) => set({ nivel: v === "all" ? undefined : v })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </Filter>
          <Filter label="Modalidad">
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1 text-xs font-semibold">
              {[["", "Todas"], ["virtual", "Virtual"], ["presencial", "Presencial"]].map(([v, l]) => (
                <button
                  key={l}
                  onClick={() => set({ modalidad: (v || undefined) as "virtual" | undefined })}
                  className={`rounded-lg py-1.5 ${(s.modalidad ?? "") === v ? "bg-card shadow-soft" : "text-muted-foreground"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </Filter>
          {s.modalidad === "presencial" && (
            <Filter label="Ciudad">
              <Input defaultValue={s.ciudad} onChange={(e) => set({ ciudad: e.target.value || undefined })} placeholder="Ej. Quito" className="rounded-xl" />
            </Filter>
          )}
          <Filter label={`Precio máximo por hora${s.max ? `: ${money(s.max)}` : ""}`}>
            <input
              type="range" min={5} max={100} step={5}
              value={s.max ?? 100}
              onChange={(e) => set({ max: Number(e.target.value) === 100 ? undefined : Number(e.target.value) })}
              className="w-full accent-primary"
              aria-label="Precio máximo"
            />
          </Filter>
          <Filter label="Disponible el día">
            <Select value={s.dia?.toString() ?? "all"} onValueChange={(v) => set({ dia: v === "all" ? undefined : Number(v) })}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquier día</SelectItem>
                {WEEKDAYS.map((d, i) => <SelectItem key={d} value={String(i)}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </Filter>
        </aside>
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {results.length} {results.length === 1 ? "tutor encontrado" : "tutores encontrados"}
            </p>
            <Select value={s.orden ?? "rating"} onValueChange={(v) => set({ orden: v as "rating" })}>
              <SelectTrigger className="w-52 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Mejor calificados</SelectItem>
                <SelectItem value="precio_asc">Precio: menor a mayor</SelectItem>
                <SelectItem value="precio_desc">Precio: mayor a menor</SelectItem>
                <SelectItem value="experiencia">Más experiencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={tutors.length === 0 ? "Aún no hay tutores publicados" : "Sin resultados"}
              text={tutors.length === 0 ? "Los tutores aparecerán aquí cuando un administrador apruebe sus perfiles." : "Prueba quitando algunos filtros."}
              action={tutors.length === 0 ? <Button asChild className="rounded-full"><Link to="/registro" search={{ rol: "tutor" }}>Ser el primer tutor</Link></Button> : undefined}
            />
          ) : (
            <ul className="space-y-4">
              {results.map((t) => (
                <li key={t.user_id} className="group rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift">
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <TutorAvatar name={t.name} url={t.avatar_url} className="size-20 text-xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="flex items-center gap-1.5 text-lg font-bold">
                            {t.name} <BadgeCheck className="size-4 text-primary" aria-label="Perfil verificado" />
                          </h3>
                          <p className="text-sm text-muted-foreground">{t.headline}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-extrabold text-primary">{money(t.hourly_rate)}<span className="text-xs font-medium text-muted-foreground"> / hora</span></p>
                          {t.rating !== null ? (
                            <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground"><Stars value={t.rating} size={12} /> {t.rating.toFixed(1)} ({t.reviewCount})</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">Sin reseñas aún</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {t.subjects.map((x) => (
                          <span key={x.id} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">{x.name}</span>
                        ))}
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{t.bio}</p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>{t.experience_years} años de experiencia</span>
                          <span className="flex items-center gap-1"><Video className="size-3.5" /> {MODALITY_LABEL[t.modality]}</span>
                          {t.city && t.modality !== "virtual" && <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {t.city}</span>}
                        </div>
                        <Button asChild className="rounded-full">
                          <Link to="/tutores/$id" params={{ id: t.user_id }}>Ver perfil y reservar</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
