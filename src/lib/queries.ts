import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TutorCard = {
  user_id: string;
  headline: string;
  bio: string;
  experience_years: number;
  hourly_rate: number;
  modality: "virtual" | "presencial" | "ambas";
  levels: string[];
  city: string | null;
  name: string;
  avatar_url: string | null;
  subjects: { id: string; name: string }[];
  rating: number | null;
  reviewCount: number;
  availabilityDays: number[];
};

const TUTOR_SELECT =
  "user_id, headline, bio, experience_years, hourly_rate, modality, levels, city, is_approved, profiles(full_name, avatar_url), tutor_subjects(subjects(id, name)), reviews(rating), tutor_availability(weekday)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTutor(t: any): TutorCard {
  const ratings: number[] = (t.reviews ?? []).map((r: { rating: number }) => r.rating);
  return {
    user_id: t.user_id,
    headline: t.headline,
    bio: t.bio,
    experience_years: t.experience_years,
    hourly_rate: Number(t.hourly_rate),
    modality: t.modality,
    levels: t.levels ?? [],
    city: t.city,
    name: t.profiles?.full_name ?? "Tutor",
    avatar_url: t.profiles?.avatar_url ?? null,
    subjects: (t.tutor_subjects ?? []).map((s: { subjects: { id: string; name: string } }) => s.subjects).filter(Boolean),
    rating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    reviewCount: ratings.length,
    availabilityDays: [...new Set<number>((t.tutor_availability ?? []).map((a: { weekday: number }) => a.weekday))],
  };
}

export const tutorsQuery = queryOptions({
  queryKey: ["tutors"],
  queryFn: async () => {
    const { data, error } = await supabase.from("tutor_profiles").select(TUTOR_SELECT).eq("is_approved", true);
    if (error) throw error;
    return (data ?? []).map(mapTutor);
  },
});

export const subjectsQuery = queryOptions({
  queryKey: ["subjects"],
  queryFn: async () => {
    const { data, error } = await supabase.from("subjects").select("id, name, area").order("name");
    if (error) throw error;
    return data ?? [];
  },
});

export const tutorDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["tutor", id],
    queryFn: async () => {
      const from = new Date();
      const to = new Date(from.getTime() + 60 * 86_400_000);
      const [{ data: t, error }, { data: av }, { data: rv }, busyRes] = await Promise.all([
        supabase.from("tutor_profiles").select(TUTOR_SELECT).eq("user_id", id).maybeSingle(),
        supabase.from("tutor_availability").select("weekday, start_time, end_time").eq("tutor_id", id).order("weekday"),
        supabase
          .from("reviews")
          .select("id, rating, comment, created_at, profiles(full_name)")
          .eq("tutor_id", id)
          .order("created_at", { ascending: false }),
        // Si la migración aún no se aplicó, la RPC falla: se ignora y el trigger de BD sigue protegiendo.
        supabase.rpc("get_tutor_busy_slots", { _tutor_id: id, _from: from.toISOString(), _to: to.toISOString() }),
      ]);
      if (error) throw error;
      if (!t) return null;
      return { tutor: mapTutor(t), availability: av ?? [], reviews: rv ?? [], busy: busyRes.error ? [] : (busyRes.data ?? []) };
    },
  });
