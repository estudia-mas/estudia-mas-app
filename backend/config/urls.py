"""URL configuration for Estudia Más."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
import os

admin.site.site_header = 'Estudia Más Admin'
admin.site.site_title = 'Estudia Más Admin'
admin.site.index_title = 'Administración'


def home(_request):
    return JsonResponse({'app': 'estudia-mas', 'status': 'ok'})


urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('api.urls')),
]

_serve_media = settings.DEBUG or os.getenv('DJANGO_SERVE_MEDIA', 'true').lower() in (
    '1',
    'true',
    'yes',
)
if _serve_media:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
