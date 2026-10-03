from django.http import JsonResponse
from django.urls import path
from .views import CategoryViewSet, Product3DViewSet


def product_index(request):
    return JsonResponse({"message": "Products API is ready."})


urlpatterns = [
    path('', Product3DViewSet.as_view({'get': 'list', 'post': 'create'}), name='product-list'),
    path('trending/', Product3DViewSet.as_view({'get': 'trending'}), name='product-trending'),
    path('collections/', Product3DViewSet.as_view({'get': 'collections'}), name='product-collections'),
    path('categories/', CategoryViewSet.as_view({'get': 'list'}), name='category-list'),
    path('<slug:slug>/', Product3DViewSet.as_view({'get': 'retrieve'}), name='product-detail'),
]