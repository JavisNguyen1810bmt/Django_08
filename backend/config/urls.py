from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from library.views import CategoryViewSet, CollectionViewSet, Model3DViewSet

router = DefaultRouter()
router.register("models", Model3DViewSet, basename="model")
router.register("categories", CategoryViewSet, basename="category")
router.register("collections", CollectionViewSet, basename="collection")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]
