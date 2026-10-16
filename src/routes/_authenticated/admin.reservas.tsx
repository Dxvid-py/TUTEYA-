import { createFileRoute } from "@tanstack/react-router";
import { CalendarX } from "lucide-react";
import { PageTitle, RoleGate } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { BookingList } from "@/components/booking-list";
import { useBookings } from "@/lib/bookings";

export const Route = createFileRoute("/_authenticated/admin/reservas")({
  head: () => ({ meta: [{ title: "Todas las reservas — Tuteya" }, { name: "description", content: "Supervisión de reservas." }] }),
  component: () => (
    <RoleGate role="admin">
      <AllBookings />
    </RoleGate>
  ),
});

function AllBookings() {
  const { data = [], isLoading } = useBookings("all");
  return (
    <>
      <PageTitle title="Todas las reservas" text="Como administrador puedes corregir el estado de cualquier reserva." />
      {isLoading ? <div className="h-40 animate-pulse rounded-2xl bg-muted" /> : data.length === 0 ? (
        <EmptyState icon={CalendarX} title="Sin reservas" text="Todavía no se ha reservado ninguna tutoría." />
      ) : (
        <BookingList items={data} admin />
      )}
    </>
  );
}
