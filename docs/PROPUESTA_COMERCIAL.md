# Propuesta Comercial y Estimación de Proyecto — TUTEYA

**Cliente / Product Owner:** Prof. Edgar Morillo  
**Líder Técnico & Desarrollador:** Emanuel David Pérez Olaya  
**Producto:** TUTEYA — Plataforma Web y Móvil (PWA) de Tutorías en Línea y Presenciales con IA  

---

## 1. Resumen Ejecutivo
**TUTEYA** es una plataforma SaaS educativa diseñada para conectar en segundos a estudiantes de colegio y universidad con tutores verificados en modalidad virtual (videoconferencia HD integrada) o presencial geolocalizada. Incorpora un **Asistente Académico con Inteligencia Artificial Generativa** para recomendación inteligente y generación de planes de estudio, además de un módulo **Tutor YA (conexión en tiempo real estilo Uber/Rappi)**.

---

## 2. Estimación de Tiempos (Cronograma Ágil — 4 Sprints)

| Fase / Sprint | Duración | Entregables Clave | Horas Estimadas |
| :--- | :--- | :--- | :---: |
| **Sprint 1: Arquitectura y BD** | Semana 1 | Diseño Relacional PostgreSQL/Supabase, RLS, Roles (`admin`, `tutor`, `student`), Autenticación SSR. | 28 h |
| **Sprint 2: Catálogo y Reservas** | Semana 2 | Búsqueda multicriterio, perfiles de tutor, disponibilidad semanal, prevención de solapamiento de horarios. | 32 h |
| **Sprint 3: Videollamada y Notificaciones** | Semana 3 | Sala virtual Jitsi Meet integrada, notificaciones por Correo (Resend) y enlaces dinámicos WhatsApp, panel Admin. | 30 h |
| **Sprint 4: IA Generativa, Tutor YA y PWA** | Semana 4 | Recomendador IA + Plan de Estudio, Radar Express en tiempo real (Supabase Realtime), PWA móvil y QA. | 30 h |
| **TOTAL** | **4 Semanas** | **Sistema Completo Desplegado en Producción** | **120 horas** |

---

## 3. Presupuesto de Desarrollo e Infraestructura

### 3.1 Costos de Desarrollo de Software
* **Tarifa Ingeniería Full-Stack / Arquitectura Cloud:** $65.000 COP / hora ($16 USD/h)
* **Total Mano de Obra (120 horas):** **$7.800.000 COP** (~$1.920 USD)

### 3.2 Costos Operativos Mensuales (Infraestructura Cloud)
| Servicio | Proveedor | Plan | Costo Mensual |
| :--- | :--- | :--- | :---: |
| Hosting Frontend + API REST Edge | Vercel | Pro / Hobby | $0 – $80.000 COP |
| Base de Datos PostgreSQL + Auth + Realtime | Supabase | Free / Pro | $0 – $100.000 COP |
| Videoconferencia Integrada | Jitsi Meet API | Open Source | $0 COP |
| IA Generativa (Matchmaking y Planes) | Google Gemini API | Pay-as-you-go | ~$25.000 COP |
| Correo Transaccional | Resend | Free Tier (3.000/mes) | $0 COP |
| **Total Operación Mensual Estimada** | | | **$25.000 – $205.000 COP/mes** |

---

## 4. Modelo de Monetización y Retorno de Inversión (ROI)
1. **Comisión por Tutoría Completada (Take Rate 15%):** Sobre una tarifa promedio de $45.000 COP/hora, TUTEYA retiene $6.750 COP por sesión.
2. **Punto de Equilibrio:** Con **31 tutorías al mes** (~1 diaria), la plataforma cubre el 100% de su infraestructura operativa. Con **400 tutorías mensuales**, recupera la inversión total de desarrollo en menos de **3 meses**.
