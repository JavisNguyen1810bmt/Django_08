from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Order, OrderItem
from .serializers import OrderSerializer
from products.models import Product3D

class CreateOrderView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        product_ids = request.data.get('product_ids', [])
        if not product_ids:
            return Response({'error': 'No products provided'}, status=status.HTTP_400_BAD_REQUEST)

        products = Product3D.objects.filter(id__in=product_ids)
        total_amount = sum(p.price for p in products)

        order = Order.objects.create(
            user=request.user,
            total_amount=total_amount,
            status='completed'  # Tạm thời để completed mô phỏng mua hàng thành công
        )

        for p in products:
            OrderItem.objects.create(order=order, product=p, price=p.price)

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')