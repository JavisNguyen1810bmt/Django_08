from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    product_title = serializers.ReadOnlyField(source='product.title')

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_title', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'total_amount', 'status', 'transaction_id', 'items', 'created_at']
        read_only_fields = ['user', 'status', 'transaction_id']