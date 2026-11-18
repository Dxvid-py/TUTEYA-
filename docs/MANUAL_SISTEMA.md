# Manual Técnico del Sistema — TUTEYA

## 1. Arquitectura Tecnológica
* **Frontend & SSR:** React 19 + TypeScript (modo estricto) + TanStack Router / TanStack Start + Tailwind CSS + shadcn/ui.
* **Backend & API RESTful:** Endpoints HTTP en Edge/Node (`src/server.ts`) delegando en capas de servicio (`src/services/*`).
* **Base de Datos y Seguridad:** PostgreSQL en Supabase con Row Level Security (RLS), Triggers transaccionales y Supabase Realtime (WebSockets).
* **Videoconferencia:** Jitsi Meet API embebida (`meet.jit.si`).
* **IA Generativa:** Google Gemini (`gemini-2.5-flash`) con motor heurístico de respaldo.
* **Despliegue & Móvil:** Vercel (CI/CD automático desde GitHub) + Progressive Web App (`manifest.json` + Service Worker `sw.js`).

---

## 2. Aplicación de Principios SOLID
El backend y la capa de dominio (`src/services/`) están estructurados bajo los 5 principios SOLID:

1. **S — Single Responsibility Principle (Responsabilidad Única):**
   * `SupabaseTutorRepository` (`src/services/tutor.service.ts`): Únicamente consulta y mapea tutores desde PostgreSQL.
   * `BookingService` (`src/services/booking.service.ts`): Únicamente gestiona reglas de sesiones y generación determinística de salas Jitsi.
   * `AiTutorService` (`src/services/ai-tutor.service.ts`): Únicamente orquesta la recomendación con IA y planes de estudio.
   * `CompositeNotificationDispatcher` (`src/services/notification.service.ts`): Únicamente gestiona envíos de correo y enlaces WhatsApp.
2. **O — Open/Closed Principle (Abierto/Cerrado):**
   * Nuevos criterios de filtrado o proveedores de IA pueden añadirse extendiendo las interfaces sin modificar los controladores HTTP de `src/server.ts`.
3. **L — Liskov Substitution Principle (Sustitución de Liskov):**
   * Cualquier implementación de `INotificationDispatcher` o `IAiTutorAdvisor` (Gemini real o motor local) es intercambiable sin alterar el contrato de respuesta.
4. **I — Interface Segregation Principle (Segregación de Interfaces):**
   * `src/services/interfaces.ts` separa contratos específicos (`ITutorRepository`, `IAiTutorAdvisor`, `INotificationDispatcher`) evitando interfaces monolíticas.
5. **D — Dependency Inversion Principle (Inversión de Dependencias):**
   * `TutorService` y `AiTutorService` reciben `ITutorRepository` por inyección en el constructor en lugar de acoplarse directamente a la fuente de datos.

---

## 3. Endpoints de la API RESTful
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verifica estado del servidor y arquitectura SOLID. |
| `GET` | `/api/tutors` | Lista y filtra tutores aprobados (`q`, `materia`, `modalidad`, `ciudad`, `max`). |
| `GET` | `/api/bookings` | Lista reservas recientes con enlace de sala virtual integrado. |
| `POST` | `/api/ai-match` | Analiza solicitud en lenguaje natural con IA y devuelve plan de estudio + top tutores. |
| `POST` | `/api/notify` | Despacha notificación por correo (Resend) y genera enlace directo de WhatsApp. |

---

## 4. Modelo Entidad-Relación (PostgreSQL / Supabase)
* `profiles` (1) ─── (N) `user_roles` (`admin`, `tutor`, `student`)
* `profiles` (1) ─── (0..1) `tutor_profiles` (`headline`, `hourly_rate`, `modality`, `is_approved`, `is_online`)
* `tutor_profiles` (N) ─── (N) `subjects` a través de `tutor_subjects`
* `tutor_profiles` (1) ─── (N) `tutor_availability` (`weekday`, `start_time`, `end_time`)
* `bookings` relaciona `student_id`, `tutor_id`, `subject_id`, `starts_at`, `status`, `meeting_url`, `is_express` con trigger `prevent_booking_overlap()` que impide cruces de horario mediante bloqueo transaccional (`pg_advisory_xact_lock`).
* `reviews` vinculada 1:1 a `bookings` (solo habilitada por política RLS cuando `status = 'completada'`).
* `express_requests` habilitada en `supabase_realtime` para emparejamiento instantáneo tipo Uber/Rappi.
