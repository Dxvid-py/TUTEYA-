// Principio de Responsabilidad Única (SRP): Reglas de negocio de sesiones y salas virtuales

export class BookingService {
  static buildJitsiRoomUrl(bookingId: string): string {
    const cleanId = bookingId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 24) || "demo";
    return `https://meet.jit.si/Tuteya-Clase-${cleanId}`;
  }

  async listRecentBookings() {
    const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
    const key =
      process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
      process.env["SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

    if (!url || !key) return [];

    const endpoint = `${url}/rest/v1/bookings?select=id,starts_at,duration_minutes,status,modality,notes,student_id,tutor_id&order=starts_at.desc&limit=25`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    if (!res.ok) return [];
    const rows = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (rows ?? []).map((b: any) => ({
      ...b,
      meeting_url: b.meeting_url || BookingService.buildJitsiRoomUrl(String(b.id)),
    }));
  }
}
