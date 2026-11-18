import type { ITutorRepository, TutorFilterCriteria, TutorSummary } from "./interfaces";

// Principio de Responsabilidad Única (SRP): Encapsula el acceso y filtrado de tutores
export class SupabaseTutorRepository implements ITutorRepository {
  async findApprovedTutors(criteria: TutorFilterCriteria = {}): Promise<TutorSummary[]> {
    const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
    const key =
      process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
      process.env["SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

    if (!url || !key) {
      return [];
    }

    const endpoint = `${url}/rest/v1/tutor_profiles?select=user_id,headline,bio,experience_years,hourly_rate,modality,levels,city,is_approved,profiles(full_name),tutor_subjects(subjects(name)),reviews(rating)&is_approved=eq.true`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (!res.ok) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any[] = await res.json();
    let tutors: TutorSummary[] = raw.map((t) => {
      const ratings: number[] = (t.reviews ?? []).map((r: { rating: number }) => Number(r.rating));
      return {
        user_id: String(t.user_id),
        name: t.profiles?.full_name ?? "Tutor Tuteya",
        headline: t.headline ?? "",
        bio: t.bio ?? "",
        experience_years: Number(t.experience_years ?? 0),
        hourly_rate: Number(t.hourly_rate ?? 0),
        modality: t.modality ?? "virtual",
        levels: Array.isArray(t.levels) ? t.levels : [],
        city: t.city ?? null,
        subjects: (t.tutor_subjects ?? [])
          .map((s: { subjects?: { name?: string } }) => s.subjects?.name)
          .filter((n: string | undefined): n is string => Boolean(n)),
        rating: ratings.length ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : null,
        reviewCount: ratings.length,
      };
    });

    if (criteria.q) {
      const q = criteria.q.toLowerCase().trim();
      tutors = tutors.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.headline.toLowerCase().includes(q) ||
          t.subjects.some((s) => s.toLowerCase().includes(q)),
      );
    }
    if (criteria.subject) {
      const sub = criteria.subject.toLowerCase().trim();
      tutors = tutors.filter((t) => t.subjects.some((s) => s.toLowerCase().includes(sub)));
    }
    if (criteria.modality) {
      tutors = tutors.filter((t) => t.modality === criteria.modality || t.modality === "ambas");
    }
    if (criteria.city) {
      const city = criteria.city.toLowerCase().trim();
      tutors = tutors.filter((t) => (t.city ?? "").toLowerCase().includes(city));
    }
    if (typeof criteria.maxRate === "number" && criteria.maxRate > 0) {
      tutors = tutors.filter((t) => t.hourly_rate <= criteria.maxRate!);
    }

    return tutors.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }
}

export class TutorService {
  constructor(private readonly repository: ITutorRepository) {}

  async search(criteria: TutorFilterCriteria): Promise<TutorSummary[]> {
    return this.repository.findApprovedTutors(criteria);
  }
}
