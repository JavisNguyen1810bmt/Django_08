from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from payments.models import OrderItem
from products.models import Product3D
from .models import Download
from .serializers import DownloadSerializer


class DownloadHistoryView(generics.ListAPIView):
    serializer_class = DownloadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Download.objects.filter(user=self.request.user).select_related('product')

class SecureDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, product_id):
        user = request.user
        product = get_object_or_404(Product3D, id=product_id, is_active=True)
        is_artist = product.artist_id == user.id
        has_purchased = product.price <= 0 or OrderItem.objects.filter(
            order__user=user,
            order__status='completed',
            product=product,
        ).exists()

        if not is_artist and not has_purchased:
            return Response(
                {'error': 'Bạn cần mua sản phẩm này trước khi tải xuống.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not product.source_file:
            return Response({'error': 'File nguồn chưa sẵn sàng.'}, status=status.HTTP_404_NOT_FOUND)

        Download.objects.create(user=user, product=product)
        download_url = request.build_absolute_uri(product.source_file.url)
        return Response({'download_url': download_url})