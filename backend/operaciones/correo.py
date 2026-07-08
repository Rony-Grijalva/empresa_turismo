"""
Envío de correos transaccionales con doble vía (RF-05).

Problema: la capa gratuita de Render bloquea el tráfico SMTP saliente
(puerto 587), por lo que `send_mail` de Django nunca llega a Gmail en
producción. La API HTTP de Brevo (puerto 443, HTTPS) sí funciona en
Render gratuito y su plan free permite 300 correos/día.

Estrategia:
  1. Si `BREVO_API_KEY` está definida (producción en Render), se envía
     por la API HTTP de Brevo usando solo la librería estándar (urllib),
     sin dependencias nuevas.
  2. Si no está definida (desarrollo local), se usa el backend de correo
     de Django configurado en settings (SMTP de Gmail o consola).
"""
import json
import logging
import urllib.request
import urllib.error
from email.utils import parseaddr

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def enviar_correo(destinatario, asunto, mensaje):
    """Envía un correo de texto plano por Brevo (HTTP) o SMTP según configuración.

    Devuelve True si el envío se aceptó, False si falló. Nunca lanza excepciones:
    el correo es secundario y no debe interrumpir el flujo de la reserva.
    """
    api_key = getattr(settings, 'BREVO_API_KEY', '')
    try:
        if api_key:
            return _enviar_por_brevo(api_key, destinatario, asunto, mensaje)
        return _enviar_por_smtp(destinatario, asunto, mensaje)
    except Exception:
        logger.exception("Fallo inesperado enviando correo a %s", destinatario)
        return False


def _enviar_por_brevo(api_key, destinatario, asunto, mensaje):
    """Envía el correo vía la API transaccional de Brevo (HTTPS, funciona en Render free)."""
    nombre_remitente, email_remitente = parseaddr(
        getattr(settings, 'DEFAULT_FROM_EMAIL', 'reservas@grijalva.pe')
    )
    payload = {
        "sender": {
            "name": nombre_remitente or "Multiservicios Grijalva",
            "email": email_remitente,
        },
        "to": [{"email": destinatario}],
        "subject": asunto,
        "textContent": mensaje,
    }
    solicitud = urllib.request.Request(
        BREVO_API_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(solicitud, timeout=15) as respuesta:
            logger.info("Correo enviado por Brevo a %s (HTTP %s)", destinatario, respuesta.status)
            return True
    except urllib.error.HTTPError as error:
        detalle = error.read().decode('utf-8', errors='replace')
        logger.error("Brevo rechazó el correo a %s: HTTP %s — %s", destinatario, error.code, detalle)
        return False
    except urllib.error.URLError as error:
        logger.error("No se pudo conectar con Brevo: %s", error.reason)
        return False


def _enviar_por_smtp(destinatario, asunto, mensaje):
    """Envía el correo con el backend de Django (SMTP en local / consola en dev)."""
    enviados = send_mail(
        subject=asunto,
        message=mensaje,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'reservas@grijalva.pe'),
        recipient_list=[destinatario],
        fail_silently=True,
    )
    return bool(enviados)
