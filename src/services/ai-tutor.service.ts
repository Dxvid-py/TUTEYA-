import type {
  AiMatchRequest,
  AiMatchResponse,
  AiRecommendedTutor,
  IAiTutorAdvisor,
  ITutorRepository,
  TutorSummary,
} from "./interfaces";

// Principio de Responsabilidad Única (SRP) e Inversión de Dependencias (DIP)
export class AiTutorService implements IAiTutorAdvisor {
  constructor(private readonly tutorRepository: ITutorRepository) {}

  async recommend(request: AiMatchRequest): Promise<AiMatchResponse> {
    const tutors = await this.tutorRepository.findApprovedTutors();
    const geminiKey = process.env["GEMINI_API_KEY"];

    if (geminiKey && tutors.length > 0) {
      try {
        const aiResult = await this.callGemini(geminiKey, request, tutors);
        if (aiResult) return aiResult;
      } catch (err) {
        console.warn("[AiTutorService] Fallback a motor heurístico local:", err);
      }
    }

    return this.localSmartMatch(request, tutors);
  }

  private async callGemini(
    apiKey: string,
    request: AiMatchRequest,
    tutors: TutorSummary[],
  ): Promise<AiMatchResponse | null> {
    const catalog = tutors.slice(0, 15).map((t) => ({
      user_id: t.user_id,
      name: t.name,
      subjects: t.subjects,
      headline: t.headline,
      rate: t.hourly_rate,
      modality: t.modality,
      rating: t.rating,
      experience: t.experience_years,
    }));

    const systemPrompt = `Eres el asesor académico de IA de TUTEYA. Analiza la necesidad del estudiante y devuelve ÚNICAMENTE un JSON válido (sin markdown) con la estructura:
{
  "detectedSubject": "Nombre de la materia",
  "studyPlan": ["Paso 1 concreto", "Paso 2 concreto", "Paso 3 concreto"],
  "matches": [
    { "user_id": "id_del_tutor", "matchScore": 95, "reason": "Explicación breve en español de por qué encaja" }
  ]
}
Elige hasta 3 tutores del catálogo proporcionado. Catálogo: ${JSON.stringify(catalog)}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemPrompt}

Solicitud del estudiante: "${request.prompt}". Presupuesto máximo: ${request.maxBudget ?? "sin límite"}. Modalidad preferida: ${request.modality ?? "cualquiera"}.`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.3 },
        }),
      },
    );

    if (!res.ok) return null;
    const data = await res.json();
    const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as {
      detectedSubject?: string;
      studyPlan?: string[];
      matches?: { user_id: string; matchScore: number; reason: string }[];
    };

    const recommendations: AiRecommendedTutor[] = (parsed.matches ?? [])
      .map((m) => {
        const tutor = tutors.find((t) => t.user_id === m.user_id);
        if (!tutor) return null;
        return {
          tutor,
          matchScore: Math.min(99, Math.max(70, Number(m.matchScore) || 88)),
          reason: m.reason || "Perfil altamente compatible con tu objetivo académico.",
        };
      })
      .filter((x): x is AiRecommendedTutor => x !== null);

    return {
      recommendations: recommendations.length > 0 ? recommendations : this.localSmartMatch(request, tutors).recommendations,
      studyPlan:
        Array.isArray(parsed.studyPlan) && parsed.studyPlan.length > 0
          ? parsed.studyPlan.slice(0, 4)
          : this.buildDefaultStudyPlan(parsed.detectedSubject || "la materia"),
      detectedSubject: parsed.detectedSubject || "Asesoría personalizada",
      provider: "gemini",
    };
  }

  private localSmartMatch(request: AiMatchRequest, tutors: TutorSummary[]): AiMatchResponse {
    const text = request.prompt.toLowerCase();
    const keywords = text.split(/[^a-záéíóúñ0-9]+/).filter((w) => w.length > 3);

    const subjectSynonyms: Record<string, string[]> = {
      Matemáticas: ["calculo", "cálculo", "algebra", "álgebra", "derivadas", "integrales", "ecuaciones", "matematica"],
      Programación: ["codigo", "código", "python", "java", "javascript", "react", "sql", "algoritmos", "software"],
      Física: ["fisica", "física", "mecanica", "mecánica", "termodinamica", "vectores", "cinematica"],
      Inglés: ["ingles", "inglés", "english", "speaking", "gramatica", "toefl", "ielts"],
      Química: ["quimica", "química", "estequiometria", "organica", "mol"],
      Estadística: ["estadistica", "estadística", "probabilidad", "datos", "regresion"],
      Contabilidad: ["contabilidad", "finanzas", "balance", "costos", "impuestos"],
    };

    let detectedSubject = "Tutoría General";
    for (const [sub, syns] of Object.entries(subjectSynonyms)) {
      if (syns.some((s) => text.includes(s))) {
        detectedSubject = sub;
        break;
      }
    }

    const scored: AiRecommendedTutor[] = tutors
      .map((t) => {
        let score = 72;
        const reasons: string[] = [];

        if (t.subjects.some((s) => s.toLowerCase() === detectedSubject.toLowerCase())) {
          score += 18;
          reasons.push(`Especialista en ${detectedSubject}`);
        } else if (
          keywords.some(
            (kw) =>
              t.headline.toLowerCase().includes(kw) ||
              t.bio.toLowerCase().includes(kw) ||
              t.subjects.some((s) => s.toLowerCase().includes(kw)),
          )
        ) {
          score += 12;
          reasons.push("Experiencia directa en los temas que mencionas");
        }

        if (request.maxBudget && t.hourly_rate <= request.maxBudget) {
          score += 6;
          reasons.push("Se ajusta a tu presupuesto");
        }

        if (request.modality && request.modality !== "ambas" && (t.modality === request.modality || t.modality === "ambas")) {
          score += 4;
          reasons.push(`Disponible en modalidad ${request.modality}`);
        }

        if (t.rating && t.rating >= 4.5) {
          score += 3;
          reasons.push(`Excelente reputación (${t.rating.toFixed(1)}★)`);
        }

        return {
          tutor: t,
          matchScore: Math.min(99, score),
          reason: reasons.length > 0 ? reasons.join(" · ") : "Tutor verificado con disponibilidad inmediata.",
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    return {
      recommendations: scored,
      studyPlan: this.buildDefaultStudyPlan(detectedSubject),
      detectedSubject,
      provider: "tuteya-smart-engine",
    };
  }

  private buildDefaultStudyPlan(subject: string): string[] {
    return [
      `Diagnóstico rápido (15 min): Revisión de conceptos base y ejercicios clave de ${subject}.`,
      `Práctica guiada (30 min): Resolución paso a paso de problemas tipo parcial con retroalimentación en vivo.`,
      `Cierre y plan autónomo (15 min): Resumen de fórmulas/reglas críticas y 3 ejercicios de refuerzo.`,
    ];
  }
}
