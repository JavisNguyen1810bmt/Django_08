from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Category, Collection, Model3D
from .serializers import CategorySerializer, CollectionSerializer, Model3DSerializer


class Model3DViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = Model3DSerializer
    lookup_field = "slug"
    search_fields = ["title", "description", "creator", "category__name"]
    ordering_fields = ["created_at", "likes", "views", "title"]

    def get_queryset(self):
        queryset = Model3D.objects.select_related("category").all()
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__slug=category)
        if self.request.query_params.get("featured", "").lower() in {"1", "true", "yes"}:
            queryset = queryset.filter(featured=True)
        return queryset

    @action(detail=False, methods=["get"])
    def trending(self, request):
        queryset = self.get_queryset().order_by("-likes", "-views")[:12]
        return Response(self.get_serializer(queryset, many=True).data)


class CategoryViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "slug"


class CollectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Collection.objects.prefetch_related("models__category").all()
    serializer_class = CollectionSerializer
    lookup_field = "slug"
    search_fields = ["title", "description", "curator"]
