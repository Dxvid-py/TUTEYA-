import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Clock, Star, X } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSetStatus, type BookingRow } from "@/lib/bookings";
import { dateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function BookingList({ items, viewerId, admin }: { items: BookingRow[]; viewerId?: string | undefined; admin?: boolean }) {
  const setStatus = useSetStatus();
  const [reviewFor, setReviewFor] = useState<BookingRow | null>(null);
  return (
    <>
      <ul className="divide-y rounded-2xl border bg-card">
        {items.map((b) => {
          const asTutor = b.tutor_id === viewerId;
          const asStudent = b.student_id === viewerId;
          const other = asTutor ? b.student?.full_name : b.tutor?.profiles?.full_name;
          return (
            <li key={b.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <Clock className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {b.subject?.name ?? "Tutoría"}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {admin ? `${b.student?.full_name} con ${b.tutor?.profiles?.full_name}` : asTutor ? `con ${other} (estudiante)` : `con ${other}`}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {dateTime(b.starts_at)} · {b.duration_minutes} min · <span className="capitalize">{b.modality}</span>
                </p>
                {b.notes && <p className="mt-1 text-xs text-muted-foreground">“{b.notes}”</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={b.status} />
                {asTutor && b.status === "pendiente" && (
                  <>
                    <Button size="sm" className="rounded-full" onClick={() => setStatus(b.id, "confirmada", "Tutoría confirmada")}><Check className="size-4" /> Aceptar</Button>
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(b.id, "rechazada", "Solicitud rechazada")}><X className="size-4" /> Rechazar</Button>
                  </>
                )}
                {asTutor && b.status === "confirmada" && (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(b.id, "completada", "Marcada como completada")}>Marcar completada</Button>
                )}
                {(asStudent || asTutor) && ["pendiente", "confirmada"].includes(b.status) && (
                  <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => setStatus(b.id, "cancelada", "Reserva cancelada")}>Cancelar</Button>
                )}
                {asStudent && b.status === "completada" && b.review.length === 0 && (
                  <Button size="sm" variant="secondary" className="rounded-full" onClick={() => setReviewFor(b)}><Star className="size-4" /> Calificar</Button>
                )}
                {admin && (
                  <select
                    aria-label="Cambiar estado"
                    value={b.status}
                    onChange={(e) => setStatus(b.id, e.target.value as BookingRow["status"], "Estado actualizado")}
                    className="h-8 rounded-lg border bg-background px-2 text-xs"
                  >
                    {["pendiente", "confirmada", "rechazada", "cancelada", "completada"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <ReviewDialog booking={reviewFor} onClose={() => setReviewFor(null)} />
    </>
  );
}

function ReviewDialog({ booking, onClose }: { booking: BookingRow | null; onClose: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const qc = useQueryClient();
  async function submit() {
    if (!booking) return;
    const { error } = await supabase.from("reviews").insert({
      booking_id: booking.id,
      tutor_id: booking.tutor_id,
      student_id: booking.student_id,
      rating,
      comment: comment.trim() || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("¡Gracias por tu reseña!");
    qc.invalidateQueries();
    onClose();
  }
  return (
    <Dialog open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Califica tu tutoría</DialogTitle></DialogHeader>
        <div className="flex justify-center gap-1" role="radiogroup" aria-label="Calificación">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} role="radio" aria-checked={rating === i} aria-label={`${i} estrellas`} onClick={() => setRating(i)}>
              <Star className={cn("size-8", i <= rating ? "fill-warning text-warning" : "text-border")} />
            </button>
          ))}
        </div>
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Cuéntanos cómo te fue (opcional)" maxLength={600} />
        <Button onClick={submit} className="rounded-full">Publicar reseña</Button>
      </DialogContent>
    </Dialog>
  );
}
