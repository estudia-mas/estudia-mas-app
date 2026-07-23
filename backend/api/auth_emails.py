"""
Transactional emails for activation and password reset (HTML + plain text).
"""
import logging

from .email_service import (
    activation_link,
    base_email_context,
    password_reset_link,
    send_branded_email,
)

logger = logging.getLogger(__name__)

BRAND = 'Estudia Más'


def send_activation_email(*, to_email: str, uid: str, token: str) -> None:
    link = activation_link(uid=uid, token=token)
    subject = f'Activa tu cuenta en {BRAND}'
    plain = (
        f'Gracias por registrarte en {BRAND}.\n\n'
        f'Activa tu cuenta con este enlace:\n{link}\n\n'
        f'Si no creaste esta cuenta, puedes ignorar este correo.'
    )
    send_branded_email(
        to_email=to_email,
        subject=subject,
        template_name='activation',
        context={
            'cta_url': link,
            'cta_text': 'Activar cuenta',
        },
        plain_body=plain,
    )


def send_activation_confirmed_email(
    *,
    to_email: str,
    user_name: str = '',
) -> None:
    ctx = base_email_context()
    subject = f'Cuenta activada — bienvenido a {BRAND}'
    plain = (
        f'Tu cuenta en {BRAND} está activa.\n\n'
        f'Inicia sesión: {ctx["login_url"]}\n\n'
        'Si no activaste tu cuenta, contacta a soporte.'
    )
    send_branded_email(
        to_email=to_email,
        subject=subject,
        template_name='activation_confirmed',
        context={
            'cta_url': ctx['login_url'],
            'cta_text': 'Iniciar sesión',
            'user_email': to_email,
            'user_name': user_name.strip(),
        },
        plain_body=plain,
    )


def send_password_reset_email(*, to_email: str, uid: str, token: str) -> None:
    link = password_reset_link(uid=uid, token=token)
    subject = f'Restablece tu contraseña — {BRAND}'
    plain = (
        f'Recibimos una solicitud para restablecer tu contraseña en {BRAND}.\n\n'
        f'Elige una nueva contraseña aquí:\n{link}\n\n'
        'Si no solicitaste este cambio, ignora este correo.'
    )
    send_branded_email(
        to_email=to_email,
        subject=subject,
        template_name='password_reset',
        context={
            'cta_url': link,
            'cta_text': 'Restablecer contraseña',
        },
        plain_body=plain,
    )


def send_password_changed_email(*, to_email: str) -> None:
    ctx = base_email_context()
    subject = f'Contraseña actualizada — {BRAND}'
    plain = (
        f'Tu contraseña en {BRAND} se actualizó correctamente.\n\n'
        f'Inicia sesión: {ctx["login_url"]}\n\n'
        'Si no realizaste este cambio, contacta a soporte de inmediato.'
    )
    send_branded_email(
        to_email=to_email,
        subject=subject,
        template_name='password_changed',
        context={
            'cta_url': ctx['login_url'],
            'cta_text': 'Iniciar sesión',
        },
        plain_body=plain,
    )


def send_activation_email_safe(*, to_email: str, uid: str, token: str) -> None:
    try:
        send_activation_email(to_email=to_email, uid=uid, token=token)
    except Exception:
        link = activation_link(uid=uid, token=token)
        logger.exception(
            'Activation email failed for %s; link (dev): %s',
            to_email,
            link,
        )


def send_password_reset_email_safe(*, to_email: str, uid: str, token: str) -> None:
    try:
        send_password_reset_email(to_email=to_email, uid=uid, token=token)
    except Exception:
        link = password_reset_link(uid=uid, token=token)
        logger.exception(
            'Password reset email failed for %s; link (dev): %s',
            to_email,
            link,
        )


def send_activation_confirmed_email_safe(
    *,
    to_email: str,
    user_name: str = '',
) -> None:
    try:
        send_activation_confirmed_email(to_email=to_email, user_name=user_name)
    except Exception:
        logger.exception('Activation confirmed email failed for %s', to_email)


def send_password_changed_email_safe(*, to_email: str) -> None:
    try:
        send_password_changed_email(to_email=to_email)
    except Exception:
        logger.exception('Password changed email failed for %s', to_email)
