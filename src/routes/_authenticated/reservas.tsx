import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarX } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { BookingList } from "@/components/booking-list";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useBookings } from "@/lib/bookings";
import { STATUS_LABEL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/reservas")({
  head: () => ({ meta: [{ title: "Reservas — Tuteya" }, { name: "description", content: "Gestiona tus tutorías." }] }),
  component: ReservasPage,
});

function ReservasPage() {
  const { user, hasRole } = useAuth();
  const { data = [], isLoading } = useBookings("mine", user?.id);
  const [filter, setFilter] = useState<string>("todas");
  const items = filter === "todas" ? data : data.filter((b) => b.status === filter);
  return (
    <>
      <PageTitle
        title={hasRole("tutor") ? "Solicitudes y sesiones" : "Mis reservas"}
        text="Historial completo con su estado actual."
        action={hasRole("student") ? <Button asChild className="rounded-full"><Link to="/tutores">Nueva reserva</Link></Button> : undefined}
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {["todas", ...Object.keys(STATUS_LABEL)].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${filter === s ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`}
          >
            {s === "todas" ? "Todas" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      ) : items.length === 0 ? (
        <EmptyState icon={CalendarX} title="No hay reservas aquí" text="Cuando reserves o recibas solicitudes, aparecerán en esta lista." />
      ) : (
        <BookingList items={items} viewerId={user?.id} />
      )}
    </>
  );
}
