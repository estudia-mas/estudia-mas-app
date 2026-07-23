"""
Branded HTML + plain-text transactional emails (Estudia Más).
"""
from __future__ import annotations

import logging
from typing import Any

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone

logger = logging.getLogger(__name__)


def frontend_base_url() -> str:
    return getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')


def email_public_base_url() -> str:
    return getattr(
        settings,
        'EMAIL_PUBLIC_BASE_URL',
        'http://127.0.0.1:8000',
    ).rstrip('/')


def email_logo_url() -> str:
    explicit = getattr(settings, 'EMAIL_LOGO_URL', '').strip()
    if explicit:
        return explicit
    return f'{email_public_base_url()}/static/brand/logo-estudia-mas.png'


def base_email_context() -> dict[str, Any]:
    base = frontend_base_url()
    return {
        'brand_name': getattr(settings, 'EMAIL_BRAND_NAME', 'Estudia Más'),
        'logo_url': email_logo_url(),
        'frontend_url': base,
        'login_url': f'{base}/login',
        'year': timezone.now().year,
        'support_email': getattr(settings, 'EMAIL_SUPPORT_ADDRESS', '').strip(),
    }


def send_branded_email(
    *,
    to_email: str,
    subject: str,
    template_name: str,
    context: dict[str, Any],
    plain_body: str,
) -> None:
    ctx = {**base_email_context(), 'subject': subject, **context}
    html_body = render_to_string(f'emails/{template_name}.html', ctx)
    message = EmailMultiAlternatives(
        subject,
        plain_body,
        settings.DEFAULT_FROM_EMAIL,
        [to_email],
    )
    message.attach_alternative(html_body, 'text/html')
    message.send(fail_silently=False)


def activation_link(*, uid: str, token: str) -> str:
    return f'{frontend_base_url()}/activate/{uid}/{token}/'


def password_reset_link(*, uid: str, token: str) -> str:
    return f'{frontend_base_url()}/password/reset/confirm/{uid}/{token}/'
