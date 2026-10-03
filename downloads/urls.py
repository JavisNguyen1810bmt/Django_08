from django.http import JsonResponse
from django.urls import path
from .views import SecureDownloadView


def download_index(request):
    return JsonResponse({"message": "Downloads API is ready."})


app_name = 'downloads'

urlpatterns = [
    path('', download_index, name='index'),
    path('<int:product_id>/', SecureDownloadView.as_view(), name='secure_download'),
]