from django.http import JsonResponse


def home(_request):
    return JsonResponse({'app': 'estudia-mas', 'status': 'ok'})
