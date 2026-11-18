# Marco de Trabajo Ágil SCRUM — TUTEYA

* **Product Owner:** Prof. Edgar Morillo  
* **Scrum Master & Tech Lead:** Emanuel David Pérez Olaya  
* **Duración de Sprints:** 1 semana por Sprint (4 Sprints totales)  

---

## Product Backlog Priorizado
1. **HU-01:** Como usuario, quiero registrarme como estudiante o tutor con autenticación segura.
2. **HU-02:** Como estudiante, quiero filtrar tutores por materia, nivel, modalidad, zona geográfica, precio y disponibilidad.
3. **HU-03:** Como tutor, quiero configurar mi perfil, materias, tarifa y horarios disponibles.
4. **HU-04:** Como estudiante, quiero reservar una sesión sin que existan cruces de horario con otros estudiantes.
5. **HU-05:** Como tutor y estudiante, quiero conectarme a una sala de videoconferencia integrada al confirmar la reserva.
6. **HU-06:** Como estudiante, quiero recibir confirmación por correo y enlace directo de WhatsApp.
7. **HU-07:** Como estudiante, quiero calificar con estrellas y reseña al tutor al finalizar la sesión.
8. **HU-08:** Como estudiante, quiero usar IA generativa para recibir recomendaciones de tutores y un plan de estudio.
9. **HU-09 (Bonus):** Como estudiante y tutor, quiero solicitar y aceptar tutorías en tiempo real estilo Uber/Rappi ("Tutor YA").
10. **HU-10:** Como administrador, quiero aprobar perfiles de tutores y gestionar el catálogo de materias.

---

## Registro de Sprints, Reviews y Retrospectivas

### Sprint 1 — Cimientos, Base de Datos y Roles
* **Planning:** Definición del esquema relacional en Supabase, políticas RLS y rutas protegidas por rol.
* **Daily Highlights:** Se detectó necesidad de evitar que un tutor se auto-apruebe; se implementó trigger `guard_tutor_profile_update()`.
* **Review:** Demo de registro, login y panel administrativo funcional.
* **Retrospectiva:** Mantener migraciones SQL incrementales idempotentes para no perder datos de prueba.

### Sprint 2 — Catálogo de Tutores y Motor de Reservas
* **Planning:** Construcción de `/tutores`, perfil detallado `/tutores/$id` y calendario dinámico de slots.
* **Daily Highlights:** Se añadió `prevent_booking_overlap()` con `pg_advisory_xact_lock` para evitar condiciones de carrera en reservas simultáneas.
* **Review:** Validación de filtros multicriterio y flujo completo de reserva.
* **Retrospectiva:** Excelente rendimiento con TanStack Query; se prioriza la experiencia móvil.

### Sprint 3 — Videoconferencia, Notificaciones y Reputación
* **Planning:** Integración de Jitsi Meet HD, sistema de reseñas verificadas y notificaciones multicanal.
* **Daily Highlights:** Se integró modal de videollamada directa en `BookingList` y botón de WhatsApp con mensaje prellenado.
* **Review:** Prueba en vivo de sesión virtual y calificación post-tutoría.
* **Retrospectiva:** Preparar capa de servicios SOLID explícita para facilitar la sustentación técnica.

### Sprint 4 — IA Generativa, Modo "Tutor YA" y PWA
* **Planning:** Implementación de `AiTutorService`, radar en tiempo real con Supabase Realtime y manifiesto PWA.
* **Daily Highlights:** Se añadió motor híbrido (Gemini API + respaldo heurístico local) para garantizar disponibilidad del 100% en la sustentación.
* **Review:** Demostración integral de extremo a extremo en web y móvil.
* **Retrospectiva:** Proyecto listo para despliegue en producción y sustentación final.
