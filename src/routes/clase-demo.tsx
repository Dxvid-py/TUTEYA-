import React, { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Video,
  Send,
  FileText,
  Clock,
  CheckCircle2,
  ExternalLink,
  UserCheck,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { PublicLayout } from "../components/site-chrome";
import { TutorAvatar } from "../components/tutor-avatar";
import { formatCOP } from "../lib/format-cop";

export const Route = createFileRoute("/clase-demo")({
  component: LiveDemoClassroomPage,
});

const JITSI_ROOM = "Tuteya-Clase-Demo-Calculo-2026";
const JITSI_URL = `https://meet.jit.si/${JITSI_ROOM}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true`;

interface ChatMessage {
  id: string;
  sender: string;
  role: "student" | "tutor";
  text: string;
  time: string;
}

function LiveDemoClassroomPage() {
  const [activeRole, setActiveRole] = useState<"student" | "tutor">("student");
  const [secondsElapsed, setSecondsElapsed] = useState(845); // 14:05 en curso
  const [boardText, setBoardText] = useState(
    "Tema: Derivadas por Regla de la Cadena\n\nEjercicio 1:\nf(x) = (3x² + 5x)^4\n\nPaso 1: Identificar función externa u^4 y función interna u = 3x² + 5x\nPaso 2: f'(x) = 4(3x² + 5x)^3 · (6x + 5)"
  );
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "Prof. Carlos Mendoza",
      role: "tutor",
      text: "¡Hola Valeria! Bienvenida a la sala virtual de Tuteya. Ya compartí el ejercicio en la pizarra.",
      time: "20:01",
    },
    {
      id: "2",
      sender: "Valeria Gómez",
      role: "student",
      text: "Hola profe, listo. Me quedaba duda justo en multiplicar por la derivada interna.",
      time: "20:02",
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
  const secs = String(secondsElapsed % 60).padStart(2, "0");

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: activeRole === "tutor" ? "Prof. Carlos Mendoza" : "Valeria Gómez",
        role: activeRole,
        text: trimmed,
        time: timeStr,
      },
    ]);
    setChatInput("");
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Barra superior de la clase en vivo */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3.5">
            <TutorAvatar
              name="Prof. Carlos Mendoza"
              src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
              size="md"
              online
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Clase en Vivo · Sala Real
                </span>
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  {formatCOP(45000, { perHour: true })}
                </span>
              </div>
              <h1 className="mt-1 font-serif text-lg sm:text-xl font-bold text-foreground">
                Cálculo Diferencial · Prof. Carlos Mendoza & Valeria Gómez
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Selector de vista dentro de la clase */}
            <div className="inline-flex rounded-xl border border-border bg-muted p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveRole("student")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
                  activeRole === "student"
                    ? "bg-background text-emerald-700 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                Vista Estudiante
              </button>
              <button
                type="button"
                onClick={() => setActiveRole("tutor")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
                  activeRole === "tutor"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 text-amber-300" />
                Vista Profesor
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground">
              <Clock className="h-3.5 w-3.5 text-emerald-700" />
              {mins}:{secs}
            </div>

            <a
              href={`https://meet.jit.si/${JITSI_ROOM}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir pantalla completa
            </a>
          </div>
        </div>

        {/* Grid principal: Videollamada Jitsi Real + Pizarra y Chat */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Videollamada real embebida */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
              <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900 px-4 py-2.5 text-xs text-zinc-300">
                <span className="flex items-center gap-2 font-medium">
                  <Video className="h-4 w-4 text-emerald-400" />
                  Videollamada HD Tuteya ({JITSI_ROOM})
                </span>
                <span className="text-zinc-400">
                  Cámara, micrófono y compartir pantalla activos
                </span>
              </div>
              <iframe
                src={JITSI_URL}
                title="Sala Virtual Tuteya"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="h-[460px] w-full border-0"
              />
            </div>

            {/* Pizarra / Apuntes compartidos de la sesión */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="h-4 w-4 text-emerald-700" />
                  Pizarra y apuntes en tiempo real
                </div>
                <span className="text-xs text-muted-foreground">
                  Editable por Profesor y Estudiante
                </span>
              </div>
              <textarea
                rows={6}
                value={boardText}
                onChange={(e) => setBoardText(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs sm:text-sm text-foreground focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Columna derecha: Chat de clase + Resumen de reserva en COP */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Resumen de la tutoría en COP */}
            <div className="rounded-2xl border border-emerald-600/25 bg-emerald-500/5 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Detalle de la tutoría
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Confirmada
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-muted-foreground">Valor sesión (60 min):</span>
                <span className="text-lg font-bold text-foreground">
                  {formatCOP(45000)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Conectado actualmente como:{" "}
                <strong className="text-foreground">
                  {activeRole === "tutor" ? "Prof. Carlos Mendoza" : "Valeria Gómez (Estudiante)"}
                </strong>
              </p>
              <div className="pt-1 flex gap-2">
                <Link
                  to={"/estudiante" as any}
                  className="flex-1 rounded-xl border border-border bg-background py-2 text-center text-xs font-semibold text-foreground hover:border-emerald-600 transition-colors"
                >
                  Ir a Panel Estudiante
                </Link>
                <Link
                  to={"/tutor" as any}
                  className="flex-1 rounded-xl bg-emerald-700 py-2 text-center text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
                >
                  Ir a Panel Profesor
                </Link>
              </div>
            </div>

            {/* Chat en vivo de la sala */}
            <div className="flex flex-1 flex-col rounded-2xl border border-border bg-card p-4 shadow-xs">
              <div className="mb-3 flex items-center gap-2 border-b border-border pb-2.5 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Chat de la clase
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-72 pr-1">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-xl p-3 text-xs ${
                      m.role === "tutor"
                        ? "bg-emerald-500/10 border border-emerald-600/20"
                        : "bg-muted border border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-foreground mb-1">
                      <span>{m.sender}</span>
                      <span className="text-[10px] text-muted-foreground">{m.time}</span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="mt-3 flex gap-2 pt-2 border-t border-border">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Escribir como ${
                    activeRole === "tutor" ? "Profesor" : "Estudiante"
                  }...`}
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-3 py-2 text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
