import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Bot, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/format";
import type { AiMatchResponse } from "@/services/interfaces";

export function AiTutorAssistant() {
  const [prompt, setPrompt] = useState("");
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiMatchResponse | null>(null);

  async function handleAskAi(e: React.FormEvent) {
    e.preventDefault();
    if (prompt.trim().length < 3) {
      toast.error("Describe brevemente qué materia o tema necesitas preparar.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          ...(maxBudget ? { maxBudget: Number(maxBudget) } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo consultar el asistente IA.");
        return;
      }
      setResult(data as AiMatchResponse);
      toast.success("Plan de estudio y tutores recomendados listos");
    } catch {
      toast.error("Error de red al consultar la IA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-secondary/30 p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Bot className="size-5" />
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              Asistente Académico con IA <Sparkles className="size-4 text-primary" />
            </h2>
            <p className="text-xs text-muted-foreground">
              Cuéntale qué tema tienes difícil y tu presupuesto: te recomienda tutores y arma tu plan de estudio.
            </p>
          </div>
        </div>
        {result && (
          <span className="rounded-full border bg-background px-3 py-1 text-[11px] font-semibold text-muted-foreground">
            Motor: {result.provider === "gemini" ? "Gemini AI" : "Tuteya Smart AI"}
          </span>
        )}
      </div>

      <form onSubmit={handleAskAi} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Tengo parcial de Cálculo Integral el viernes, no entiendo derivadas ni integrales..."
          className="h-11 flex-1 rounded-xl border bg-background px-4 text-sm outline-none focus:border-primary"
        />
        <input
          type="number"
          min={5}
          value={maxBudget}
          onChange={(e) => setMaxBudget(e.target.value)}
          placeholder="Presupuesto máx ($)"
          className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary sm:w-44"
        />
        <Button type="submit" disabled={loading} className="h-11 rounded-xl px-5">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          Recomendar con IA
        </Button>
      </form>

      {result && (
        <div className="mt-6 grid gap-6 border-t pt-5 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Plan de estudio sugerido · {result.detectedSubject}
            </p>
            <ul className="space-y-2">
              {result.studyPlan.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 rounded-xl bg-background/80 p-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Tutores ideales para tu caso ({result.recommendations.length})
            </p>
            {result.recommendations.length === 0 ? (
              <p className="rounded-xl bg-background/80 p-4 text-sm text-muted-foreground">
                Aún no hay tutores aprobados en esa especialidad, pero puedes usar el plan de estudio en tu próxima reserva.
              </p>
            ) : (
              <div className="space-y-2.5">
                {result.recommendations.map(({ tutor, matchScore, reason }) => (
                  <div
                    key={tutor.user_id}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-background p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-bold">{tutor.name}</p>
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                          {matchScore}% match
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{reason}</p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">{money(tutor.hourly_rate)} / hora</p>
                    </div>
                    <Button asChild size="sm" className="shrink-0 rounded-full">
                      <Link to="/tutores/$id" params={{ id: tutor.user_id }}>
                        Reservar <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
