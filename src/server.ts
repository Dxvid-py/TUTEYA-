import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { SupabaseTutorRepository, TutorService } from "./services/tutor.service";
import { BookingService } from "./services/booking.service";
import { AiTutorService } from "./services/ai-tutor.service";
import { CompositeNotificationDispatcher } from "./services/notification.service";
import type { AiMatchRequest, NotificationPayload } from "./services/interfaces";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function handleApiRoutes(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return null;

  // Endpoint de diagnóstico RESTful
  if (url.pathname === "/api/health" && request.method === "GET") {
    return jsonResponse({
      status: "ok",
      service: "TUTEYA REST API",
      architecture: "SOLID (SRP, OCP, LSP, ISP, DIP)",
      timestamp: new Date().toISOString(),
    });
  }

  // GET /api/tutors -> Búsqueda RESTful de tutores
  if (url.pathname === "/api/tutors" && request.method === "GET") {
    const tutorService = new TutorService(new SupabaseTutorRepository());
    const q = url.searchParams.get("q") ?? undefined;
    const subject = url.searchParams.get("materia") ?? undefined;
    const modParam = url.searchParams.get("modalidad");
    const modality = modParam === "virtual" || modParam === "presencial" ? modParam : undefined;
    const city = url.searchParams.get("ciudad") ?? undefined;
    const maxParam = url.searchParams.get("max");
    const maxRate = maxParam ? Number(maxParam) : undefined;

    const criteria: Parameters<TutorService["search"]>[0] = {};
    if (q) criteria.q = q;
    if (subject) criteria.subject = subject;
    if (modality) criteria.modality = modality;
    if (city) criteria.city = city;
    if (maxRate && !Number.isNaN(maxRate)) criteria.maxRate = maxRate;

    const tutors = await tutorService.search(criteria);
    return jsonResponse({ count: tutors.length, tutors });
  }

  // GET /api/bookings -> Listado RESTful de reservas con enlace de sala virtual
  if (url.pathname === "/api/bookings" && request.method === "GET") {
    const bookingService = new BookingService();
    const bookings = await bookingService.listRecentBookings();
    return jsonResponse({ count: bookings.length, bookings });
  }

  // POST /api/ai-match -> Recomendador con IA Generativa + Plan de Estudio
  if (url.pathname === "/api/ai-match" && request.method === "POST") {
    try {
      const body = (await request.json()) as Partial<AiMatchRequest>;
      if (!body.prompt || typeof body.prompt !== "string" || body.prompt.trim().length < 3) {
        return jsonResponse({ error: "Escribe qué tema o materia necesitas reforzar." }, 400);
      }
      const advisor = new AiTutorService(new SupabaseTutorRepository());
      const aiReq: AiMatchRequest = { prompt: body.prompt.trim() };
      if (typeof body.maxBudget === "number") aiReq.maxBudget = body.maxBudget;
      if (body.modality === "virtual" || body.modality === "presencial" || body.modality === "ambas") {
        aiReq.modality = body.modality;
      }
      const result = await advisor.recommend(aiReq);
      return jsonResponse(result);
    } catch (err) {
      console.error("[/api/ai-match]", err);
      return jsonResponse({ error: "No se pudo procesar la recomendación IA." }, 500);
    }
  }

  // POST /api/notify -> Despacho de notificaciones (Correo + WhatsApp)
  if (url.pathname === "/api/notify" && request.method === "POST") {
    try {
      const body = (await request.json()) as Partial<NotificationPayload>;
      const dispatcher = new CompositeNotificationDispatcher();
      const payload: NotificationPayload = {
        recipientName: body.recipientName || "Estudiante",
        subjectName: body.subjectName || "Tutoría Académica",
        startsAtLabel: body.startsAtLabel || "Próxima sesión",
        meetingUrl: body.meetingUrl || "https://meet.jit.si/Tuteya-Clase",
        channel: body.channel ?? "both",
      };
      if (body.recipientEmail) payload.recipientEmail = body.recipientEmail;
      if (body.recipientPhone) payload.recipientPhone = body.recipientPhone;
      const result = await dispatcher.dispatch(payload);
      return jsonResponse(result);
    } catch (err) {
      console.error("[/api/notify]", err);
      return jsonResponse({ error: "Error al generar la notificación." }, 500);
    }
  }

  return null;
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const apiResponse = await handleApiRoutes(request);
      if (apiResponse) return apiResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
