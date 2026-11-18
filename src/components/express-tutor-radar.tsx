import { useEffect, useState } from "react";
import { Check, Loader2, Radio, Video, Zap, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BookingService } from "@/services/booking.service";

export type ExpressPing = {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  topic: string;
  createdAt: string;
};

// Componente de Reserva en Tiempo Real estilo Uber / Rappi ("Tutor YA")
export function ExpressStudentWidget({
  onOpenRoom,
}: {
  onOpenRoom: (roomUrl: string, title: string) => void;
}) {
  const { user, fullName } = useAuth();
  const [subject, setSubject] = useState("Matemáticas");
  const [topic, setTopic] = useState("");
  const [searching, setSearching] = useState(false);
  const [activePingId, setActivePingId] = useState<string | null>(null);
  const [acceptedBy, setAcceptedBy] = useState<{ tutorName: string; roomUrl: string } | null>(null);

  useEffect(() => {
    if (!activePingId) return;

    const channel = supabase
      .channel("tuteya-express-radar")
      .on("broadcast", { event: "express-accepted" }, ({ payload }) => {
        if (payload?.pingId === activePingId) {
          setSearching(false);
          setAcceptedBy({
            tutorName: String(payload.tutorName || "Tutor Tuteya"),
            roomUrl: String(payload.roomUrl),
          });
          toast.success(`¡${payload.tutorName} aceptó tu Tutoría YA!`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activePingId]);

  async function requestTutorNow(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Inicia sesión para pedir un tutor en tiempo real.");
      return;
    }
    if (topic.trim().length < 3) {
      toast.error("Escribe brevemente qué tema necesitas resolver ahora.");
      return;
    }

    const pingId = crypto.randomUUID();
    setActivePingId(pingId);
    setAcceptedBy(null);
    setSearching(true);

    const ping: ExpressPing = {
      id: pingId,
      studentId: user.id,
      studentName: fullName || "Estudiante",
      subject,
      topic: topic.trim(),
      createdAt: new Date().toISOString(),
    };

    const channel = supabase.channel("tuteya-express-radar");
    await channel.subscribe();
    await channel.send({
      type: "broadcast",
      event: "express-request",
      payload: ping,
    });

    toast.info("Buscando tutores conectados en tiempo real...");
  }

  function cancelSearch() {
    setSearching(false);
    setActivePingId(null);
    toast.message("Búsqueda express cancelada");
  }

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card to-primary/10 p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-2xl bg-amber-500 text-white">
            <Zap className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold">Tutor YA · Conexión Express (Estilo Uber)</h2>
            <p className="text-xs text-muted-foreground">
              ¿Necesitas ayuda urgente para un taller o quiz? Conecta en vivo con un tutor disponible ahora mismo.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <span className="size-2 animate-ping rounded-full bg-emerald-500" /> Radar en vivo
        </span>
      </div>

      {acceptedBy ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
          <div>
            <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
              ¡Tu tutor {acceptedBy.tutorName} ya está listo en la sala virtual!
            </p>
            <p className="text-xs text-muted-foreground">Materia: {subject} · Tema: {topic}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="rounded-full"
              onClick={() => onOpenRoom(acceptedBy.roomUrl, `Tutoría Express: ${subject}`)}
            >
              <Video className="size-4" /> Entrar a videollamada ahora
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setAcceptedBy(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : searching ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-background p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="size-6 animate-spin text-primary" />
            <div>
              <p className="text-sm font-bold">Notificando a tutores disponibles de {subject}...</p>
              <p className="text-xs text-muted-foreground">Tema: “{topic}” · Esperando aceptación inmediata</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={cancelSearch}>
            <X className="size-4" /> Cancelar
          </Button>
        </div>
      ) : (
        <form onSubmit={requestTutorNow} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-11 rounded-xl border bg-background px-3 text-sm font-medium outline-none focus:border-primary"
          >
            {["Matemáticas", "Física", "Química", "Programación", "Inglés", "Estadística", "Contabilidad"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="¿Qué necesitas resolver ya? Ej: Derivadas implícitas, bug en Python..."
            className="h-11 flex-1 rounded-xl border bg-background px-4 text-sm outline-none focus:border-primary"
          />
          <Button type="submit" className="h-11 rounded-xl bg-amber-500 px-5 font-bold text-white hover:bg-amber-600">
            <Zap className="size-4" /> Pedir Tutor YA
          </Button>
        </form>
      )}
    </div>
  );
}

export function ExpressTutorRadarReceiver({
  onOpenRoom,
}: {
  onOpenRoom: (roomUrl: string, title: string) => void;
}) {
  const { user, fullName } = useAuth();
  const [online, setOnline] = useState(true);
  const [incoming, setIncoming] = useState<ExpressPing[]>([]);

  useEffect(() => {
    if (!online || !user) return;

    const channel = supabase
      .channel("tuteya-express-radar")
      .on("broadcast", { event: "express-request" }, ({ payload }) => {
        const ping = payload as ExpressPing;
        if (!ping?.id || ping.studentId === user.id) return;
        setIncoming((prev) => (prev.some((x) => x.id === ping.id) ? prev : [ping, ...prev]));
        toast.info(`⚡ Nueva solicitud express de ${ping.studentName} (${ping.subject})`);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [online, user]);

  async function acceptPing(ping: ExpressPing) {
    if (!user) return;
    const roomUrl = BookingService.buildJitsiRoomUrl(`express-${ping.id}`);
    const channel = supabase.channel("tuteya-express-radar");
    await channel.subscribe();
    await channel.send({
      type: "broadcast",
      event: "express-accepted",
      payload: {
        pingId: ping.id,
        tutorId: user.id,
        tutorName: fullName || "Tutor Tuteya",
        roomUrl,
      },
    });
    setIncoming((prev) => prev.filter((x) => x.id !== ping.id));
    toast.success("¡Solicitud express aceptada! Abriendo sala virtual...");
    onOpenRoom(roomUrl, `Tutoría Express con ${ping.studentName} · ${ping.subject}`);
  }

  return (
    <div className="mb-6 rounded-3xl border border-primary/30 bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`grid size-10 place-items-center rounded-2xl ${online ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}
          >
            <Radio className="size-5" />
          </div>
          <div>
            <h2 className="font-extrabold">Radar Tutor YA (Solicitudes en Tiempo Real)</h2>
            <p className="text-xs text-muted-foreground">
              {online
                ? "Estás en línea recibiendo solicitudes inmediatas tipo Uber/Rappi."
                : "Modo inmediato pausado. Actívalo para recibir estudiantes al instante."}
            </p>
          </div>
        </div>
        <Button
          variant={online ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setOnline((v) => !v)}
        >
          {online ? "🟢 En línea (Recibiendo)" : "⚪ Activar Modo Express"}
        </Button>
      </div>

      {incoming.length > 0 && (
        <ul className="mt-4 space-y-2.5 border-t pt-4">
          {incoming.map((ping) => (
            <li
              key={ping.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5"
            >
              <div>
                <p className="text-sm font-extrabold">
                  ⚡ {ping.studentName} necesita ayuda urgente en {ping.subject}
                </p>
                <p className="text-xs text-muted-foreground">Tema: “{ping.topic}”</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="rounded-full" onClick={() => acceptPing(ping)}>
                  <Check className="size-4" /> Aceptar ahora
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setIncoming((prev) => prev.filter((x) => x.id !== ping.id))}
                >
                  Omitir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
