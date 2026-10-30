from decimal import Decimal

from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from payments.models import Order, OrderItem, Wallet
from products.models import Category, Product3D


class CheckoutApiTests(APITestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(username='buyer', password='test-password')
        self.artist = User.objects.create_user(username='artist', password='test-password')
        category = Category.objects.create(name='Test category', slug='test-category')
        self.product = Product3D.objects.create(
            artist=self.artist,
            category=category,
            title='Paid model',
            slug='paid-model',
            price=Decimal('9.00'),
            source_file='protected_sources/paid-model.zip',
        )
        self.wallet = Wallet.objects.get(user=self.buyer)
        self.client.force_authenticate(user=self.buyer)

    def test_checkout_records_completed_purchase(self):
        self.wallet.balance = Decimal('20.00')
        self.wallet.save(update_fields=['balance'])
        response = self.client.post(
            '/api/payments/checkout/',
            {'product_ids': [self.product.id]},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        order = Order.objects.get(id=response.data['id'])
        self.assertEqual(order.status, 'completed')
        self.assertEqual(order.total_amount, Decimal('9.00'))
        self.assertTrue(OrderItem.objects.filter(order=order, product=self.product).exists())
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal('11.00'))
        self.assertEqual(response.data['wallet_balance'], Decimal('11.00'))

    def test_checkout_rejects_insufficient_balance_without_creating_order(self):
        self.wallet.balance = Decimal('2.00')
        self.wallet.save(update_fields=['balance'])

        response = self.client.post(
            '/api/payments/checkout/',
            {'product_ids': [self.product.id]},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_402_PAYMENT_REQUIRED)
        self.assertEqual(response.data['code'], 'insufficient_balance')
        self.assertEqual(response.data['shortfall'], Decimal('7.00'))
        self.assertFalse(Order.objects.filter(user=self.buyer).exists())
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal('2.00'))

    def test_new_users_receive_a_wallet_automatically(self):
        user = User.objects.create_user(username='new-user', password='test-password')

        self.assertTrue(Wallet.objects.filter(user=user, balance=Decimal('0.00')).exists())

    def test_checkout_rejects_free_product(self):
        self.product.price = Decimal('0.00')
        self.product.save(update_fields=['price'])

        response = self.client.post(
            '/api/payments/checkout/',
            {'product_ids': [self.product.id]},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_wallet_endpoint_returns_current_balance(self):
        response = self.client.get('/api/payments/wallet/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['balance'], Decimal('0.00'))
        self.assertIsNone(response.data['bank'])

    @override_settings(
        WALLET_BANK_BIN='970422',
        WALLET_BANK_ACCOUNT='test-account',
        WALLET_BANK_ACCOUNT_NAME='Test Owner',
    )
    def test_wallet_endpoint_returns_configured_transfer_details(self):
        response = self.client.get('/api/payments/wallet/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bank'], {
            'bin': '970422',
            'account': 'test-account',
            'account_name': 'Test Owner',
        })

    def test_account_profile_includes_wallet_balance_and_admin_flags(self):
        response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['wallet_balance'], Decimal('0.00'))
        self.assertFalse(response.data['is_staff'])
        self.assertFalse(response.data['is_superuser'])

    def test_non_admin_cannot_buff_a_wallet(self):
        response = self.client.post(
            '/api/payments/admin-buff-balance/',
            {'username': self.buyer.username, 'amount': '50'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal('0.00'))

    def test_admin_can_buff_a_wallet(self):
        admin = User.objects.create_user(
            username='admin-user',
            password='test-password',
            is_staff=True,
        )
        self.client.force_authenticate(user=admin)

        response = self.client.post(
            '/api/payments/admin-buff-balance/',
            {'username': self.buyer.username, 'amount': '50'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal('50.00'))
