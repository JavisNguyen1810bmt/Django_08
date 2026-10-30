from decimal import Decimal
from decimal import InvalidOperation

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product3D
from .models import Order, OrderItem, Wallet
from .serializers import OrderSerializer


class IsStaffOrSuperuser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.is_superuser)
        )


class WalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        try:
            exchange_rate = Decimal(str(getattr(settings, 'WALLET_USD_TO_VND', '25000')))
        except (InvalidOperation, TypeError, ValueError):
            return Response(
                {'error': 'Cấu hình tỷ giá WALLET_USD_TO_VND không hợp lệ.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        if not exchange_rate.is_finite() or exchange_rate <= 0:
            return Response(
                {'error': 'Cấu hình tỷ giá WALLET_USD_TO_VND phải lớn hơn 0.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        bank_bin = getattr(settings, 'WALLET_BANK_BIN', '')
        bank_account = getattr(settings, 'WALLET_BANK_ACCOUNT', '')
        bank_name = getattr(settings, 'WALLET_BANK_ACCOUNT_NAME', '')
        return Response({
            'balance': wallet.balance,
            'exchange_rate': exchange_rate,
            'bank': {
                'bin': bank_bin,
                'account': bank_account,
                'account_name': bank_name,
            } if bank_bin and bank_account and bank_name else None,
        })


class AdminBuffBalanceView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def post(self, request):
        username = request.data.get('username')
        user_id = request.data.get('user_id')
        if bool(username) == bool(user_id):
            return Response(
                {'error': 'Cần truyền đúng một trong hai trường username hoặc user_id.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            amount = Decimal(str(request.data.get('amount', '')))
        except (InvalidOperation, TypeError, ValueError):
            return Response({'error': 'Số tiền không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)
        max_balance = Decimal('9999999999.99')
        if (
            not amount.is_finite()
            or amount <= 0
            or amount.as_tuple().exponent < -2
            or amount > max_balance
        ):
            return Response(
                {'error': 'Số tiền phải lớn hơn 0 và tối đa có 2 chữ số thập phân.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_model = get_user_model()
        if user_id:
            try:
                user_id = int(user_id)
            except (TypeError, ValueError):
                return Response({'error': 'user_id không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)
            if user_id <= 0:
                return Response({'error': 'user_id không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)
        user_lookup = {'username': username} if username else {'id': user_id}
        target = get_object_or_404(user_model, **user_lookup)
        with transaction.atomic():
            wallet, _ = Wallet.objects.select_for_update().get_or_create(user=target)
            if wallet.balance + amount > max_balance:
                return Response(
                    {'error': 'Số dư sau khi cộng vượt quá giới hạn của ví.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            wallet.balance += amount
            wallet.save(update_fields=['balance', 'updated_at'])

        return Response({
            'username': target.username,
            'balance': wallet.balance,
            'amount_added': amount,
        })


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

        if any(product.artist_id == request.user.id for product in products):
            return Response(
                {'error': 'Bạn không thể mua sản phẩm do chính mình đăng.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not any(product.price > 0 for product in products):
            return Response(
                {'error': 'Không có sản phẩm trả phí trong yêu cầu mua hàng.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        total_amount = sum((p.price for p in products), start=Decimal('0.00'))
        with transaction.atomic():
            wallet, _ = Wallet.objects.select_for_update().get_or_create(user=request.user)
            already_owned = OrderItem.objects.filter(
                order__user=request.user,
                order__status='completed',
                product__in=products,
            ).exists()
            if already_owned:
                return Response(
                    {'error': 'Bạn đã sở hữu một hoặc nhiều sản phẩm trong yêu cầu.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if wallet.balance < total_amount:
                shortfall = total_amount - wallet.balance
                return Response({
                    'code': 'insufficient_balance',
                    'error': 'Số dư ví không đủ để thanh toán.',
                    'current_balance': wallet.balance,
                    'required_amount': total_amount,
                    'shortfall': shortfall,
                    'username': request.user.username,
                }, status=status.HTTP_402_PAYMENT_REQUIRED)
            wallet.balance -= total_amount
            wallet.save(update_fields=['balance', 'updated_at'])

            order = Order.objects.create(
                user=request.user,
                total_amount=total_amount,
                status='completed',
                transaction_id=f'wallet-{request.user.id}',
            )

            OrderItem.objects.bulk_create([
                OrderItem(order=order, product=product, price=product.price)
                for product in products
            ])

        serializer = self.get_serializer(order)
        return Response({
            **serializer.data,
            'wallet_balance': wallet.balance,
        }, status=status.HTTP_201_CREATED)

class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')