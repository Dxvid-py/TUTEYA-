# Manual de Usuario — Plataforma TUTEYA

**URL de Producción:** https://tuteya-tutor-online.vercel.app/  
**Compatibilidad:** Navegadores Web (Chrome, Edge, Safari, Firefox) y Dispositivos Móviles (instalable como App PWA desde el navegador).

---

## 1. Registro e Inicio de Sesión
1. Ingresa a **TUTEYA** y haz clic en **Crear cuenta**.
2. Selecciona tu rol: **Estudiante** o **Tutor**.
3. Completa tu nombre completo, correo electrónico y contraseña.
4. *(Nota del sistema)*: El primer usuario registrado en una instancia nueva asume automáticamente el rol de **Administrador** para gestionar aprobaciones.

---

## 2. Guía para el Estudiante
### 2.1 Búsqueda Tradicional y Filtros
1. Ve a **Buscar tutores** (`/tutores`).
2. Filtra por **materia**, **nivel educativo** (Primaria, Secundaria, Universidad), **modalidad** (Virtual o Presencial), **ciudad**, **tarifa máxima** y **día disponible**.
3. Haz clic en **Ver perfil y reservar**, selecciona fecha, bloque horario disponible y envía la solicitud.

### 2.2 Asistente Académico con IA Generativa
1. En **Buscar tutores** o en tu **Panel de Estudiante** (`/estudiante`), ubica el bloque **Asistente Académico con IA**.
2. Escribe en lenguaje natural tu necesidad (ej. *"Tengo parcial de Cálculo Integral el viernes y mi presupuesto es $45.000"*).
3. Haz clic en **Recomendar con IA** para obtener un **plan de estudio de 3 pasos** y los tutores con mayor porcentaje de compatibilidad.

### 2.3 Conexión Inmediata "Tutor YA" (Modo Express estilo Uber)
1. En tu panel (`/estudiante`), en la tarjeta **Tutor YA · Conexión Express**, elige la materia y el tema urgente.
2. Presiona **Pedir Tutor YA**. El sistema enviará una alerta en tiempo real a los tutores conectados.
3. En cuanto un tutor acepte, aparecerá el botón **Entrar a videollamada ahora**.

### 2.4 Videollamada Integrada, WhatsApp y Calificación
* En **Mis reservas** (`/reservas`), cuando el tutor confirme la sesión, presiona **Entrar a sala** para abrir la videollamada HD sin salir de TUTEYA.
* Usa el botón **WhatsApp** para enviar los detalles y enlace de la clase directamente al chat.
* Una vez marcada como **Completada**, presiona **Calificar** para asignar de 1 a 5 estrellas y dejar una reseña verificada.

---

## 3. Guía para el Tutor
1. **Completar Perfil Profesional** (`/tutor/perfil`): Define tu titular, biografía, años de experiencia, tarifa por hora, modalidad y materias.
2. **Configurar Disponibilidad** (`/tutor/agenda`): Agrega tus franjas horarias por día de la semana.
3. **Radar Tutor YA** (`/tutor`): Mantén activo el interruptor **En línea (Recibiendo)** para atender solicitudes express al instante.
4. **Gestionar Solicitudes** (`/reservas`): Acepta o rechaza solicitudes pendientes, ingresa a la sala virtual y marca las sesiones como **Completadas** al finalizar.

---

## 4. Guía para el Administrador
1. Accede al panel `/admin` para visualizar métricas globales.
2. En **Aprobar tutores** (`/admin/tutores`), verifica los perfiles nuevos antes de que sean visibles en el catálogo público.
3. En **Materias** (`/admin/materias`) y **Usuarios y roles** (`/admin/usuarios`), administra el catálogo académico y permisos.
