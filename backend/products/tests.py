import tempfile

from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile

from accounts.models import User
from .models import Category, Product3D


class ProductUploadApiTests(APITestCase):
    def setUp(self):
        self.media_dir = tempfile.TemporaryDirectory()
        media_override = override_settings(MEDIA_ROOT=self.media_dir.name)
        media_override.enable()
        self.addCleanup(media_override.disable)
        self.addCleanup(self.media_dir.cleanup)
        self.user = User.objects.create_user(username='artist', password='test-password')
        self.category = Category.objects.get(slug='robo')
        self.client.force_authenticate(user=self.user)

    def test_authenticated_artist_can_upload_to_a_real_category(self):
        response = self.client.post(
            '/api/models/',
            {
                'title': 'Ninja final 2',
                'category': str(self.category.id),
                'description': 'Test model',
                'price': '0',
                'source_file': SimpleUploadedFile(
                    'ninja-final-2.glb',
                    b'glb test content',
                    content_type='model/gltf-binary',
                ),
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        product = Product3D.objects.get(title='Ninja final 2')
        self.assertEqual(product.artist, self.user)
        self.assertEqual(product.category, self.category)
        self.assertEqual(product.slug, 'ninja-final-2')
        self.assertTrue(product.source_file.name.endswith('ninja-final-2.glb'))
        self.assertTrue(product.preview_file.name.endswith('ninja-final-2.glb'))
        self.assertTrue(product.preview_file.storage.exists(product.preview_file.name))
        self.assertTrue(response.data['model_url'].startswith('http://testserver/media/'))
        self.assertEqual(response.data['category'], self.category.id)
        self.assertEqual(response.data['category_name'], self.category.name)

    def test_category_endpoint_returns_database_category_ids_and_names(self):
        response = self.client.get('/api/categories/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        category = next(
            item for item in response.data['results']
            if item['id'] == self.category.id
        )
        self.assertEqual(category['name'], self.category.name)

    def test_product_list_filters_by_the_selected_category_slug(self):
        other_category = Category.objects.create(name='Other category', slug='other-category')
        matching_product = Product3D.objects.create(
            artist=self.user,
            category=self.category,
            title='Matching model',
            slug='matching-model',
            source_file='protected_sources/matching-model.zip',
        )
        other_product = Product3D.objects.create(
            artist=self.user,
            category=other_category,
            title='Other model',
            slug='other-model',
            source_file='protected_sources/other-model.zip',
        )

        response = self.client.get(f'/api/models/?category={self.category.slug}')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        product_ids = {item['id'] for item in results}
        self.assertIn(matching_product.id, product_ids)
        self.assertNotIn(other_product.id, product_ids)

    def test_upload_rejects_a_category_id_that_does_not_exist(self):
        response = self.client.post(
            '/api/models/',
            {
                'title': 'Invalid category model',
                'category': '999999',
                'source_file': SimpleUploadedFile('model.glb', b'glb'),
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
