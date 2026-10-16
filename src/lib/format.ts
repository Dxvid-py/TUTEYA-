export const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const LEVELS = ["Primaria", "Secundaria", "Bachillerato", "Universidad", "Profesional"];

export const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
  completada: "Completada",
};

export const MODALITY_LABEL: Record<string, string> = {
  virtual: "Virtual",
  presencial: "Presencial",
  ambas: "Virtual y presencial",
};

export function money(n: number | string) {
  return new Intl.NumberFormat("es", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Number(n),
  );
}

export function dateTime(iso: string) {
  return new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "T"
  );
}

export type BusyRange = { starts_at: string; duration_minutes: number };

const SLOT_MINUTES = 60;

/** Builds hourly slots for a date from weekly availability blocks, hiding slots that overlap a busy range. */
export function slotsForDate(
  date: Date,
  availability: { weekday: number; start_time: string; end_time: string }[],
  busy: BusyRange[] = [],
): Date[] {
  const out: Date[] = [];
  const blocks = availability.filter((a) => a.weekday === date.getDay());
  for (const b of blocks) {
    const sh = Number(b.start_time.split(":")[0]);
    const eh = Number(b.end_time.split(":")[0]);
    for (let h = sh; h + 1 <= eh; h++) {
      const d = new Date(date);
      d.setHours(h, 0, 0, 0);
      if (d.getTime() <= Date.now()) continue;
      const s = d.getTime();
      const e = s + SLOT_MINUTES * 60_000;
      const overlaps = busy.some((b) => {
        const bs = new Date(b.starts_at).getTime();
        return s < bs + b.duration_minutes * 60_000 && e > bs;
      });
      if (overlaps) continue;
      out.push(d);
    }
  }
  return out;
}
