from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Product3D
from .serializers import CategorySerializer, Product3DSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class Product3DViewSet(viewsets.ModelViewSet):
    queryset = Product3D.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = Product3DSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'trending', 'collections']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(artist=self.request.user)

    @action(detail=False, methods=['get'], url_path='trending')
    def trending(self, request):
        queryset = self.get_queryset()[:8]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='collections')
    def collections(self, request):
        categories = Category.objects.all()[:3]
        payload = [
            {
                'name': category.name,
                'slug': category.slug,
                'count': category.products.count(),
            }
            for category in categories
        ]
        return Response(payload)