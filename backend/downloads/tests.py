from decimal import Decimal

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from payments.models import Order, OrderItem
from products.models import Category, Product3D
from .models import Download


class DownloadApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='buyer', password='test-password')
        self.other_user = User.objects.create_user(username='other', password='test-password')
        self.category = Category.objects.create(name='Test category', slug='test-category')
        self.product = Product3D.objects.create(
            artist=self.other_user,
            category=self.category,
            title='Test model',
            slug='test-model',
            price=Decimal('4.00'),
            source_file='protected_sources/test-model.zip',
        )
        self.client.force_authenticate(user=self.user)

    def test_history_only_returns_the_current_users_downloads(self):
        Download.objects.create(user=self.user, product=self.product)
        Download.objects.create(user=self.other_user, product=self.product)

        response = self.client.get('/api/downloads/history/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['product_title'], 'Test model')

    def test_download_requires_a_completed_purchase(self):
        response = self.client.get(f'/api/downloads/{self.product.id}/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Download.objects.filter(user=self.user, product=self.product).exists())

    def test_completed_purchase_returns_the_file_and_records_download(self):
        order = Order.objects.create(
            user=self.user,
            total_amount=self.product.price,
            status='completed',
        )
        OrderItem.objects.create(order=order, product=self.product, price=self.product.price)

        response = self.client.get(f'/api/downloads/{self.product.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('download_url', response.data)
        self.assertTrue(Download.objects.filter(user=self.user, product=self.product).exists())
