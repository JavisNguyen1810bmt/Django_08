from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from products.views import CategoryViewSet, Product3DViewSet

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/models/', include(('products.urls', 'products_models'))),
    path('api/products/', include(('products.urls', 'products_public'))),
    path('api/categories/', CategoryViewSet.as_view({'get': 'list'}), name='api_categories'),
    path('api/collections/', Product3DViewSet.as_view({'get': 'collections'}), name='api_collections'),
    path('api/payments/', include('payments.urls')),
    path('api/downloads/', include('downloads.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)