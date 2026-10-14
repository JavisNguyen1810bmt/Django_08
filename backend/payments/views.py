from django.db import transaction
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
        if not isinstance(product_ids, list) or not product_ids:
            return Response({'error': 'No products provided'}, status=status.HTTP_400_BAD_REQUEST)

        product_ids = list(dict.fromkeys(product_ids))
        products = list(Product3D.objects.filter(id__in=product_ids, is_active=True))
        if len(products) != len(product_ids):
            return Response({'error': 'One or more products do not exist.'}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = sum((p.price for p in products), start=0)
        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                total_amount=total_amount,
                status='completed'
            )

            OrderItem.objects.bulk_create([
                OrderItem(order=order, product=product, price=product.price)
                for product in products
            ])

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')