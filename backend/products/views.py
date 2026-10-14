from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.text import slugify
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
    search_fields = ['title', 'description', 'artist__username']
    ordering_fields = ['created_at', 'price', 'title']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'trending', 'collections']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        price = self.request.query_params.get('price')

        if category and category != 'all':
            queryset = queryset.filter(category__slug=category)
        if price == 'free':
            queryset = queryset.filter(price=0)
        elif price == 'paid':
            queryset = queryset.filter(price__gt=0)

        return queryset

    def perform_create(self, serializer):
        base_slug = slugify(serializer.validated_data['title']) or 'model'
        slug = base_slug
        suffix = 2
        while Product3D.objects.filter(slug=slug).exists():
            slug = f'{base_slug}-{suffix}'
            suffix += 1
        serializer.save(artist=self.request.user, slug=slug)

    @action(detail=False, methods=['get'], url_path='my')
    def my_products(self, request):
        queryset = self.get_queryset().filter(artist=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(queryset, many=True).data)

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