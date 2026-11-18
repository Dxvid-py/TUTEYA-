import type { INotificationDispatcher, NotificationPayload, NotificationResult } from "./interfaces";

// Principio de Responsabilidad Única (SRP) y Sustitución de Liskov (LSP)
export class CompositeNotificationDispatcher implements INotificationDispatcher {
  static buildWhatsAppUrl(payload: NotificationPayload): string {
    const cleanPhone = (payload.recipientPhone ?? "").replace(/[^0-9]/g, "");
    const targetPhone = cleanPhone.startsWith("57") ? cleanPhone : cleanPhone ? `57${cleanPhone}` : "";
    const msg = encodeURIComponent(
      `¡Hola ${payload.recipientName}! Tu tutoría de *${payload.subjectName}* en *TUTEYA* está programada para *${payload.startsAtLabel}*. Enlace de sala virtual: ${payload.meetingUrl}`,
    );
    return targetPhone ? `https://wa.me/${targetPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
  }

  async dispatch(payload: NotificationPayload): Promise<NotificationResult> {
    const whatsappUrl = CompositeNotificationDispatcher.buildWhatsAppUrl(payload);
    let emailSent = false;
    let providerMessage = "Enlace de WhatsApp generado correctamente.";

    const resendKey = process.env["RESEND_API_KEY"];
    if (resendKey && payload.recipientEmail && (payload.channel === "email" || payload.channel === "both")) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "TUTEYA <notificaciones@tuteya.app>",
            to: [payload.recipientEmail],
            subject: `Confirmación de Tutoría: ${payload.subjectName} — TUTEYA`,
            html: `<h2>¡Hola ${payload.recipientName}!</h2>
              <p>Tu sesión de <strong>${payload.subjectName}</strong> ha sido registrada para <strong>${payload.startsAtLabel}</strong>.</p>
              <p><a href="${payload.meetingUrl}">Entrar a la sala virtual de videoconferencia</a></p>`,
          }),
        });
        emailSent = res.ok;
        providerMessage = emailSent
          ? "Correo enviado vía Resend y enlace de WhatsApp listo."
          : "Notificación registrada y enlace de WhatsApp listo.";
      } catch {
        providerMessage = "Notificación registrada en plataforma y enlace de WhatsApp listo.";
      }
    }

    return {
      emailSent,
      whatsappUrl,
      providerMessage,
    };
  }
}
