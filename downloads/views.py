from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from payments.models import OrderItem
from products.models import Product3D

class SecureDownloadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, product_id):
        user = request.user
        
        # Kiểm tra xem user đã có Order dạng 'completed' chứa sản phẩm này chưa
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            order__status='completed',
            product_id=product_id
        ).exists()

        if not has_purchased:
            return Response(
                {'error': 'Bạn chưa mua sản phẩm này hoặc đơn hàng chưa hoàn tất.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            product = Product3D.objects.get(id=product_id)
            if not product.source_file:
                return Response({'error': 'File nguồn chưa sẵn sàng.'}, status=status.HTTP_404_NOT_FOUND)

            download_url = request.build_absolute_uri(product.source_file.url)
            return Response({'download_url': download_url})
        except Product3D.DoesNotExist:
            return Response({'error': 'Sản phẩm không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)