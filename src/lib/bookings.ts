import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type BookingStatus = Database["public"]["Enums"]["booking_status"];

export type BookingRow = {
  id: string;
  starts_at: string;
  duration_minutes: number;
  status: BookingStatus;
  modality: string;
  notes: string | null;
  student_id: string;
  tutor_id: string;
  subject: { name: string } | null;
  student: { full_name: string } | null;
  tutor: { profiles: { full_name: string } | null; hourly_rate: number } | null;
  review: { id: string }[];
};

const SELECT =
  "id, starts_at, duration_minutes, status, modality, notes, student_id, tutor_id, subject:subjects(name), student:profiles!bookings_student_id_fkey(full_name), tutor:tutor_profiles(hourly_rate, profiles(full_name)), review:reviews(id)";

export function useBookings(scope: "mine" | "all" = "mine", userId?: string) {
  return useQuery({
    queryKey: ["bookings", scope, userId],
    enabled: scope === "all" || !!userId,
    queryFn: async () => {
      let q = supabase.from("bookings").select(SELECT).order("starts_at", { ascending: false });
      if (scope === "mine" && userId) q = q.or(`student_id.eq.${userId},tutor_id.eq.${userId}`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as BookingRow[];
    },
  });
}

export function useSetStatus() {
  const qc = useQueryClient();
  return async (id: string, status: BookingStatus, okMsg: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(okMsg);
    qc.invalidateQueries({ queryKey: ["bookings"] });
    qc.invalidateQueries({ queryKey: ["unread"] });
  };
}
