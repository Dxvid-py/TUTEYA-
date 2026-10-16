import { describe, expect, it } from "vitest";
import { slotsForDate } from "@/lib/format";

// Fecha futura fija: lunes (weekday = 1) dentro de ~1 año.
function nextMonday(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  d.setHours(0, 0, 0, 0);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return d;
}

const availability = [{ weekday: 1, start_time: "15:00:00", end_time: "18:00:00" }];

describe("slotsForDate", () => {
  it("genera un hueco por hora dentro del bloque semanal", () => {
    const slots = slotsForDate(nextMonday(), availability, []);
    expect(slots.map((s) => s.getHours())).toEqual([15, 16, 17]);
  });

  it("no genera huecos si el día no tiene disponibilidad", () => {
    const tuesday = new Date(nextMonday());
    tuesday.setDate(tuesday.getDate() + 1);
    expect(slotsForDate(tuesday, availability, [])).toEqual([]);
  });

  it("oculta un hueco ocupado exacto", () => {
    const day = nextMonday();
    const busy = new Date(day);
    busy.setHours(16, 0, 0, 0);
    const slots = slotsForDate(day, availability, [{ starts_at: busy.toISOString(), duration_minutes: 60 }]);
    expect(slots.map((s) => s.getHours())).toEqual([15, 17]);
  });

  it("oculta huecos que se solapan con una reserva de 90 minutos", () => {
    const day = nextMonday();
    const busy = new Date(day);
    busy.setHours(15, 30, 0, 0); // 15:30 – 17:00 solapa con 15:00 y 16:00
    const slots = slotsForDate(day, availability, [{ starts_at: busy.toISOString(), duration_minutes: 90 }]);
    expect(slots.map((s) => s.getHours())).toEqual([17]);
  });

  it("no ofrece huecos en el pasado", () => {
    const past = new Date();
    past.setFullYear(past.getFullYear() - 1);
    const av = [{ weekday: past.getDay(), start_time: "00:00:00", end_time: "23:00:00" }];
    expect(slotsForDate(past, av, [])).toEqual([]);
  });
});
